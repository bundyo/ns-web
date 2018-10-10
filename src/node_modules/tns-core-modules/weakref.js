export class WeakRef {
    constructor(target) {
        this._target = target;
    }

    get() {
        return this._target;
    }

    clear() {
        delete this._target;
    }
}

global.WeakRef = WeakRef;
