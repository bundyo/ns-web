import NSElement from "../../../../hypers/ns-element.js";

import {
    automationTextProperty,
    backgroundInternalProperty,
    HorizontalAlignment,
    horizontalAlignmentProperty,
    isEnabledProperty,
    isUserInteractionEnabledProperty,
    layout,
    Length,
    minHeightProperty,
    minWidthProperty,
    opacityProperty,
    originXProperty,
    originYProperty,
    paddingBottomProperty,
    paddingLeftProperty,
    paddingRightProperty,
    paddingTopProperty,
    borderLeftColorProperty,
    borderRightColorProperty,
    borderTopColorProperty,
    borderBottomColorProperty,
    borderLeftWidthProperty,
    borderRightWidthProperty,
    borderTopWidthProperty,
    borderBottomWidthProperty,
    backgroundImageProperty,
    backgroundColorProperty,
    backgroundPositionProperty,
    backgroundSizeProperty,
    rotateProperty,
    scaleXProperty,
    scaleYProperty,
    translateXProperty,
    translateYProperty,
    VerticalAlignment,
    verticalAlignmentProperty,
    ViewCommon,
    Visibility,
    visibilityProperty,
    zIndexProperty,
    EventData,
    marginTopProperty,
    marginRightProperty,
    marginBottomProperty,
    marginLeftProperty, widthProperty, heightProperty, PercentLength
} from "./view-common";

export * from "./view-common";

export class View extends ViewCommon {
    nativeViewProtected: any;

    onLoaded() {
        super.onLoaded();

        this.nativeViewProtected.className = this.className;
    }

    public layoutNativeView(left: number, top: number, right: number, bottom: number): void {
        const view = this.nativeViewProtected;

        if (view) {
            view.style.left = left;
            view.style.top = top;
            view.style.right = right;
            view.style.bottom = bottom;
        }
    }

