﻿// Definitions.
import { iOSFrame as iOSFrameDefinition, BackstackEntry, NavigationTransition } from ".";
import { Page } from "../page";
import { profile } from "../../profiling";

//Types.
import { FrameBase, View, layout, traceEnabled, traceWrite, traceCategories, isCategorySet } from "./frame-common";
import { _createIOSAnimatedTransitioning } from "./fragment.transitions";

import * as utils from "../../utils/utils";

export * from "./frame-common";

const majorVersion = utils.ios.MajorVersion;

const ENTRY = "_entry";
const NAV_DEPTH = "_navDepth";
const TRANSITION = "_transition";
const DELEGATE = "_delegate";

let navDepth = -1;

export class Frame extends FrameBase {
    public viewController: UINavigationControllerImpl;
    public _animatedDelegate = <UINavigationControllerDelegate>UINavigationControllerAnimatedDelegate.new();

    private _ios: iOSFrame;

    constructor() {
        super();
        this._ios = new iOSFrame(this);
        this.viewController = this._ios.controller;
    }

    createNativeView() {
        return this.viewController.view;
    }

    public get ios(): iOSFrame {
        return this._ios;
    }

    public setCurrent(entry: BackstackEntry, isBack: boolean): void {
        const current = this._currentEntry;
        const currentEntryChanged = current !== entry;
        if (currentEntryChanged) {
            this._updateBackstack(entry, isBack);

            super.setCurrent(entry, isBack);
        }
    }

    @profile
    public _navigateCore(backstackEntry: BackstackEntry) {
        super._navigateCore(backstackEntry);

        let viewController: UIViewController = backstackEntry.resolvedPage.ios;
        if (!viewController) {
            throw new Error("Required page does not have a viewController created.");
        }

        let clearHistory = backstackEntry.entry.clearHistory;
        if (clearHistory) {
            navDepth = -1;
        }
        navDepth++;

        let navigationTransition: NavigationTransition;
        let animated = this.currentPage ? this._getIsAnimatedNavigation(backstackEntry.entry) : false;
        if (animated) {
            navigationTransition = this._getNavigationTransition(backstackEntry.entry);
            if (navigationTransition) {
                viewController[TRANSITION] = navigationTransition;
            }
        }
        else {
            //https://github.com/NativeScript/NativeScript/issues/1787
            viewController[TRANSITION] = { name: "non-animated" };
        }

        let nativeTransition = _getNativeTransition(navigationTransition, true);
        if (!nativeTransition && navigationTransition) {
            this._ios.controller.delegate = this._animatedDelegate;
            viewController[DELEGATE] = this._animatedDelegate;
        }
        else {
            viewController[DELEGATE] = null;
            this._ios.controller.delegate = null;
        }

        backstackEntry[NAV_DEPTH] = navDepth;
        viewController[ENTRY] = backstackEntry;

        if (!animated && majorVersion > 10) {
            // Reset back button title before pushing view controller to prevent
            // displaying default 'back' title (when NavigaitonButton custom title is set).
            let barButtonItem = UIBarButtonItem.alloc().initWithTitleStyleTargetAction("", UIBarButtonItemStyle.Plain, null, null);
            viewController.navigationItem.backBarButtonItem = barButtonItem;
        }

        // First navigation.
        if (!this._currentEntry) {
            // Update action-bar with disabled animations before the initial navigation.
            this._updateActionBar(backstackEntry.resolvedPage, true);
            this._ios.controller.pushViewControllerAnimated(viewController, animated);
            if (traceEnabled()) {
                traceWrite(`${this}.pushViewControllerAnimated(${viewController}, ${animated}); depth = ${navDepth}`, traceCategories.Navigation);
            }
            return;
        }

        // We should clear the entire history.
        if (clearHistory) {
            viewController.navigationItem.hidesBackButton = true;
            const newControllers = NSMutableArray.alloc().initWithCapacity(1);
            newControllers.addObject(viewController);

            // Mark all previous ViewControllers as cleared
            const oldControllers = this._ios.controller.viewControllers;
            for (let i = 0; i < oldControllers.count; i++) {
                (<any>oldControllers.objectAtIndex(i)).isBackstackCleared = true;
            }

            this._ios.controller.setViewControllersAnimated(newControllers, animated);
            if (traceEnabled()) {
                traceWrite(`${this}.setViewControllersAnimated([${viewController}], ${animated}); depth = ${navDepth}`, traceCategories.Navigation);
            }
            return;

        }

        // We should hide the current entry from the back stack.
        if (!Frame._isEntryBackstackVisible(this._currentEntry)) {
            let newControllers = NSMutableArray.alloc<UIViewController>().initWithArray(this._ios.controller.viewControllers);
            if (newControllers.count === 0) {
                throw new Error("Wrong controllers count.");
            }

            // the code below fixes a phantom animation that appears on the Back button in this case
            // TODO: investigate why the animation happens at first place before working around it
            viewController.navigationItem.hidesBackButton = this.backStack.length === 0;

            // swap the top entry with the new one
            const skippedNavController = newControllers.lastObject;
            (<any>skippedNavController).isBackstackSkipped = true;
            newControllers.removeLastObject();
            newControllers.addObject(viewController);

            // replace the controllers instead of pushing directly
            this._ios.controller.setViewControllersAnimated(newControllers, animated);
            if (traceEnabled()) {
                traceWrite(`${this}.setViewControllersAnimated([originalControllers - lastController + ${viewController}], ${animated}); depth = ${navDepth}`, traceCategories.Navigation);
            }
            return;
        }

        // General case.
        this._ios.controller.pushViewControllerAnimated(viewController, animated);
        if (traceEnabled()) {
            traceWrite(`${this}.pushViewControllerAnimated(${viewController}, ${animated}); depth = ${navDepth}`, traceCategories.Navigation);
        }
    }

