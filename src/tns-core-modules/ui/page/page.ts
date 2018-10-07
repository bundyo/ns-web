import { View, PageBase, Color, actionBarHiddenProperty, statusBarStyleProperty, androidStatusBarBackgroundProperty } from "./page-common";
import { ActionBar } from "../action-bar";
import { device } from "../../platform";
import { profile } from "../../profiling";

import NSPage from "../../../hypers/ns-page";

export * from "./page-common";

export class Page extends PageBase {
    nativeViewProtected: NSPage;

    public createNativeView() {
        console.log("created");
        return document.createElement("ns-page");
    }

    public _addViewToNativeVisualTree(child: View, atIndex?: number): boolean {
        // Set the row property for the child
        if (this.nativeViewProtected && child.nativeViewProtected) {
            this.nativeViewProtected.append(child.nativeViewProtected);
        }

        return super._addViewToNativeVisualTree(child, atIndex);
    }

    @profile
    public onLoaded() {
        super.onLoaded();
        if (this.actionBarHidden !== undefined) {
            this.updateActionBar();
        }
    }

    private updateActionBar() {
        this.actionBar.update();
    }

    [actionBarHiddenProperty.setNative](value: boolean) {
        this.updateActionBar();
    }

    [statusBarStyleProperty.getDefault](): { color: number, systemUiVisibility: number } {
        return null;
    }
    [statusBarStyleProperty.setNative](value: "dark" | "light" | { color: number, systemUiVisibility: number }) {
        console.log(`statusBarStyle not implemented, setting to ${value}. Might want to simulate that for simulators/browsers.`);
    }

    [androidStatusBarBackgroundProperty.getDefault](): number {
        return null;
    }
    [androidStatusBarBackgroundProperty.setNative](value: number | Color) {
        console.log(`statusBarBackground not implemented, setting to ${value}. Might want to simulate that for simulators/browsers.`);
    }
}
