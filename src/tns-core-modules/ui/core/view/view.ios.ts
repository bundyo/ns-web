// Definitions.
import { Point, View as ViewDefinition, dip } from ".";
import { ViewBase } from "../view-base";
import { booleanConverter, Property } from "../view";

import {
    ViewCommon, layout, isEnabledProperty, originXProperty, originYProperty, automationTextProperty, isUserInteractionEnabledProperty,
    traceEnabled, traceWrite, traceCategories, traceError, traceMessageType, getAncestor
} from "./view-common";

import { ios as iosBackground, Background } from "../../styling/background";
import { ios as iosUtils } from "../../../utils/utils";
import {
    Visibility,
    visibilityProperty, opacityProperty,
    rotateProperty, scaleXProperty, scaleYProperty,
    translateXProperty, translateYProperty, zIndexProperty,
    backgroundInternalProperty, clipPathProperty
} from "../../styling/style-properties";
import { profile } from "../../../profiling";

export * from "./view-common";

const PFLAG_FORCE_LAYOUT = 1;
const PFLAG_MEASURED_DIMENSION_SET = 1 << 1;
const PFLAG_LAYOUT_REQUIRED = 1 << 2;

const majorVersion = iosUtils.MajorVersion;

export class View extends ViewCommon {
    nativeViewProtected: UIView;
    viewController: UIViewController;

    private _isLaidOut = false;
    private _hasTransfrom = false;
    private _privateFlags: number = PFLAG_LAYOUT_REQUIRED | PFLAG_FORCE_LAYOUT;
    private _cachedFrame: CGRect;
    private _suspendCATransaction = false;
    /**
     * Native background states.
     *  - `unset` - is the default, from this state it transitions to "invalid" in the base backgroundInternalProperty.setNative, overriding it without calling `super` will prevent the background from ever being drawn.
     *  - `invalid` - the view background must be redrawn on the next layot.
     *  - `drawn` - the view background has been property drawn, on subsequent layouts it may need to be redrawn if the background depends on the view's size.
     */
    _nativeBackgroundState: "unset" | "invalid" | "drawn";

    get isLayoutRequired(): boolean {
        return (this._privateFlags & PFLAG_LAYOUT_REQUIRED) === PFLAG_LAYOUT_REQUIRED;
    }

    get isLayoutRequested(): boolean {
        return (this._privateFlags & PFLAG_FORCE_LAYOUT) === PFLAG_FORCE_LAYOUT;
    }

    public requestLayout(): void {
        super.requestLayout();
        this._privateFlags |= PFLAG_FORCE_LAYOUT;

        const nativeView = this.nativeViewProtected;
        if (nativeView) {
            nativeView.setNeedsLayout();
        }

        if (this.viewController && this.viewController.view !== nativeView) {
            this.viewController.view.setNeedsLayout();
        }
    }

