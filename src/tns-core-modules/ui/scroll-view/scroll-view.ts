import { ScrollEventData } from ".";
import { ScrollViewBase, layout, scrollBarIndicatorVisibleProperty } from "./scroll-view-common";

import NSScrollView from "../../../hypers/ns-scroll-view";

export * from "./scroll-view-common";

export class ScrollView extends ScrollViewBase {
    nativeViewProtected: NSScrollView;
    private _webViewId: number = -1;
    private handler: any;

    get horizontalOffset(): number {
        const nativeView = this.nativeViewProtected;
        if (!nativeView) {
            return 0;
        }

        return nativeView.scrollLeft / layout.getDisplayDensity();
    }

    get verticalOffset(): number {
        const nativeView = this.nativeViewProtected;
        if (!nativeView) {
            return 0;
        }

        return nativeView.scrollTop / layout.getDisplayDensity();
    }

    get scrollableWidth(): number {
        const nativeView = this.nativeViewProtected;
        if (!nativeView || this.orientation !== "horizontal") {
            return 0;
        }

        return nativeView.scrollWidth / layout.getDisplayDensity();
    }

    get scrollableHeight(): number {
        const nativeView = this.nativeViewProtected;
        if (!nativeView || this.orientation !== "vertical") {
            return 0;
        }

        return nativeView.scrollHeight / layout.getDisplayDensity();
    }

    [scrollBarIndicatorVisibleProperty.getDefault](): boolean {
        return true;
    }
    [scrollBarIndicatorVisibleProperty.setNative](value: boolean) {
        if (this.orientation === "horizontal") {
            this.nativeViewProtected.style.overflowX = value ? "auto" : "hidden";
        } else {
            this.nativeViewProtected.style.overflowY = value ? "auto" : "hidden";
        }
    }

    public scrollToVerticalOffset(value: number, animated: boolean) {
        const nativeView = this.nativeViewProtected;
        if (nativeView && this.orientation === "vertical") {
            value *= layout.getDisplayDensity();

            nativeView.scrollTo({
                top: value,
                behavior: animated ? "smooth" : "instant"
            });
        }
    }

    public scrollToHorizontalOffset(value: number, animated: boolean) {
        const nativeView = this.nativeViewProtected;
        if (nativeView && this.orientation === "horizontal") {
            value *= layout.getDisplayDensity();

            nativeView.scrollTo({
                left: value,
                behavior: animated ? "smooth" : "instant"
            });
        }
    }

    public createNativeView() {
        const element = document.createElement("ns-scroll-view");

        element["orientation"] = this.orientation;

        return element;
    }

    public _onOrientationChanged() {
        if (this.nativeViewProtected) {
            this.nativeViewProtected.orientation = this.orientation;
        }
    }

    protected attachNative() {
        this.handler = this._onScrollChanged.bind(this);
        this.nativeViewProtected.addEventListener("scroll", this.handler);
    }

    private _lastScrollX: number = -1;
    private _lastScrollY: number = -1;
    private _onScrollChanged() {
        const nativeView = this.nativeViewProtected;
        if (nativeView) {
            // Event is only raised if the scroll values differ from the last time in order to wokraround a native Android bug.
            // https://github.com/NativeScript/NativeScript/issues/2362
            let newScrollX = nativeView.scrollLeft;
            let newScrollY = nativeView.scrollTop;
            if (newScrollX !== this._lastScrollX || newScrollY !== this._lastScrollY) {
                this.notify(<ScrollEventData>{
                    object: this,
                    eventName: ScrollView.scrollEvent,
                    scrollX: newScrollX / layout.getDisplayDensity(),
                    scrollY: newScrollY / layout.getDisplayDensity()
                });
                this._lastScrollX = newScrollX;
                this._lastScrollY = newScrollY;
            }
        }
    }

    protected dettachNative() {
        this.nativeViewProtected.removeEventListener(this.handler);
        this.handler = null;
    }
}

ScrollView.prototype.recycleNativeView = "never";
