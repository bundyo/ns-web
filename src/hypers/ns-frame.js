import NSElement from "./ns-element";

let frameId = 1;

export default class NSFrame extends NSElement {
    constructor() {
        super();
        this._frameId = frameId++;
    }

    get frameId () {
        return this._frameId;
    }
}

NSFrame.define('ns-frame');