    public measure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        let measureSpecsChanged = this._setCurrentMeasureSpecs(widthMeasureSpec, heightMeasureSpec);
        let forceLayout = (this._privateFlags & PFLAG_FORCE_LAYOUT) === PFLAG_FORCE_LAYOUT;
        if (forceLayout || measureSpecsChanged) {
            // first clears the measured dimension flag
            this._privateFlags &= ~PFLAG_MEASURED_DIMENSION_SET;

            // measure ourselves, this should set the measured dimension flag back
            this.onMeasure(widthMeasureSpec, heightMeasureSpec);
            this._privateFlags |= PFLAG_LAYOUT_REQUIRED;

            // flag not set, setMeasuredDimension() was not invoked, we raise
            // an exception to warn the developer
            if ((this._privateFlags & PFLAG_MEASURED_DIMENSION_SET) !== PFLAG_MEASURED_DIMENSION_SET) {
                throw new Error("onMeasure() did not set the measured dimension by calling setMeasuredDimension() " + this);
            }
        }
    }

    @profile
    public layout(left: number, top: number, right: number, bottom: number, setFrame = true): void {
        const { boundsChanged, sizeChanged } = this._setCurrentLayoutBounds(left, top, right, bottom);
        if (setFrame) {
            this.layoutNativeView(left, top, right, bottom);
        }

        if (boundsChanged || (this._privateFlags & PFLAG_LAYOUT_REQUIRED) === PFLAG_LAYOUT_REQUIRED) {
            let position = { left, top, right, bottom };
            if (this.nativeViewProtected && majorVersion > 10) {
                // on iOS 11+ it is possible to have a changed layout frame due to safe area insets
                // get the frame and adjust the position, so that onLayout works correctly
                const frame = this.nativeViewProtected.frame;
                position = ios.getPositionFromFrame(frame);
            }

            this.onLayout(position.left, position.top, position.right, position.bottom);
            this._privateFlags &= ~PFLAG_LAYOUT_REQUIRED;
        }

        this.updateBackground(sizeChanged);
        this._privateFlags &= ~PFLAG_FORCE_LAYOUT;
    }

    private updateBackground(sizeChanged: boolean): void {
        if (sizeChanged) {
            this._onSizeChanged();
        } else if (this._nativeBackgroundState === "invalid") {
            const background = this.style.backgroundInternal;
            this._redrawNativeBackground(background);
        }
    }

    public setMeasuredDimension(measuredWidth: number, measuredHeight: number): void {
        super.setMeasuredDimension(measuredWidth, measuredHeight);
        this._privateFlags |= PFLAG_MEASURED_DIMENSION_SET;
    }

    @profile
    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        const view = this.nativeViewProtected;
        const width = layout.getMeasureSpecSize(widthMeasureSpec);
        const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

        const height = layout.getMeasureSpecSize(heightMeasureSpec);
        const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

        let nativeWidth = 0;
        let nativeHeight = 0;
        if (view) {
            const nativeSize = layout.measureNativeView(view, width, widthMode, height, heightMode);
            nativeWidth = nativeSize.width;
            nativeHeight = nativeSize.height;
        }

        const measureWidth = Math.max(nativeWidth, this.effectiveMinWidth);
        const measureHeight = Math.max(nativeHeight, this.effectiveMinHeight);

        const widthAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
        const heightAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        // 
    }

    public _setNativeViewFrame(nativeView: UIView, frame: CGRect): void {
        if (!CGRectEqualToRect(nativeView.frame, frame)) {
            if (traceEnabled()) {
                traceWrite(this + " :_setNativeViewFrame: " + JSON.stringify(ios.getPositionFromFrame(frame)), traceCategories.Layout);
            }
            this._cachedFrame = frame;
            if (this._hasTransfrom) {
                // Always set identity transform before setting frame;
                const transform = nativeView.transform;
                nativeView.transform = CGAffineTransformIdentity;
                nativeView.frame = frame;
                nativeView.transform = transform;
            } else {
                nativeView.frame = frame;
            }

            const adjustedFrame = this.applySafeAreaInsets(frame);
            if (adjustedFrame) {
                nativeView.frame = adjustedFrame;
            }

            const boundsOrigin = nativeView.bounds.origin;
            const boundsFrame = adjustedFrame || frame;
            nativeView.bounds = CGRectMake(boundsOrigin.x, boundsOrigin.y, boundsFrame.size.width, boundsFrame.size.height);

            this._raiseLayoutChangedEvent();
            this._isLaidOut = true;
        } else if (!this._isLaidOut) {
            // Rects could be equal on the first layout and an event should be raised.
            this._raiseLayoutChangedEvent();
        }
    }

    get isLayoutValid(): boolean {
        if (this.nativeViewProtected) {
            return this._isLayoutValid;
        }

        return false;
    }

    public layoutNativeView(left: number, top: number, right: number, bottom: number): void {
        if (!this.nativeViewProtected) {
            return;
        }

        const nativeView = this.nativeViewProtected;
        const frame = ios.getFrameFromPosition({ left, top, right, bottom });
        this._setNativeViewFrame(nativeView, frame);
    }

    public _setLayoutFlags(left: number, top: number, right: number, bottom: number): void {
        const width = right - left;
        const height = bottom - top;
        const widthSpec = layout.makeMeasureSpec(width, layout.EXACTLY);
        const heightSpec = layout.makeMeasureSpec(height, layout.EXACTLY);
        this._setCurrentMeasureSpecs(widthSpec, heightSpec);
        this._privateFlags &= ~PFLAG_FORCE_LAYOUT;
        this.setMeasuredDimension(width, height);

        const { sizeChanged } = this._setCurrentLayoutBounds(left, top, right, bottom);
        this.updateBackground(sizeChanged);
        this._privateFlags &= ~PFLAG_LAYOUT_REQUIRED;
        // NOTE: if there is transformation this frame will be incorrect.
        this._cachedFrame = this.nativeViewProtected.frame;
    }

    public focus(): boolean {
        if (this.ios) {
            return this.ios.becomeFirstResponder();
        }

        return false;
    }

    protected applySafeAreaInsets(frame: CGRect): CGRect {
        if (majorVersion <= 10) {
            return null;
        }

        if (!this.iosOverflowSafeArea) {
            return ios.shrinkToSafeArea(this, frame);
        } else if (this.nativeViewProtected && this.nativeViewProtected.window) {
            return ios.expandBeyondSafeArea(this, frame);
        }

        return null;
    }

    public getSafeAreaInsets(): { left, top, right, bottom } {
        const safeAreaInsets = this.nativeViewProtected && this.nativeViewProtected.safeAreaInsets;
        let insets = { left: 0, top: 0, right: 0, bottom: 0 };

        if (safeAreaInsets) {
            insets.left = layout.round(layout.toDevicePixels(safeAreaInsets.left));
            insets.top = layout.round(layout.toDevicePixels(safeAreaInsets.top));
            insets.right = layout.round(layout.toDevicePixels(safeAreaInsets.right));
            insets.bottom = layout.round(layout.toDevicePixels(safeAreaInsets.bottom));
        }

        return insets;
    }

    public getLocationInWindow(): Point {
        if (!this.nativeViewProtected || !this.nativeViewProtected.window) {
            return undefined;
        }

        const pointInWindow = this.nativeViewProtected.convertPointToView(this.nativeViewProtected.bounds.origin, null);
        return {
            x: pointInWindow.x,
            y: pointInWindow.y
        };
    }

    public getLocationOnScreen(): Point {
        if (!this.nativeViewProtected || !this.nativeViewProtected.window) {
            return undefined;
        }

        const pointInWindow = this.nativeViewProtected.convertPointToView(this.nativeViewProtected.bounds.origin, null);
        const pointOnScreen = this.nativeViewProtected.window.convertPointToWindow(pointInWindow, null);
        return {
            x: pointOnScreen.x,
            y: pointOnScreen.y
        };
    }

    public getLocationRelativeTo(otherView: ViewDefinition): Point {
        if (!this.nativeViewProtected || !this.nativeViewProtected.window ||
            !otherView.nativeViewProtected || !otherView.nativeViewProtected.window ||
            this.nativeViewProtected.window !== otherView.nativeViewProtected.window) {
            return undefined;
        }

        const myPointInWindow = this.nativeViewProtected.convertPointToView(this.nativeViewProtected.bounds.origin, null);
        const otherPointInWindow = otherView.nativeViewProtected.convertPointToView(otherView.nativeViewProtected.bounds.origin, null);
        return {
            x: myPointInWindow.x - otherPointInWindow.x,
            y: myPointInWindow.y - otherPointInWindow.y
        };
    }

    private _onSizeChanged(): void {
        const nativeView = this.nativeViewProtected;
        if (!nativeView) {
            return;
        }

        const background = this.style.backgroundInternal;
        const backgroundDependsOnSize = background.image
            || !background.hasUniformBorder()
            || background.hasBorderRadius();

        if (this._nativeBackgroundState === "invalid" || (this._nativeBackgroundState === "drawn" && backgroundDependsOnSize)) {
            this._redrawNativeBackground(background);
        }

        const clipPath = this.style.clipPath;
        if (clipPath !== "" && this[clipPathProperty.setNative]) {
            this[clipPathProperty.setNative](clipPath);
        }
    }

    public updateNativeTransform() {
        const scaleX = this.scaleX || 1e-6;
        const scaleY = this.scaleY || 1e-6;
        const rotate = this.rotate || 0;
        let newTransform = CGAffineTransformIdentity;
        newTransform = CGAffineTransformTranslate(newTransform, this.translateX, this.translateY);
        newTransform = CGAffineTransformRotate(newTransform, rotate * Math.PI / 180);
        newTransform = CGAffineTransformScale(newTransform, scaleX, scaleY);
        if (!CGAffineTransformEqualToTransform(this.nativeViewProtected.transform, newTransform)) {
            const updateSuspended = this._isPresentationLayerUpdateSuspeneded();
            if (!updateSuspended) {
                CATransaction.begin();
            }
            this.nativeViewProtected.transform = newTransform;
            this._hasTransfrom = this.nativeViewProtected && !CGAffineTransformEqualToTransform(this.nativeViewProtected.transform, CGAffineTransformIdentity);
            if (!updateSuspended) {
                CATransaction.commit();
            }
        }
    }

    public updateOriginPoint(originX: number, originY: number) {
        const newPoint = CGPointMake(originX, originY);
        this.nativeViewProtected.layer.anchorPoint = newPoint;
        if (this._cachedFrame) {
            this._setNativeViewFrame(this.nativeViewProtected, this._cachedFrame);
        }
    }

    // By default we update the view's presentation layer when setting backgroundColor and opacity properties.
    // This is done by calling CATransaction begin and commit methods.
    // This action should be disabled when updating those properties during an animation.
    public _suspendPresentationLayerUpdates() {
        this._suspendCATransaction = true;
    }

    public _resumePresentationLayerUpdates() {
        this._suspendCATransaction = false;
    }

    public _isPresentationLayerUpdateSuspeneded() {
        return this._suspendCATransaction || this._suspendNativeUpdatesCount;
    }

    protected _showNativeModalView(parent: View, context: any, closeCallback: Function, fullscreen?: boolean, animated?: boolean, stretched?: boolean) {
        const parentWithController = ios.getParentWithViewController(parent);
        if (!parentWithController) {
            traceWrite(`Could not find parent with viewController for ${parent} while showing modal view.`,
                traceCategories.ViewHierarchy, traceMessageType.error)
            return;
        }

        const parentController = parentWithController.viewController;
        if (!parentController.view || !parentController.view.window) {
            traceWrite("Parent page is not part of the window hierarchy. Close the current modal page before showing another one!",
                traceCategories.ViewHierarchy, traceMessageType.error);
            return;
        }

        this._setupAsRootView({});

        super._showNativeModalView(parentWithController, context, closeCallback, fullscreen, stretched);
        let controller = this.viewController;
        if (!controller) {
            const nativeView = this.ios || this.nativeViewProtected;
            controller = ios.UILayoutViewController.initWithOwner(new WeakRef(this));

            if (nativeView instanceof UIView) {
                controller.view.addSubview(nativeView);
            }

            this.viewController = controller;
        }

        if (fullscreen) {
            controller.modalPresentationStyle = UIModalPresentationStyle.FullScreen;
        } else {
            controller.modalPresentationStyle = UIModalPresentationStyle.FormSheet;
        }

        this.horizontalAlignment = "stretch";
        this.verticalAlignment = "stretch";

        this._raiseShowingModallyEvent();
        animated = animated === undefined ? true : !!animated;
        (<any>controller).animated = animated;
        parentController.presentViewControllerAnimatedCompletion(controller, animated, null);
        const transitionCoordinator = iosUtils.getter(parentController, parentController.transitionCoordinator);
        if (transitionCoordinator) {
            UIViewControllerTransitionCoordinator.prototype.animateAlongsideTransitionCompletion
                .call(transitionCoordinator, null, () => this._raiseShownModallyEvent());
        } else {
            // Apparently iOS 9+ stops all transitions and animations upon application suspend and transitionCoordinator becomes null here in this case.
            // Since we are not waiting for any transition to complete, i.e. transitionCoordinator is null, we can directly raise our shownModally event.
            // Take a look at https://github.com/NativeScript/NativeScript/issues/2173 for more info and a sample project.
            this._raiseShownModallyEvent();
        }
    }

    protected _hideNativeModalView(parent: View) {
        if (!parent || !parent.viewController) {
            traceError("Trying to hide modal view but no parent with viewController specified.")
            return;
        }

        const parentController = parent.viewController;
        const animated = (<any>this.viewController).animated;

        super._hideNativeModalView(parent);
        parentController.dismissModalViewControllerAnimated(animated);
    }

    [isEnabledProperty.getDefault](): boolean {
        const nativeView = this.nativeViewProtected;
        return nativeView instanceof UIControl ? nativeView.enabled : true;
    }
    [isEnabledProperty.setNative](value: boolean) {
        const nativeView = this.nativeViewProtected;
        if (nativeView instanceof UIControl) {
            nativeView.enabled = value;
        }
    }

    [originXProperty.getDefault](): number {
        return this.nativeViewProtected.layer.anchorPoint.x;
    }
    [originXProperty.setNative](value: number) {
        this.updateOriginPoint(value, this.originY);
    }

    [originYProperty.getDefault](): number {
        return this.nativeViewProtected.layer.anchorPoint.y;
    }
    [originYProperty.setNative](value: number) {
        this.updateOriginPoint(this.originX, value);
    }

    [automationTextProperty.getDefault](): string {
        return this.nativeViewProtected.accessibilityLabel;
    }
    [automationTextProperty.setNative](value: string) {
        this.nativeViewProtected.accessibilityIdentifier = value;
        this.nativeViewProtected.accessibilityLabel = value;
    }

    [isUserInteractionEnabledProperty.getDefault](): boolean {
        return this.nativeViewProtected.userInteractionEnabled;
    }
    [isUserInteractionEnabledProperty.setNative](value: boolean) {
        this.nativeViewProtected.userInteractionEnabled = value;
    }

    [visibilityProperty.getDefault](): Visibility {
        return this.nativeViewProtected.hidden ? Visibility.COLLAPSE : Visibility.VISIBLE;
    }
    [visibilityProperty.setNative](value: Visibility) {
        switch (value) {
            case Visibility.VISIBLE:
                this.nativeViewProtected.hidden = false;
                break;
            case Visibility.HIDDEN:
            case Visibility.COLLAPSE:
                this.nativeViewProtected.hidden = true;
                break;
            default:
                throw new Error(`Invalid visibility value: ${value}. Valid values are: "${Visibility.VISIBLE}", "${Visibility.HIDDEN}", "${Visibility.COLLAPSE}".`);
        }
    }

    [opacityProperty.getDefault](): number {
        return this.nativeViewProtected.alpha;
    }
    [opacityProperty.setNative](value: number) {
        let nativeView = this.nativeViewProtected;
        let updateSuspended = this._isPresentationLayerUpdateSuspeneded();
        if (!updateSuspended) {
            CATransaction.begin();
        }
        nativeView.alpha = value;
        if (!updateSuspended) {
            CATransaction.commit();
        }
    }

    [rotateProperty.getDefault](): number {
        return 0;
    }
    [rotateProperty.setNative](value: number) {
        this.updateNativeTransform();
    }

    [scaleXProperty.getDefault](): number {
        return 1;
    }
    [scaleXProperty.setNative](value: number) {
        this.updateNativeTransform();
    }

    [scaleYProperty.getDefault](): number {
        return 1;
    }
    [scaleYProperty.setNative](value: number) {
        this.updateNativeTransform();
    }

    [translateXProperty.getDefault](): dip {
        return 0;
    }
    [translateXProperty.setNative](value: dip) {
        this.updateNativeTransform();
    }

    [translateYProperty.getDefault](): dip {
        return 0;
    }
    [translateYProperty.setNative](value: dip) {
        this.updateNativeTransform();
    }

    [zIndexProperty.getDefault](): number {
        return 0;
    }
    [zIndexProperty.setNative](value: number) {
        this.nativeViewProtected.layer.zPosition = value;
    }

    [backgroundInternalProperty.getDefault](): UIColor {
        return this.nativeViewProtected.backgroundColor;
    }
    [backgroundInternalProperty.setNative](value: UIColor | Background) {
        this._nativeBackgroundState = "invalid";
        if (this.isLayoutValid) {
            this._redrawNativeBackground(value);
        }
    }

    _getCurrentLayoutBounds(): { left: number; top: number; right: number; bottom: number } {
        const nativeView = this.nativeViewProtected;
        if (nativeView && !this.isCollapsed) {
            const frame = nativeView.frame;
            const origin = frame.origin;
            const size = frame.size;
            return {
                left: Math.round(layout.toDevicePixels(origin.x)),
                top: Math.round(layout.toDevicePixels(origin.y)),
                right: Math.round(layout.toDevicePixels(origin.x + size.width)),
                bottom: Math.round(layout.toDevicePixels(origin.y + size.height))
            };
        } else {
            return { left: 0, top: 0, right: 0, bottom: 0 };
        }
    }

    _redrawNativeBackground(value: UIColor | Background): void {
        let updateSuspended = this._isPresentationLayerUpdateSuspeneded();
        if (!updateSuspended) {
            CATransaction.begin();
        }

        if (value instanceof UIColor) {
            this.nativeViewProtected.backgroundColor = value;
        } else {
            iosBackground.createBackgroundUIColor(this, (color: UIColor) => {
                this.nativeViewProtected.backgroundColor = color;
            });
            this._setNativeClipToBounds();
        }

        if (!updateSuspended) {
            CATransaction.commit();
        }

        this._nativeBackgroundState = "drawn";
    }

    _setNativeClipToBounds() {
        const backgroundInternal = this.style.backgroundInternal;
        this.nativeViewProtected.clipsToBounds =
            this.nativeViewProtected instanceof UIScrollView ||
            backgroundInternal.hasBorderWidth() ||
            backgroundInternal.hasBorderRadius();
    }
}
View.prototype._nativeBackgroundState = "unset";

