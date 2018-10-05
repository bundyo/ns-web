import NSElement from "./ns-element";

export default class NSButton extends NSElement {

    static get observedAttributes() { return ["icon", "icon-align", "text"].concat(super.observedAttributes); }

    render() {
        return this.html`
    <button class="${this.state.buttonClass}" style="${this.state.styles}" onclick="${this}">
        <i class="${this.state.iconClass}"></i>
        <span>${this.text}</span>
    </button>`;
    }

    onclick(e) {
        console.log(this, 'tap', e.target);
    }

    get defaultState() {
        return {
            buttonClass: `ns-button__content ${this.className}`,
            iconClass: `ns-button__icon fa fa-${this.icon} -${this.iconAlign}`,
            styles: ""
        };
    }
}

NSButton.define('ns-button');
