import { View } from "./core/view";

export module web {
    export function getActualHeight(view: View): number {
        if (view.nativeViewProtected) {
            return view.nativeViewProtected.offsetHeight;
        }

        return 0;
    }

    export function getStatusBarHeight(viewController?: UIViewController): number {
        return 0;
    }

    export function _layoutRootView(rootView: View) {
    }
}
