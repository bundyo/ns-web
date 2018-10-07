import NSElement from "../../../../hypers/ns-element.js";

import {
    automationTextProperty, backgroundInternalProperty,
    HorizontalAlignment,
    horizontalAlignmentProperty,
    isEnabledProperty,
    isUserInteractionEnabledProperty,
    layout, Length, minHeightProperty, minWidthProperty,
    opacityProperty,
    originXProperty,
    originYProperty,
    rotateProperty,
    scaleXProperty,
    scaleYProperty,
    translateXProperty,
    translateYProperty,
    VerticalAlignment,
    verticalAlignmentProperty,
    ViewCommon,
    Visibility,
    visibilityProperty, zIndexProperty
} from "./view-common";
import {ios as iosUtils} from "src/tns-core-modules/utils";
import {dip} from "src/tns-core-modules/ui/core/view/view";
import {Background} from "src/tns-core-modules/ui/styling/background-common";

export * from "./view-common";

export class View extends ViewCommon {
    public layoutNativeView(left: number, top: number, right: number, bottom: number): void {
        //
    }

    public onLayout(left: number, top: number, right: number, bottom: number): void {
        //
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        // Don't call super because it will set MeasureDimension. This method must be overriden and calculate its measuredDimensions.
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

        throw new Error(`Unsupported android.view.View visibility: ${nativeVisibility}. Currently supported values are android.view.View.VISIBLE, android.view.View.INVISIBLE, android.view.View.GONE.`);
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

    // [backgroundInternalProperty.getDefault](): android.graphics.drawable.Drawable {
    //     const nativeView = this.nativeViewProtected;
    //     const drawable = nativeView.getBackground();
    //     if (drawable) {
    //         const constantState = drawable.getConstantState();
    //         if (constantState) {
    //             try {
    //                 return constantState.newDrawable(nativeView.getResources());
    //             } catch (e) {
    //                 return drawable;
    //             }
    //         } else {
    //             return drawable;
    //         }
    //     }
    //
    //     return null;
    // }
    // [backgroundInternalProperty.setNative](value: android.graphics.drawable.Drawable | Background) {
    //     this._redrawNativeBackground(value);
    // }

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
