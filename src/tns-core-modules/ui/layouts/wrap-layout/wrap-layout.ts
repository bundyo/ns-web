﻿import {
    WrapLayoutBase,
    orientationProperty,
    itemWidthProperty,
    Length,
    itemHeightProperty
} from "./wrap-layout-common";

import NSWrapLayout from "../../../../hypers/ns-wrap-layout";

export * from "./wrap-layout-common";

export class WrapLayout extends WrapLayoutBase {
    nativeViewProtected: NSWrapLayout;

    createNativeView() {
        return document.createElement("ns-wrap-layout");
    }

    [orientationProperty.setNative](value: "horizontal" | "vertical") {
        this.nativeViewProtected.orientation = value;
    }

    [itemWidthProperty.setNative](value: Length) {
        this.nativeViewProtected.itemwidth = value;
    }

    [itemHeightProperty.setNative](value: Length) {
        this.nativeViewProtected.itemheight = value;
    }
}
