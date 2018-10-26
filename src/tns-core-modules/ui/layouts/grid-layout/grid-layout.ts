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

        // Update native GridLayout
        this.rowsInternal.forEach((itemSpec: ItemSpec, index, rows) => { this._onRowAdded(itemSpec); }, this);
        this.columnsInternal.forEach((itemSpec: ItemSpec, index, rows) => { this._onColumnAdded(itemSpec); }, this);
    }

    onLoaded(): void {
        super.onLoaded();

        this.nativeViewProtected.style["grid-template-areas"] = `"${this.gridLayout.map(_ => _.join(" ")).join('"\n"')}"`;
    }

    _registerLayoutChild(view: View) {
        super._registerLayoutChild(view);

        view.once("loaded",() => {
            const nv = view.nativeViewProtected;
            const cellArea = `r${view.row}-c${view.col}`;

            nv.col = view.col;
            nv.row = view.row;

            view.colSpan > 1 && (nv.colspan = view.colSpan);
            view.rowSpan > 1 && (nv.rowspan = view.rowSpan);

            nv.style.gridArea = cellArea;

            if (!this.gridLayout) {
                this.gridLayout = [...Array(this.getRows().length)].map(() => Array(this.getColumns().length));
            }

            for (let row = 0; row < view.rowSpan; row++) {
                for (let col = 0; col < view.colSpan; col++) {
                    this.gridLayout[view.row + row][view.col + col] = cellArea;
                }
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
        this.nativeViewProtected.col = value;
    },

    [rowSpanProperty.setNative](value: Length) {
        this.nativeViewProtected.rowspan = value;
    },

    [columnSpanProperty.setNative](value: Length) {
        this.nativeViewProtected.colspan = value;
    }
});