    public measure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        super.measure(widthMeasureSpec, heightMeasureSpec);
        this.onMeasure(widthMeasureSpec, heightMeasureSpec);
    }

    public layout(left: number, top: number, right: number, bottom: number): void {
        super.layout(left, top, right, bottom);
        this.onLayout(left, top, right, bottom);
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        let view = this.nativeViewProtected;
        if (view) {
            view.measure(widthMeasureSpec, heightMeasureSpec);
            this.setMeasuredDimension(view.getMeasuredWidth(), view.getMeasuredHeight());
        }
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        let view = this.nativeViewProtected;
        if (view) {
            this.layoutNativeView(left, top, right, bottom);
        }
    }

    _getCurrentLayoutBounds(): { left: number; top: number; right: number; bottom: number } {
        if (this.nativeViewProtected && !this.isCollapsed) {
            return this.nativeViewProtected.getBoundingClientRect();
        } else {
            return { left: 0, top: 0, right: 0, bottom: 0 };
        }
    }

    public getMeasuredWidth(): number {
        if (this.nativeViewProtected) {
            return this.nativeViewProtected.offsetWidth;
        }

        return super.getMeasuredWidth();
    }

    public getMeasuredHeight(): number {
        if (this.nativeViewProtected) {
            return this.nativeViewProtected.offsetHeight;
        }

        return super.getMeasuredHeight();
    }

    public focus(): boolean {
        if (this.nativeViewProtected) {
            return this.nativeViewProtected.focus();
        }

        return false;
    }

    public _onCssStateChange() {
        if (this.nativeViewProtected) {
            console.log("class change");
            this.nativeViewProtected.className = this.className;
        }
    }

    [isEnabledProperty.setNative](value: boolean) {
        this.nativeViewProtected.disabled = !value;
    }

    // [originXProperty.getDefault](): number {
    //     return this.nativeViewProtected.getPivotX();
    // }
    // [originXProperty.setNative](value: number) {
    //     org.nativescript.widgets.OriginPoint.setX(this.nativeViewProtected, value);
    // }
    //
    // [originYProperty.getDefault](): number {
    //     return this.nativeViewProtected.getPivotY();
    // }
    // [originYProperty.setNative](value: number) {
    //     org.nativescript.widgets.OriginPoint.setY(this.nativeViewProtected, value);
    // }

    // [automationTextProperty.getDefault](): string {
    //     return this.nativeViewProtected.getContentDescription();
    // }
    // [automationTextProperty.setNative](value: string) {
    //     this.nativeViewProtected.setContentDescription(value);
    // }

    // [isUserInteractionEnabledProperty.setNative](value: boolean) {
    //     if (this.nativeViewProtected.setClickable) {
    //         this.nativeViewProtected.setClickable(value);
    //     }
    // }

    [visibilityProperty.getDefault](): Visibility {
        const style = this.nativeViewProtected.style;

        if ((style.visibility === "visible" || style.visibility === "") && style.display !== "none") {
            return "visible";
        }

        if (style.visibility === "hidden" && style.display !== "none") {
            return "hidden";
        }

        if (style.display === "none") {
            return "collapse";
        }

        throw new Error(`Unsupported View visibility: ${style.visibility}. Currently supported values are "visible", "hidden", "collapse".`);
    }
    [visibilityProperty.setNative](value: Visibility) {
        const style = this.nativeViewProtected.style;

        switch (value) {
            case "visible":
                style.visibility = value;

                if (style.display === "none") {
                    style.display = "";
                }
                break;
            case "hidden":
                style.visibility = value;

                if (style.display === "none") {
                    style.display = "";
                }
                break;
            case "collapse":
                style.display = "none";
                break;
            default:
                throw new Error(`Invalid visibility value: ${value}. Valid values are: visible, hidden, collapse.`);
        }
    }

    [opacityProperty.getDefault]() {
        return this.nativeViewProtected.style.opacity;
    }
    [opacityProperty.setNative](value) {
        this.nativeViewProtected.style.opacity = value;
    }

    // [horizontalAlignmentProperty.getDefault](): HorizontalAlignment {
    //     return <HorizontalAlignment>org.nativescript.widgets.ViewHelper.getHorizontalAlignment(this.nativeViewProtected);
    // }
    // [horizontalAlignmentProperty.setNative](value: HorizontalAlignment) {
    //     const nativeView = this.nativeViewProtected;
    //     const lp: any = nativeView.getLayoutParams() || new org.nativescript.widgets.CommonLayoutParams();
    //     // Set only if params gravity exists.
    //     if (lp.gravity !== undefined) {
    //         switch (value) {
    //             case "left":
    //                 lp.gravity = android.view.Gravity.LEFT | (lp.gravity & android.view.Gravity.VERTICAL_GRAVITY_MASK);
    //                 if (lp.weight < 0) {
    //                     lp.weight = -2;
    //                 }
    //                 break;
    //             case "center":
    //                 lp.gravity = android.view.Gravity.CENTER_HORIZONTAL | (lp.gravity & android.view.Gravity.VERTICAL_GRAVITY_MASK);
    //                 if (lp.weight < 0) {
    //                     lp.weight = -2;
    //                 }
    //                 break;
    //             case "right":
    //                 lp.gravity = android.view.Gravity.RIGHT | (lp.gravity & android.view.Gravity.VERTICAL_GRAVITY_MASK);
    //                 if (lp.weight < 0) {
    //                     lp.weight = -2;
    //                 }
    //                 break;
    //             case "stretch":
    //                 lp.gravity = android.view.Gravity.FILL_HORIZONTAL | (lp.gravity & android.view.Gravity.VERTICAL_GRAVITY_MASK);
    //                 if (lp.weight < 0) {
    //                     lp.weight = -1;
    //                 }
    //                 break;
    //         }
    //         nativeView.setLayoutParams(lp);
    //     }
    // }
    //
    // [verticalAlignmentProperty.getDefault](): VerticalAlignment {
    //     return <VerticalAlignment>org.nativescript.widgets.ViewHelper.getVerticalAlignment(this.nativeViewProtected);
    // }
    // [verticalAlignmentProperty.setNative](value: VerticalAlignment) {
    //     const nativeView = this.nativeViewProtected;
    //     const lp: any = nativeView.getLayoutParams() || new org.nativescript.widgets.CommonLayoutParams();
    //     // Set only if params gravity exists.
    //     if (lp.gravity !== undefined) {
    //         switch (value) {
    //             case "top":
    //                 lp.gravity = android.view.Gravity.TOP | (lp.gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK);
    //                 if (lp.height < 0) {
    //                     lp.height = -2;
    //                 }
    //                 break;
    //             case "middle":
    //                 lp.gravity = android.view.Gravity.CENTER_VERTICAL | (lp.gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK);
    //                 if (lp.height < 0) {
    //                     lp.height = -2;
    //                 }
    //                 break;
    //             case "bottom":
    //                 lp.gravity = android.view.Gravity.BOTTOM | (lp.gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK);
    //                 if (lp.height < 0) {
    //                     lp.height = -2;
    //                 }
    //                 break;
    //             case "stretch":
    //                 lp.gravity = android.view.Gravity.FILL_VERTICAL | (lp.gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK);
    //                 if (lp.height < 0) {
    //                     lp.height = -1;
    //                 }
    //                 break;
    //         }
    //         nativeView.setLayoutParams(lp);
    //     }
    // }

    [rotateProperty.setNative](value) {
        this.nativeViewProtected.style.rotate = value;
    }

    [scaleXProperty.setNative](value) {
        this.nativeViewProtected.style.scaleX = value;
    }

    [scaleYProperty.setNative](value) {
        this.nativeViewProtected.style.scaleY = value;
    }

    [translateXProperty.setNative](value) {
        this.nativeViewProtected.style.translateX = value;
    }

    [translateYProperty.setNative](value) {
        this.nativeViewProtected.style.translateY = value;
    }

    [zIndexProperty.getDefault]() {
        return this.nativeViewProtected.style.zIndex;
    }
    [zIndexProperty.setNative](value) {
        this.nativeViewProtected.style.zIndex = value;
    }

    [backgroundImageProperty.getDefault]() {
        return this.nativeViewProtected.style.backgroundImage;
    }

    [backgroundImageProperty.setNative](value) {
        this.nativeViewProtected.style.backgroundImage = value;
    }

    [backgroundColorProperty.getDefault]() {
        return this.nativeViewProtected.style.backgroundColor;
    }

    [backgroundColorProperty.setNative](value) {
        this.nativeViewProtected.style.backgroundColor = value;
    }

    [backgroundPositionProperty.getDefault]() {
        return this.nativeViewProtected.style.backgroundPosition;
    }

    [backgroundPositionProperty.setNative](value) {
        this.nativeViewProtected.style.backgroundPosition = value;
    }

    [backgroundSizeProperty.getDefault]() {
        return this.nativeViewProtected.style.backgroundSize;
    }

    [backgroundSizeProperty.setNative](value) {
        this.nativeViewProtected.style.backgroundSize = value;
    }

    [paddingLeftProperty.getDefault]() {
        return this.nativeViewProtected.style.paddingLeft;
    }

    [paddingLeftProperty.setNative](value) {
        this.nativeViewProtected.style.paddingLeft = value;
    }

    [paddingRightProperty.getDefault]() {
        return this.nativeViewProtected.style.paddingRight;
    }

    [paddingRightProperty.setNative](value) {
        this.nativeViewProtected.style.paddingRight = value;
    }

    [paddingTopProperty.getDefault]() {
        return this.nativeViewProtected.style.paddingTop;
    }

    [paddingTopProperty.setNative](value) {
        this.nativeViewProtected.style.paddingTop = value;
    }

    [paddingBottomProperty.getDefault]() {
        return this.nativeViewProtected.style.paddingBottom;
    }

    [paddingBottomProperty.setNative](value) {
        this.nativeViewProtected.style.paddingBottom = value;
    }

    [borderLeftColorProperty.setNative](value) {
        this.nativeViewProtected.style.borderLeftColor = value;
    }

    [borderRightColorProperty.setNative](value) {
        this.nativeViewProtected.style.borderRightColor = value;
    }

    [borderTopColorProperty.setNative](value) {
        this.nativeViewProtected.style.borderTopColor = value;
    }

    [borderBottomColorProperty.setNative](value) {
        this.nativeViewProtected.style.borderBottomColor = value;
    }

    [borderLeftWidthProperty.setNative](value: Length) {
        this.nativeViewProtected.style.borderLeftWidth = value;
    }

    [borderRightWidthProperty.setNative](value: Length) {
        this.nativeViewProtected.style.borderRightWidth = value;
    }

    [borderTopWidthProperty.setNative](value: Length) {
        this.nativeViewProtected.style.borderTopWidth = value;
    }

    [borderBottomWidthProperty.setNative](value: Length) {
        this.nativeViewProtected.style.borderBottomWidth = value;
    }

    [minWidthProperty.setNative](value) {
        if (this.parent instanceof CustomLayoutView && this.parent.nativeViewProtected) {
            this.parent.nativeViewProtected.style.minWidth = value;
        } else {
            this.nativeViewProtected.style.minWidth = value;
        }
    }

    [minHeightProperty.setNative](value: Length) {
        if (this.parent instanceof CustomLayoutView && this.parent.nativeViewProtected) {
            this.parent.nativeViewProtected.style.minHeight = value;
        } else {
            this.nativeViewProtected.style.minHeight = value;
        }
    }
}

