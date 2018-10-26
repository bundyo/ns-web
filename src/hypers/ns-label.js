import NSElement from "./ns-element";

export default class NSLabel extends NSElement {

    static get observedAttributes() { return ["text"].concat(super.observedAttributes); }

    render() {
        return this.text
            ? this.html`
        <span>${this.text}</span>`
            : this.html;
    }
}

NSLabel.define('ns-label');
