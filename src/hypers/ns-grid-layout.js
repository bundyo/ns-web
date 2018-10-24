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
        if (!this.columns) {
            return;
        }

        let cols = this.columns ? this.columns.split(columnRegExp) : [],
            scoped = "";

        const colCount = cols.length + 1;

        cols = cols.map((value) => {
            value = value.trim();

            if (value === "*") {
                const colWidth = cols.reduce((a, b) =>
                                    parseInt("0" + a, 10) + parseInt("0" + b, 10), 0);

                return colWidth ? "0 " + colWidth + "px" : "1fr";
            } else {
                return value + (value !== "auto" ? "px" : "");
            }
        });

        cols.forEach((value, index) => {
            value = value.trim();

            if (index === 0) {
                scoped += "> * { flex: " + value + "; }\n";
            }

            scoped += "[col=\"" + index + "\"] { flex: " + value + "; }\n";
        });

        for (let i = 1; i < colCount; i++) {
            scoped += "[colspan=\"" + i + "\"] { flex: 0 " + (100 / (colCount-1) * i) + "%; }\n";
        }

        super.updateStyles(scoped);
    }
}

NSGridLayout.define('ns-grid-layout');