export class ContainerView extends View {

    public webOverflowSafeArea: boolean;

    constructor() {
        super();
        this.webOverflowSafeArea = true;
    }
}

export class CustomLayoutView extends ContainerView {

    nativeViewProtected: NSElement;

    createNativeView() {
        return document.createElement("ns-element");
    }

    get web(): NSElement {
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
            if (typeof atIndex !== "number" || atIndex >= parentNativeView.children.length) {
                parentNativeView.append(childNativeView);
            } else {
                parentNativeView.insertBefore(childNativeView, parentNativeView.children[atIndex]);
            }

            return true;
        }

        return false;
    }

    public _removeViewFromNativeVisualTree(child: View): void {
        super._removeViewFromNativeVisualTree(child);

        if (child.nativeViewProtected) {
            child.nativeViewProtected.remove();
        }
    }
}

const percentNotSupported = (view: android.view.View, value: number) => { throw new Error("PercentLength is not supported."); };

function setProperty(property, view, value) {
    view.style[property] = value;
}

function createNativePercentLengthProperty(options) {
    const { getter, setter, auto = 0, property } = options;
    let getPixels, setPercent;
    if (getter) {
        View.prototype[getter] = function (this: View): PercentLength {
            if (options) {
                //setPixels = options.setPixels;
                getPixels = options.getPixels;
                //setPercent = options.setPercent || percentNotSupported;
                options = null;
            }
            const value = getPixels(this.nativeViewProtected);
            if (value == auto) { // tslint:disable-line
                return "auto";
            } else {
                return { value, unit: "px" };
            }
        }
    }
    if (setter) {
        View.prototype[setter] = function (this: View, length: PercentLength) {
            if (options) {
                //setPixels = options.setPixels;
                getPixels = options.getPixels;
                setPercent = options.setPercent || percentNotSupported;
                options = null;
            }
            if (length == "auto") { // tslint:disable-line
                setProperty(property, this.nativeViewProtected, auto);
            } else if (typeof length === "number") {
                setProperty(property, this.nativeViewProtected, length + "px");
            } else if (length.unit == "dip") { // tslint:disable-line
                setProperty(property, this.nativeViewProtected, length.value + "px");
            } else if (length.unit == "px") { // tslint:disable-line
                setProperty(property, this.nativeViewProtected, layout.round(length.value) + length.unit);
            } else if (length.unit == "%") { // tslint:disable-line
                setProperty(property, this.nativeViewProtected, length.value + length.unit);
            } else {
                throw new Error(`Unsupported PercentLength ${length}`);
            }
        }
    }
}

createNativePercentLengthProperty({
    setter: marginTopProperty.setNative,
    property: "marginTop",
});

createNativePercentLengthProperty({
    setter: marginRightProperty.setNative,
    property: "marginRight",
});

createNativePercentLengthProperty({
    setter: marginBottomProperty.setNative,
    property: "marginBottom",
});

createNativePercentLengthProperty({
    setter: marginLeftProperty.setNative,
    property: "marginLeft",
});

createNativePercentLengthProperty({
    setter: widthProperty.setNative,
    property: "width",
    auto: -1, //android.view.ViewGroup.LayoutParams.MATCH_PARENT,
});

createNativePercentLengthProperty({
    setter: heightProperty.setNative,
    property: "height",
    auto: -1, //android.view.ViewGroup.LayoutParams.MATCH_PARENT,
});

createNativePercentLengthProperty({
    setter: "_setMinWidthNative",
    property: "minWidth",
});

createNativePercentLengthProperty({
    setter: "_setMinHeightNative",
    property: "minHeight",
});
