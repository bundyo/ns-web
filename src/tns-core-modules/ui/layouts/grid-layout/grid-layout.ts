import {
    columnProperty, columnSpanProperty, View,
    GridLayoutBase, Length, rowProperty, rowSpanProperty,
} from "./grid-layout-common";

import NSGridLayout from "../../../../hypers/ns-grid-layout";

export * from "./grid-layout-common";

export class GridLayout extends GridLayoutBase {

    nativeViewProtected: NSGridLayout;

    createNativeView() {
        return document.createElement("ns-grid-layout");
    }

    set rows(value: string) {
        setTimeout(() => {
            if (this.nativeViewProtected) {
                this.nativeViewProtected.rows = value;
            }
        });
    }

    set columns(value: string) {
        setTimeout(() => {
            if (this.nativeViewProtected) {
                this.nativeViewProtected.columns = value;
            }
        });
    }
}

Object.assign(View.prototype, {
    [rowProperty.setNative](value: Length) {
        this.nativeViewProtected.row = value;
    },

    [columnProperty.setNative](value: Length) {
        this.nativeViewProtected.col = value;
    },

    [rowSpanProperty.setNative](value: Length) {
        this.nativeViewProtected.rowspan = value;
    },

    [columnSpanProperty.setNative](value: Length) {
        this.nativeViewProtected.colspan = value;
    }
});
