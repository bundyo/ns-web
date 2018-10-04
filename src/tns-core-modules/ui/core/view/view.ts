import {
    ViewCommon
} from "./view-common";

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
