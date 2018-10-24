import {
    columnProperty, columnSpanProperty, View,
    GridLayoutBase, Length, rowProperty, rowSpanProperty,
} from "./grid-layout-common";

import NSGridLayout from "../../../../hypers/ns-grid-layout";
import {ItemSpec} from "~/tns-core-modules/ui/layouts/grid-layout/grid-layout.android";

export * from "./grid-layout-common";

export class GridLayout extends GridLayoutBase {
    nativeViewProtected: NSGridLayout;
    gridLayout;

    createNativeView() {
        return document.createElement("ns-grid-layout");
    }

    public initNativeView(): void {
        super.initNativeView();

        const view = this.nativeViewProtected;

        const rows = this.getRows();
        const columns = this.getColumns();

        this.gridLayout = [...Array(rows.length)].map(() => Array(columns.length));

        // Update native GridLayout
        this.rowsInternal.forEach((itemSpec: ItemSpec, index, rows) => { this._onRowAdded(itemSpec); }, this);
        this.columnsInternal.forEach((itemSpec: ItemSpec, index, rows) => { this._onColumnAdded(itemSpec); }, this);
    }

    onLoaded(): void {
        super.onLoaded();
    }

    _addView(view, atIndex?: number): void {
        super._addView(view, atIndex);

        setTimeout(() => {
            view.nativeViewProtected.col = view.col;
            view.nativeViewProtected.row = view.row;

            this.gridLayout[view.row][view.col] = `r${view.row}-c${view.col}`;

            if (view.colSpan > 1) {
                view.nativeViewProtected.colspan = view.colSpan;
            }

            if (view.rowSpan > 1) {
                view.nativeViewProtected.rowspan = view.rowSpan;
            }
        });
    }

    set rows(value) {
        super.rows = value;

        if (this.nativeViewProtected) {
            this.nativeViewProtected.rows = value;
        }
    }

    set columns(value) {
        super.columns = value;

        if (this.nativeViewProtected) {
            this.nativeViewProtected.columns = value;
        }
    }
}

Object.assign(View.prototype, {
    [rowProperty.setNative](value: Length) {
        this.nativeViewProtected.row = value;
    },

    [columnProperty.setNative](value: Length) {
        console.log(value);
        this.nativeViewProtected.col = value;
    },

    [rowSpanProperty.setNative](value: Length) {
        this.nativeViewProtected.rowspan = value;
    },

    [columnSpanProperty.setNative](value: Length) {
        this.nativeViewProtected.colspan = value;
    }
});