export class ContainerView extends View {

    public iosOverflowSafeArea: boolean;

    constructor() {
        super();
        this.iosOverflowSafeArea = true;
    }
}

export class CustomLayoutView extends ContainerView {

    nativeViewProtected: UIView;

    createNativeView() {
        return UIView.alloc().initWithFrame(iosUtils.getter(UIScreen, UIScreen.mainScreen).bounds);
    }

    get ios(): UIView {
        return this.nativeViewProtected;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        // Don't call super because it will set MeasureDimension. This method must be overriden and calculate its measuredDimensions.
    }

    public _addViewToNativeVisualTree(child: View, atIndex: number): boolean {
        super._addViewToNativeVisualTree(child, atIndex);

        const parentNativeView = this.nativeViewProtected;
        const childNativeView = child.nativeViewProtected;

        if (parentNativeView && childNativeView) {
            if (typeof atIndex !== "number" || atIndex >= parentNativeView.subviews.count) {
                parentNativeView.addSubview(childNativeView);
            } else {
                parentNativeView.insertSubviewAtIndex(childNativeView, atIndex);
            }

            return true;
        }

        return false;
    }

    public _removeViewFromNativeVisualTree(child: View): void {
        super._removeViewFromNativeVisualTree(child);

        if (child.nativeViewProtected) {
            child.nativeViewProtected.removeFromSuperview();
        }
    }
}