    public _goBackCore(backstackEntry: BackstackEntry) {
        super._goBackCore(backstackEntry);
        navDepth = backstackEntry[NAV_DEPTH];

        let controller = backstackEntry.resolvedPage.ios;
        let animated = this._currentEntry ? this._getIsAnimatedNavigation(this._currentEntry.entry) : false;

        this._updateActionBar(backstackEntry.resolvedPage);
        if (traceEnabled()) {
            traceWrite(`${this}.popToViewControllerAnimated(${controller}, ${animated}); depth = ${navDepth}`, traceCategories.Navigation);
        }

        this._ios.controller.popToViewControllerAnimated(controller, animated);
    }

    public _updateActionBar(page?: Page, disableNavBarAnimation: boolean = false): void {
        super._updateActionBar(page);

        if (page && this.currentPage && this.currentPage.modal === page) {
            return;
        }

        page = page || this.currentPage;
        let newValue = this._getNavBarVisible(page);
        let disableNavBarAnimationCache = this._ios._disableNavBarAnimation;

        if (disableNavBarAnimation) {
            this._ios._disableNavBarAnimation = true;
        }

        this._ios.showNavigationBar = newValue;

        if (disableNavBarAnimation) {
            this._ios._disableNavBarAnimation = disableNavBarAnimationCache;
        }

        if (this._ios.controller.navigationBar) {
            this._ios.controller.navigationBar.userInteractionEnabled = this.navigationQueueIsEmpty();
        }
    }

    public _getNavBarVisible(page: Page): boolean {
        switch (this._ios.navBarVisibility) {
            case "always":
                return true;

            case "never":
                return false;

            case "auto":
                let newValue: boolean;

                if (page && page.actionBarHidden !== undefined) {
                    newValue = !page.actionBarHidden;
                }
                else {
                    newValue = this.ios.controller.viewControllers.count > 1 || (page && page.actionBar && !page.actionBar._isEmpty());
                }

                newValue = !!newValue; // Make sure it is boolean
                return newValue;
        }
    }

    public static get defaultAnimatedNavigation(): boolean {
        return FrameBase.defaultAnimatedNavigation;
    }
    public static set defaultAnimatedNavigation(value: boolean) {
        FrameBase.defaultAnimatedNavigation = value;
    }

