import NSElement from "./ns-element";

export default class NSButton extends NSElement {

    static get observedAttributes() { return ["icon", "icon-align", "text"].concat(super.observedAttributes); }

    created() {
        super.created();

        this.addEventListener("click", this.onclick);
    }

    render() {
        return this.text
            ? this.html`
        <i class="${this.state.iconClass}"></i>
        <span>${this.text}</span>`
            : this.html;
    }

    onclick(e) {}

    get defaultState() {
        return {
            iconClass: `ns-button__icon fa fa-${this.icon} -${this.iconAlign}`
        };
    }
}

NSButton.define('ns-button');