export namespace ios {
    export function getParentWithViewController(view: View): View {
        while (view && !view.viewController) {
            view = view.parent as View;
        }

        // Note: Might return undefined if no parent with viewController is found
        return view;
    }

    export function updateAutoAdjustScrollInsets(controller: UIViewController, owner: View): void {
        if (majorVersion <= 10) {
            owner._automaticallyAdjustsScrollViewInsets = false;
            // This API is deprecated, but has no alternative for <= iOS 10
            // Defaults to true and results to appliyng the insets twice together with our logic
            // for iOS 11+ we use the contentInsetAdjustmentBehavior property in scrollview
            // https://developer.apple.com/documentation/uikit/uiviewcontroller/1621372-automaticallyadjustsscrollviewin
            controller.automaticallyAdjustsScrollViewInsets = false;
        }
    }

    export function updateConstraints(controller: UIViewController, owner: View): void {
        if (majorVersion <= 10) {
            const layoutGuide = initLayoutGuide(controller);
            (<any>controller.view).safeAreaLayoutGuide = layoutGuide;
        }
    }

    function initLayoutGuide(controller: UIViewController) {
        const rootView = controller.view;
        const layoutGuide = UILayoutGuide.alloc().init();
        rootView.addLayoutGuide(layoutGuide);
        NSLayoutConstraint.activateConstraints(<any>[
            layoutGuide.topAnchor.constraintEqualToAnchor(controller.topLayoutGuide.bottomAnchor),
            layoutGuide.bottomAnchor.constraintEqualToAnchor(controller.bottomLayoutGuide.topAnchor),
            layoutGuide.leadingAnchor.constraintEqualToAnchor(rootView.leadingAnchor),
            layoutGuide.trailingAnchor.constraintEqualToAnchor(rootView.trailingAnchor)
        ]);
        return layoutGuide;
    }