    public static get defaultTransition(): NavigationTransition {
        return FrameBase.defaultTransition;
    }
    public static set defaultTransition(value: NavigationTransition) {
        FrameBase.defaultTransition = value;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        const width = layout.getMeasureSpecSize(widthMeasureSpec);
        const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

        const height = layout.getMeasureSpecSize(heightMeasureSpec);
        const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

        const widthAndState = View.resolveSizeAndState(width, width, widthMode, 0);
        const heightAndState = View.resolveSizeAndState(height, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public layoutNativeView(left: number, top: number, right: number, bottom: number): void {
        //
    }

    public _setNativeViewFrame(nativeView: UIView, frame: CGRect) {
        //
    }

    public _onNavigatingTo(backstackEntry: BackstackEntry, isBack: boolean) {
        //
    }
}

let transitionDelegates = new Array<TransitionDelegate>();

class TransitionDelegate extends NSObject {
    private _id: string;

    public static initWithOwnerId(id: string): TransitionDelegate {
        let delegate = <TransitionDelegate>TransitionDelegate.new();
        delegate._id = id;
        transitionDelegates.push(delegate);

        return delegate;
    }

    public animationWillStart(animationID: string, context: any): void {
        if (traceEnabled()) {
            traceWrite(`START ${this._id}`, traceCategories.Transition);
        }
    }

    public animationDidStop(animationID: string, finished: boolean, context: any): void {
        if (finished) {
            if (traceEnabled()) {
                traceWrite(`END ${this._id}`, traceCategories.Transition);
            }
        }
        else {
            if (traceEnabled()) {
                traceWrite(`CANCEL ${this._id}`, traceCategories.Transition);
            }
        }

        let index = transitionDelegates.indexOf(this);
        if (index > -1) {
            transitionDelegates.splice(index, 1);
        }
    }

    public static ObjCExposedMethods = {
        "animationWillStart": { returns: interop.types.void, params: [NSString, NSObject] },
        "animationDidStop": { returns: interop.types.void, params: [NSString, NSNumber, NSObject] }
    };
}

const _defaultTransitionDuration = 0.35;

class UINavigationControllerAnimatedDelegate extends NSObject implements UINavigationControllerDelegate {
    public static ObjCProtocols = [UINavigationControllerDelegate];

    navigationControllerAnimationControllerForOperationFromViewControllerToViewController(
        navigationController: UINavigationController,
        operation: number,
        fromVC: UIViewController,
        toVC: UIViewController): UIViewControllerAnimatedTransitioning {

        let viewController: UIViewController;
        switch (operation) {
            case UINavigationControllerOperation.Push:
                viewController = toVC;
                break;
            case UINavigationControllerOperation.Pop:
                viewController = fromVC;
                break;
        }

        if (!viewController) {
            return null;
        }

        let navigationTransition = <NavigationTransition>viewController[TRANSITION];
        if (!navigationTransition) {
            return null;
        }

        if (traceEnabled()) {
            traceWrite(`UINavigationControllerImpl.navigationControllerAnimationControllerForOperationFromViewControllerToViewController(${operation}, ${fromVC}, ${toVC}), transition: ${JSON.stringify(navigationTransition)}`, traceCategories.NativeLifecycle);
        }

        let curve = _getNativeCurve(navigationTransition);
        let animationController = _createIOSAnimatedTransitioning(navigationTransition, curve, operation, fromVC, toVC);
        return animationController;
    }
}

class UINavigationControllerImpl extends UINavigationController {
    private _owner: WeakRef<Frame>;

    public static initWithOwner(owner: WeakRef<Frame>): UINavigationControllerImpl {
        let controller = <UINavigationControllerImpl>UINavigationControllerImpl.new();
        controller._owner = owner;
        return controller;
    }

    get owner(): Frame {
        return this._owner.get();
    }

    @profile
    public viewWillAppear(animated: boolean): void {
        super.viewWillAppear(animated);
        const owner = this._owner.get();
        if (owner && !owner.isLoaded && !owner.parent) {
            owner.callLoaded();
        }
    }

    @profile
    public viewDidDisappear(animated: boolean): void {
        super.viewDidDisappear(animated);
        const owner = this._owner.get();
        if (owner && owner.isLoaded && !owner.parent && !this.presentedViewController) {
            owner.callUnloaded();
        }
    }

    private animateWithDuration(navigationTransition: NavigationTransition,
        nativeTransition: UIViewAnimationTransition,
        transitionType: string,
        baseCallback: Function): void {

        let duration = navigationTransition.duration ? navigationTransition.duration / 1000 : _defaultTransitionDuration;
        let curve = _getNativeCurve(navigationTransition);

        let transitionTraced = isCategorySet(traceCategories.Transition);
        let transitionDelegate: TransitionDelegate;
        if (transitionTraced) {
            let id = _getTransitionId(nativeTransition, transitionType);
            transitionDelegate = TransitionDelegate.initWithOwnerId(id);
        }

        UIView.animateWithDurationAnimations(duration, () => {
            if (transitionTraced) {
                UIView.setAnimationDelegate(transitionDelegate);
            }

            UIView.setAnimationWillStartSelector("animationWillStart");
            UIView.setAnimationDidStopSelector("animationDidStop");
            UIView.setAnimationCurve(curve);
            baseCallback();
            UIView.setAnimationTransitionForViewCache(nativeTransition, this.view, true);
        });
    }

    @profile
    public pushViewControllerAnimated(viewController: UIViewController, animated: boolean): void {
        let navigationTransition = <NavigationTransition>viewController[TRANSITION];
        if (traceEnabled()) {
            traceWrite(`UINavigationControllerImpl.pushViewControllerAnimated(${viewController}, ${animated}); transition: ${JSON.stringify(navigationTransition)}`, traceCategories.NativeLifecycle);
        }

        let nativeTransition = _getNativeTransition(navigationTransition, true);
        if (!animated || !navigationTransition || !nativeTransition) {
            super.pushViewControllerAnimated(viewController, animated);
            return;
        }

        this.animateWithDuration(navigationTransition, nativeTransition, "push", () => {
            super.pushViewControllerAnimated(viewController, false);
        });
    }

    @profile
    public setViewControllersAnimated(viewControllers: NSArray<any>, animated: boolean): void {
        let viewController = viewControllers.lastObject;
        let navigationTransition = <NavigationTransition>viewController[TRANSITION];

        if (traceEnabled()) {
            traceWrite(`UINavigationControllerImpl.setViewControllersAnimated(${viewControllers}, ${animated}); transition: ${JSON.stringify(navigationTransition)}`, traceCategories.NativeLifecycle);
        }

        let nativeTransition = _getNativeTransition(navigationTransition, true);
        if (!animated || !navigationTransition || !nativeTransition) {
            super.setViewControllersAnimated(viewControllers, animated);
            return;
        }

        this.animateWithDuration(navigationTransition, nativeTransition, "set", () => {
            super.setViewControllersAnimated(viewControllers, false);
        });
    }

    public popViewControllerAnimated(animated: boolean): UIViewController {
        let lastViewController = this.viewControllers.lastObject;
        let navigationTransition = <NavigationTransition>lastViewController[TRANSITION];
        if (traceEnabled()) {
            traceWrite(`UINavigationControllerImpl.popViewControllerAnimated(${animated}); transition: ${JSON.stringify(navigationTransition)}`, traceCategories.NativeLifecycle);
        }

        if (navigationTransition && navigationTransition.name === "non-animated") {
            //https://github.com/NativeScript/NativeScript/issues/1787
            return super.popViewControllerAnimated(false);
        }

        let nativeTransition = _getNativeTransition(navigationTransition, false);
        if (!animated || !navigationTransition || !nativeTransition) {
            return super.popViewControllerAnimated(animated);
        }

        this.animateWithDuration(navigationTransition, nativeTransition, "pop", () => {
            super.popViewControllerAnimated(false);
        });

        return null;
    }

    public popToViewControllerAnimated(viewController: UIViewController, animated: boolean): NSArray<UIViewController> {
        let lastViewController = this.viewControllers.lastObject;
        let navigationTransition = <NavigationTransition>lastViewController[TRANSITION];
        if (traceEnabled()) {
            traceWrite(`UINavigationControllerImpl.popToViewControllerAnimated(${viewController}, ${animated}); transition: ${JSON.stringify(navigationTransition)}`, traceCategories.NativeLifecycle);
        }

        if (navigationTransition && navigationTransition.name === "non-animated") {
            //https://github.com/NativeScript/NativeScript/issues/1787
            return super.popToViewControllerAnimated(viewController, false);
        }

        let nativeTransition = _getNativeTransition(navigationTransition, false);
        if (!animated || !navigationTransition || !nativeTransition) {
            return super.popToViewControllerAnimated(viewController, animated);
        }

        this.animateWithDuration(navigationTransition, nativeTransition, "popTo", () => {
            super.popToViewControllerAnimated(viewController, false);
        });

        return null;
    }
}

function _getTransitionId(nativeTransition: UIViewAnimationTransition, transitionType: string): string {
    let name;
    switch (nativeTransition) {
        case UIViewAnimationTransition.CurlDown: name = "CurlDown"; break;
        case UIViewAnimationTransition.CurlUp: name = "CurlUp"; break;
        case UIViewAnimationTransition.FlipFromLeft: name = "FlipFromLeft"; break;
        case UIViewAnimationTransition.FlipFromRight: name = "FlipFromRight"; break;
        case UIViewAnimationTransition.None: name = "None"; break;
    }

    return `${name} ${transitionType}`;
}

function _getNativeTransition(navigationTransition: NavigationTransition, push: boolean): UIViewAnimationTransition {
    if (navigationTransition && navigationTransition.name) {
        switch (navigationTransition.name.toLowerCase()) {
            case "flip":
            case "flipright":
                return push ? UIViewAnimationTransition.FlipFromRight : UIViewAnimationTransition.FlipFromLeft;
            case "flipleft":
                return push ? UIViewAnimationTransition.FlipFromLeft : UIViewAnimationTransition.FlipFromRight;
            case "curl":
            case "curlup":
                return push ? UIViewAnimationTransition.CurlUp : UIViewAnimationTransition.CurlDown;
            case "curldown":
                return push ? UIViewAnimationTransition.CurlDown : UIViewAnimationTransition.CurlUp;
        }
    }

    return null;
}

export function _getNativeCurve(transition: NavigationTransition): UIViewAnimationCurve {
    if (transition.curve) {
        switch (transition.curve) {
            case "easeIn":
                if (traceEnabled()) {
                    traceWrite("Transition curve resolved to UIViewAnimationCurve.EaseIn.", traceCategories.Transition);
                }
                return UIViewAnimationCurve.EaseIn;

            case "easeOut":
                if (traceEnabled()) {
                    traceWrite("Transition curve resolved to UIViewAnimationCurve.EaseOut.", traceCategories.Transition);
                }
                return UIViewAnimationCurve.EaseOut;

            case "easeInOut":
                if (traceEnabled()) {
                    traceWrite("Transition curve resolved to UIViewAnimationCurve.EaseInOut.", traceCategories.Transition);
                }
                return UIViewAnimationCurve.EaseInOut;

            case "linear":
                if (traceEnabled()) {
                    traceWrite("Transition curve resolved to UIViewAnimationCurve.Linear.", traceCategories.Transition);
                }
                return UIViewAnimationCurve.Linear;

            default:
                if (traceEnabled()) {
                    traceWrite("Transition curve resolved to original: " + transition.curve, traceCategories.Transition);
                }
                return transition.curve;
        }
    }

    return UIViewAnimationCurve.EaseInOut;
}

/* tslint:disable */
class iOSFrame implements iOSFrameDefinition {
    /* tslint:enable */
    private _controller: UINavigationControllerImpl;
    private _showNavigationBar: boolean;
    private _navBarVisibility: "auto" | "never" | "always" = "auto";

    // TabView uses this flag to disable animation while showing/hiding the navigation bar because of the "< More" bar.
    // See the TabView._handleTwoNavigationBars method for more details.
    public _disableNavBarAnimation: boolean;

    constructor(frame: Frame) {
        this._controller = UINavigationControllerImpl.initWithOwner(new WeakRef(frame));
    }

    public get controller() {
        return this._controller;
    }

    public get showNavigationBar(): boolean {
        return this._showNavigationBar;
    }
    public set showNavigationBar(value: boolean) {
        this._showNavigationBar = value;
        this._controller.setNavigationBarHiddenAnimated(!value, true);
    }

    public get navBarVisibility(): "auto" | "never" | "always" {
        return this._navBarVisibility;
    }
    public set navBarVisibility(value: "auto" | "never" | "always") {
        this._navBarVisibility = value;
    }
}
