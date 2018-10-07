import {
    LayoutBaseCommon,
    clipToBoundsProperty,
    isPassThroughParentEnabledProperty,
    paddingTopProperty,
    Length,
    paddingRightProperty, paddingBottomProperty, paddingLeftProperty
} from "./layout-base-common";

export * from "./layout-base-common";

export class LayoutBase extends LayoutBaseCommon {

    [paddingTopProperty.getDefault](): Length {
        return { value: this._defaultPaddingTop, unit: "px" };
    }
    [paddingTopProperty.setNative](value: Length) {
        this.nativeViewProtected.style.paddingTop = value + "px";
    }

    [paddingRightProperty.getDefault](): Length {
        return { value: this._defaultPaddingRight, unit: "px" };
    }
    [paddingRightProperty.setNative](value: Length) {
        this.nativeViewProtected.style.paddingRight = value + "px";
    }

    [paddingBottomProperty.getDefault](): Length {
        return { value: this._defaultPaddingBottom, unit: "px" };
    }
    [paddingBottomProperty.setNative](value: Length) {
        this.nativeViewProtected.style.paddingBottom = value + "px";
    }

    [paddingLeftProperty.getDefault](): Length {
        return { value: this._defaultPaddingLeft, unit: "px" };
    }
    [paddingLeftProperty.setNative](value: Length) {
        this.nativeViewProtected.style.paddingLeft = value + "px";
    }
}