    export function layoutView(controller: UIViewController, owner: View): void {
        // apply parent page additional top insets if any. The scenario is when there is a parent page with action bar.
        const parentPage = getAncestor(owner, "Page");
        if (parentPage) {
            const parentPageInsetsTop = parentPage.viewController.view.safeAreaInsets.top;
            const currentInsetsTop = controller.view.safeAreaInsets.top;
            const additionalInsetsTop = parentPageInsetsTop - currentInsetsTop;

            if (additionalInsetsTop > 0) {
                const additionalInsets = new UIEdgeInsets({ top: additionalInsetsTop, left: 0, bottom: 0, right: 0 });
                controller.additionalSafeAreaInsets = additionalInsets;
            }
        }

        let layoutGuide = controller.view.safeAreaLayoutGuide;
        if (!layoutGuide) {
            traceWrite(`safeAreaLayoutGuide during layout of ${owner}. Creating fallback constraints, but layout might be wrong.`,
                traceCategories.Layout, traceMessageType.error);

            layoutGuide = initLayoutGuide(controller);
        }
        const safeArea = layoutGuide.layoutFrame;
        let position = ios.getPositionFromFrame(safeArea);
        const safeAreaSize = safeArea.size;

        const hasChildViewControllers = controller.childViewControllers.count > 0;
        if (hasChildViewControllers) {
            const fullscreen = controller.view.frame;
            position = ios.getPositionFromFrame(fullscreen);
        }

        const safeAreaWidth = layout.round(layout.toDevicePixels(safeAreaSize.width));
        const safeAreaHeight = layout.round(layout.toDevicePixels(safeAreaSize.height));

        const widthSpec = layout.makeMeasureSpec(safeAreaWidth, layout.EXACTLY);
        const heightSpec = layout.makeMeasureSpec(safeAreaHeight, layout.EXACTLY);

        View.measureChild(null, owner, widthSpec, heightSpec);
        View.layoutChild(null, owner, position.left, position.top, position.right, position.bottom);

        layoutParent(owner.parent);
    }

