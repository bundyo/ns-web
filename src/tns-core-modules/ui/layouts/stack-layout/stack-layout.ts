﻿import { StackLayoutBase, orientationProperty } from "./stack-layout-common";

import NSStackLayout from "../../../../hypers/ns-stack-layout";

export * from "./stack-layout-common";

export class StackLayout extends StackLayoutBase {
    nativeViewProtected: NSStackLayout;

    createNativeView() {
        return document.createElement("ns-stack-layout");
    }

    [orientationProperty.setNative](value: "horizontal" | "vertical") {
        this.nativeViewProtected.orientation = value;
    }
}
