﻿import {
    ButtonBase, PseudoClassHandler,
    paddingLeftProperty, paddingTopProperty, paddingRightProperty, paddingBottomProperty,
    Length, zIndexProperty, textAlignmentProperty, TextAlignment
} from "./button-common";
import { profile } from "../../profiling";
import { TouchGestureEventData, GestureTypes, TouchAction } from "../gestures";

import NSButton from "../../../hypers/ns-button";

export * from "./button-common";

let ClickListener;

function initializeClickListener(): void {
    if (ClickListener) {
        return;
    }

    class ClickListenerImpl {
        private owner: any;

        constructor(owner) {
            this.owner = owner;
        }

        public onClick(v): void {
            if (this.owner) {
                this.owner._emit(ButtonBase.tapEvent);
            }
        }
    }

    ClickListener = ClickListenerImpl;
}

export class Button extends ButtonBase {
    nativeViewProtected: NSButton;

    public createNativeView() {
        return document.createElement("ns-button");
    }

    public initNativeView(): void {
        super.initNativeView();
        const nativeView = this.nativeViewProtected;
        initializeClickListener();
        const clickListener = new ClickListener(this);
        nativeView.onclick = clickListener.onClick.bind(clickListener);
        (<any>nativeView).clickListener = clickListener;
    }

    public disposeNativeView() {
        if (this.nativeViewProtected) {
            (<any>this.nativeViewProtected).clickListener.owner = null;
        }
        super.disposeNativeView();
    }

    private _highlightedHandler: (args: TouchGestureEventData) => void;

    @PseudoClassHandler("normal", "highlighted", "pressed", "active")
    _updateHandler(subscribe: boolean) {
        // if (subscribe) {
        //     this._highlightedHandler = this._highlightedHandler || ((args: TouchGestureEventData) => {
        //         switch (args.action) {
        //             case TouchAction.up:
        //                 this._goToVisualState("normal");
        //                 break;
        //             case TouchAction.down:
        //                 this._goToVisualState("highlighted");
        //                 break;
        //         }
        //     });
        //     this.on(GestureTypes.touch, this._highlightedHandler);
        // } else {
        //     this.off(GestureTypes.touch, this._highlightedHandler);
        // }
    }

    [paddingTopProperty.getDefault](): Length {
        return { value: this.nativeViewProtected.style.paddingTop, unit: "px" }
    }
    [paddingTopProperty.setNative](value: Length) {
        this.nativeViewProtected.style.paddingTop = value;
    }

    [paddingRightProperty.getDefault](): Length {
        return { value: this.nativeViewProtected.style.paddingRight, unit: "px" }
    }
    [paddingRightProperty.setNative](value: Length) {
        this.nativeViewProtected.style.paddingRight = value;
    }

    [paddingBottomProperty.getDefault](): Length {
        return { value: this.nativeViewProtected.style.paddingBottom, unit: "px" }
    }
    [paddingBottomProperty.setNative](value: Length) {
        this.nativeViewProtected.style.paddingBottom = value;
    }

    [paddingLeftProperty.getDefault](): Length {
        return { value: this.nativeViewProtected.style.paddingLeft, unit: "px" }
    }
    [paddingLeftProperty.setNative](value: Length) {
        this.nativeViewProtected.style.paddingTop = value;
    }

    [zIndexProperty.setNative](value: number) {
        this.nativeViewProtected.style.zIndex = value;
    }

    [textAlignmentProperty.setNative](value: TextAlignment) {
        // Button initial value is center.
        const newValue = value === "initial" ? "center" : value;
        this.nativeViewProtected.style.textAlign = value;
    }
}
