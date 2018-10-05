import NSElement from "./ns-element";

export default class NSButton extends NSElement {

    static get observedAttributes() { return ["icon", "icon-align", "text"].concat(super.observedAttributes); }

    created() {
        super.created();

        this.addEventListener("click", this.onclick);
    }

    render() {
        return this.html`
        <i class="${this.state.iconClass}"></i>
        <span>${this.text}</span>`;
    }

    onclick(e) {
        e.stopPropagation();

        console.log(this, 'tap', e.target);
    }

    get defaultState() {
        return {
            iconClass: `ns-button__icon fa fa-${this.icon} -${this.iconAlign}`
        };
    }
}

NSButton.define('ns-button');
