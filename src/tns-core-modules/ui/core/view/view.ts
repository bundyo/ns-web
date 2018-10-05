import NSElement from "../../../../hypers/ns-element.js";

import {
    ViewCommon
} from "./view-common";
import {ios as iosUtils} from "src/tns-core-modules/utils";

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