    export function getPositionFromFrame(frame: CGRect): { left, top, right, bottom } {
        const left = layout.round(layout.toDevicePixels(frame.origin.x));
        const top = layout.round(layout.toDevicePixels(frame.origin.y));
        const right = layout.round(layout.toDevicePixels(frame.origin.x + frame.size.width));
        const bottom = layout.round(layout.toDevicePixels(frame.origin.y + frame.size.height));

        return { left, right, top, bottom };
    }

    export function getFrameFromPosition(position: { left, top, right, bottom }, insets?: { left, top, right, bottom }): CGRect {
        insets = insets || { left: 0, top: 0, right: 0, bottom: 0 };

        const left = layout.toDeviceIndependentPixels(position.left + insets.left);
        const top = layout.toDeviceIndependentPixels(position.top + insets.top);
        const width = layout.toDeviceIndependentPixels(position.right - position.left - insets.left - insets.right);
        const height = layout.toDeviceIndependentPixels(position.bottom - position.top - insets.top - insets.bottom);

        return CGRectMake(left, top, width, height);
    }

    export function shrinkToSafeArea(view: View, frame: CGRect): CGRect {
        const insets = view.getSafeAreaInsets();
        if (insets.left || insets.top) {
            const position = ios.getPositionFromFrame(frame);
            const adjustedFrame = ios.getFrameFromPosition(position, insets);

            if (traceEnabled()) {
                traceWrite(this + " :shrinkToSafeArea: " + JSON.stringify(ios.getPositionFromFrame(adjustedFrame)), traceCategories.Layout);
            }

            return adjustedFrame;
        }
        return null;
    }

