import {
    AbsoluteLayoutBase,
    View,
    leftProperty,
    topProperty,
    Length,
    Visibility,
    layout
} from "./absolute-layout-common";

import NSAbsoluteLayout from "../../../../hypers/ns-absolute-layout";

export * from "./absolute-layout-common";

export class AbsoluteLayout extends AbsoluteLayoutBase {
    nativeViewProtected: NSAbsoluteLayout;

    public createNativeView() {
        return document.createElement("ns-absolute-layout");
    }

    onLeftChanged(view: View, oldValue: Length, newValue: Length) {
        view.nativeViewProtected.style.left = newValue + "px";
        this.requestLayout();
    }

    onTopChanged(view: View, oldValue: Length, newValue: Length) {
        view.nativeViewProtected.style.top = newValue + "px";
        this.requestLayout();
    }

    [topProperty.setNative](value) {
        this.nativeViewProtected.style.top = value + "px";
    }

    [leftProperty.setNative](value) {
        this.nativeViewProtected.style.left = value + "px";
    }
}
