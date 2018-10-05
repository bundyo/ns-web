import NSElement from "./ns-element";

const columnRegExp = /\s*,\s*/g;

export default class NSGridLayout extends NSElement {

    static get observedAttributes() { return ["rows", "columns"].concat(super.observedAttributes); }

    created() {
        super.created();

        this.calculateLayout();
    }

    attributeChangedCallback(name, prev, curr) {
        if (name === "columns") {
            this.calculateLayout();
        }

        super.attributeChangedCallback(name, prev, curr);
    }

    calculateLayout() {
        const cols = this.columns ? this.columns.split(columnRegExp) : [],
              colCount = cols.length + 1;

        let scoped = "";

        cols.forEach((value, index) => {
            value = value.trim();

            if (value === "*") {
                cols[index] = "calc(100% - " + cols.reduce((a, b) =>
                    parseInt("0" + a, 10) + parseInt("0" + b, 10), 0) + "px)";
            } else {
                cols[index] = value + "px";
            }
        });

        cols.forEach((value, index) => {
            value = value.trim();

            scoped += "[col=\"" + index + "\"] { flex: 0 " + value + "; }\n";
        });

        for (let i = 1; i < colCount; i++) {
            scoped += "[colspan=\"" + i + "\"] { flex: 0 " + (100 / (colCount - i)) + "%; }\n";
        }

        super.updateStyles(scoped);
    }
}

NSGridLayout.define('ns-grid-layout');
