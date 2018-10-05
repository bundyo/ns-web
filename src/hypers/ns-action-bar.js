import NSElement from "./ns-element";

export default class NSActionBar extends NSElement {

    static get observedAttributes() { return ["title"].concat(super.observedAttributes); }

    render() {
        return this.html`
    <span class="ns-action-bar__title">${this.title}</span>
    ${this.children}`;
    }
}

NSActionBar.define('ns-action-bar');
