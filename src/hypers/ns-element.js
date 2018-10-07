import HyperHTMLElement from 'hyperhtml-element';

export default class NSElement extends HyperHTMLElement {

    // observed attributes are automatically defined as accessors
    static get observedAttributes() { return ["color", "left", "right", "top", "bottom", "width", "height", "margin", "padding", "background-color", "row", "col", "rowspan", "colspan"]; }

    // boolean attributes are automatically defined as accessors
    // and will set or remove the passed value
    static get booleanAttributes() { return ["disabled"]; }

    // invoked once the component has been fully upgraded
    // suitable to perform any sort of setup
    // granted to be invoked right before either
    // connectedCallback or attributeChangedCallback
    created() {
        // triggers automatically attributeChangedCallback
        //this.key = 'value';
        this.uId = this.uniqId();

        this.classList.add(`-${this.uId}`);

        this.render();
    }

    attributeChangedCallback(name, prev, curr) {
        // when invoked, attributes will be already reflected
        // through their accessor
        //this.key === curr; // true, and curr === "value"
        //this.getAttribute('key') === this.key; // always true
        Object.assign(this.style, this.state.styles);

        this.render();
    }

    render() {
        // lazily defined, this.html property points to an hyperHTML bound context
        // which could be the element shadowRoot or the element itself.
        // All events can be handled directly by the context, thanks to handleEvent
        // https://medium.com/@WebReflection/dom-handleevent-a-cross-platform-standard-since-year-2000-5bf17287fd38
        return this.html;
    }

    // using the inherited handleEvent,
    // events can be easily defined as methods with `on` prefix.
    onclick(e) {}

    // alternatively, you can specify a `data-call`
    // attribute with the name of the method to invoke
    // this.html`<i data-call=onAnyEvent onclick=${this}>try</i>`;
    onAnyEvent(e) {
        // `this` still refers to the current custom element
        console.log(this, e.type, e.currentTarget, e.target);
    }

    // you can also use Preact-like events handling
    // this is less efficient, but migration friendly.
    // The method is bound once per instance so that
    // this.handleClick === this.handleClick is always true
    // this.html`<i onclick=${this.handleClick}>try</i>`;
    handleClick(e) {
        // `this` still refers to the current custom element
        console.log(this, e.type, e.currentTarget, e.target);
    }

    // define a default state to use whenever this.state is accessed
    // it can create states from observed properties too
    get defaultState() {
        const styles = {};

        Object.values(this.attributes).forEach(v => {
            v.nodeValue && (styles[v.nodeName] = !isNaN(parseFloat(v.nodeValue))
                ? v.nodeValue + "px"
                : v.nodeValue);
        });

        return { styles };
    }

    uniqId() {
        return `a${Math.random().toString(36).substr(2, 10)}`;
    }

    updateStyles(scoped) {
        const styleTag =  Array.from(this.children).find(v => v.tagName === "STYLE") || document.createElement("style");

        styleTag.type = 'text/css';

        scoped = ".-" + this.uId + " " +
            scoped.replace(/(\n\s*?|}\s*?)(a-z|A-Z|\.|\[|&)/ig, "$1 .-" + this.uId + " $2")
                .replace(/&/g, "");

        if (styleTag.styleSheet){
            styleTag.styleSheet.cssText = scoped;
        } else {
            styleTag.appendChild(document.createTextNode(scoped));
        }

        this.appendChild(styleTag);
    }

    // this method is Preact friendly, once invoked
    // as this.setState({new: 'value'});
    // it will shallow copy properties over
    // and it will invoke this.render() right after
    // setState(objOrFn);

    // all other native Custom Elements method works as usual
    // connectedCallback() { ... }
    // adoptedCallback() { ... }
}

// classes must be defined through their public static method
// this is the moment the class will be fully setup once
// and registered to the customElements Registry.
NSElement.define('ns-element');