    export function expandBeyondSafeArea(view: View, frame: CGRect): CGRect {
        const locationInWindow = view.getLocationInWindow();
        const inWindowLeft = layout.round(layout.toDevicePixels(locationInWindow.x));
        const inWindowTop = layout.round(layout.toDevicePixels(locationInWindow.y));
        const inWindowRight = inWindowLeft + layout.round(layout.toDevicePixels(frame.size.width));
        const inWindowBottom = inWindowTop + layout.round(layout.toDevicePixels(frame.size.height));

        const availableSpace = getAvailableSpaceFromParent(view);
        const safeArea = availableSpace.safeArea;
        const fullscreen = availableSpace.fullscreen;

        const position = ios.getPositionFromFrame(frame);
        const safeAreaPosition = ios.getPositionFromFrame(safeArea);
        const fullscreenPosition = ios.getPositionFromFrame(fullscreen);

        const adjustedPosition = position;

        if (position.left && inWindowLeft <= safeAreaPosition.left) {
            adjustedPosition.left = fullscreenPosition.left;
        }

        if (position.top && inWindowTop <= safeAreaPosition.top) {
            adjustedPosition.top = fullscreenPosition.top;
        }

        if (inWindowRight < fullscreenPosition.right && inWindowRight >= safeAreaPosition.right + fullscreenPosition.left) {
            adjustedPosition.right = fullscreenPosition.right - fullscreenPosition.left;
        }

        if (inWindowBottom < fullscreenPosition.bottom && inWindowBottom >= safeAreaPosition.bottom + fullscreenPosition.top) {
            adjustedPosition.bottom = fullscreenPosition.bottom - fullscreenPosition.top;
        }

        const adjustedFrame = CGRectMake(layout.toDeviceIndependentPixels(adjustedPosition.left), layout.toDeviceIndependentPixels(adjustedPosition.top), layout.toDeviceIndependentPixels(adjustedPosition.right - adjustedPosition.left), layout.toDeviceIndependentPixels(adjustedPosition.bottom - adjustedPosition.top));

        if (traceEnabled()) {
            traceWrite(view + " :expandBeyondSafeArea: " + JSON.stringify(ios.getPositionFromFrame(adjustedFrame)), traceCategories.Layout);
        }

        return adjustedFrame;
    }

