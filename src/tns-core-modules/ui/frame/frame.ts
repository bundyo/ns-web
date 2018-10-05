// Definitions.
import { BackstackEntry, NavigationTransition } from ".";
import { Page } from "../page";
import { profile } from "../../profiling";

import NSFrame from "../../../hypers/ns-frame.js";

//Types.
import { FrameBase, View, layout, traceEnabled, traceWrite, traceCategories, isCategorySet } from "./frame-common";
import { _createIOSAnimatedTransitioning } from "./fragment.transitions";

import * as utils from "../../utils";

export * from "./frame-common";

export class Frame extends FrameBase {

    private _web: NSFrame;

    constructor() {
        super();
        this._web = document.createElement("ns-frame");
    }

    createNativeView() {
        return this._web;
    }

    public get web(): NSFrame {
        return this._web;
    }

    public setCurrent(entry: BackstackEntry, isBack: boolean): void {
        const current = this._currentEntry;
        const currentEntryChanged = current !== entry;
        if (currentEntryChanged) {
            this._updateBackstack(entry, isBack);

            super.setCurrent(entry, isBack);
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
        // const width = layout.getMeasureSpecSize(widthMeasureSpec);
        // const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);
        //
        // const height = layout.getMeasureSpecSize(heightMeasureSpec);
        // const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);
        //
        // const widthAndState = View.resolveSizeAndState(width, width, widthMode, 0);
        // const heightAndState = View.resolveSizeAndState(height, height, heightMode, 0);
        //
        // this.setMeasuredDimension(widthAndState, heightAndState);
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
