import NSElement from "./ns-element";

export default class NSImage extends NSElement {

    static get observedAttributes() { return ["src", "alt"].concat(super.observedAttributes); }

    render() {
        return this.html`
    <img src="${this.src}" alt="${this.alt}"/>`;
    }
}

NSImage.define('ns-image');
