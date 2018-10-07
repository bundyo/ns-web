import NSButton from "./ns-button";

export default class NSActionItem extends NSButton {

    static get observedAttributes() { return ["position"].concat(super.observedAttributes); }

}

NSActionItem.define('ns-action-item');