    function layoutParent(view: ViewBase): void {
        if (!view) {
            return;
        }

        if (view instanceof View && view.nativeViewProtected) {
            const frame = view.nativeViewProtected.frame;
            const origin = frame.origin;
            const size = frame.size;
            const left = layout.toDevicePixels(origin.x);
            const top = layout.toDevicePixels(origin.y);
            const width = layout.toDevicePixels(size.width);
            const height = layout.toDevicePixels(size.height);
            view._setLayoutFlags(left, top, width + left, height + top);
        }

        layoutParent(view.parent);
    }

    function getAvailableSpaceFromParent(view: View): { safeArea: CGRect, fullscreen: CGRect } {
        if (!view) {
            return;
        }

        let fullscreen = null;
        let safeArea = null;

        if (view.viewController) {
            const nativeView = view.viewController.view;
            safeArea = nativeView.safeAreaLayoutGuide.layoutFrame;
            fullscreen = nativeView.frame;
        } else {
            let parent = view.parent as View;
            while (parent && !parent.viewController && !(parent.nativeViewProtected instanceof UIScrollView)) {
                parent = parent.parent as View;
            }

            if (parent.nativeViewProtected instanceof UIScrollView) {
                const nativeView = parent.nativeViewProtected;
                safeArea = nativeView.safeAreaLayoutGuide.layoutFrame;
                fullscreen = CGRectMake(0, 0, nativeView.contentSize.width, nativeView.contentSize.height);
            } else if (parent.viewController) {
                const nativeView = parent.viewController.view;
                safeArea = nativeView.safeAreaLayoutGuide.layoutFrame;
                fullscreen = nativeView.frame;
            }
        }

        return { safeArea: safeArea, fullscreen: fullscreen }
    }

    export class UILayoutViewController extends UIViewController {
        public owner: WeakRef<View>;

        public static initWithOwner(owner: WeakRef<View>): UILayoutViewController {
            const controller = <UILayoutViewController>UILayoutViewController.new();
            controller.owner = owner;
            return controller;
        }

        public viewWillLayoutSubviews(): void {
            super.viewWillLayoutSubviews();
            const owner = this.owner.get();
            if (owner) {
                updateConstraints(this, owner);
            }
        }

        public viewDidLayoutSubviews(): void {
            super.viewDidLayoutSubviews();
            const owner = this.owner.get();
            if (owner) {
                layoutView(this, owner);
            }
        }

        public viewWillAppear(animated: boolean): void {
            super.viewWillAppear(animated);
            const owner = this.owner.get();
            if (!owner) {
                return;
            }

            updateAutoAdjustScrollInsets(this, owner);

            if (!owner.parent) {
                owner.callLoaded();
            }
        }

        public viewDidDisappear(animated: boolean): void {
            super.viewDidDisappear(animated);
            const owner = this.owner.get();
            if (owner && !owner.parent) {
                owner.callUnloaded();
            }
        }
    }
}
