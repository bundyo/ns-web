import {
    write as traceWrite, categories as traceCategories, messageType as traceMessageType
} from "../trace";

import { layout as layoutCommon } from "./utils-common";
export * from "./utils-common";

let mainScreenScale;

function isOrientationLandscape(orientation: number) {
    return orientation === UIDeviceOrientation.LandscapeLeft || orientation === UIDeviceOrientation.LandscapeRight;
}


export module layout {
    var MODE_SHIFT = 30;
    var MODE_MASK = 0x3 << MODE_SHIFT;

    export function makeMeasureSpec(size: number, mode: number): number {
        return (Math.round(Math.max(0, size)) & ~MODE_MASK) | (mode & MODE_MASK);
    }

    export function getDisplayDensity(): number {
        return mainScreenScale;
    }

    export function toDevicePixels(value: number): number {
        return value * mainScreenScale;
    }

    export function toDeviceIndependentPixels(value: number): number {
        return value / mainScreenScale;
    }

    export function measureNativeView(nativeView: any /* UIView */, width: number, widthMode: number, height: number, heightMode: number): { width: number, height: number } {
        const view = <UIView>nativeView;
        const nativeSize = view.sizeThatFits({
            width: widthMode === 0 /* layout.UNSPECIFIED */ ? Number.POSITIVE_INFINITY : toDeviceIndependentPixels(width),
            height: heightMode === 0 /* layout.UNSPECIFIED */ ? Number.POSITIVE_INFINITY : toDeviceIndependentPixels(height)
        });

        nativeSize.width = layoutCommon.round(toDevicePixels(nativeSize.width));
        nativeSize.height = layoutCommon.round(toDevicePixels(nativeSize.height));
        return nativeSize;
    }
}

export module web {
    export function getter<T>(_this: any, property: T | { (): T }): T {
        if (typeof property === "function") {
            return (<{ (): T }>property).call(_this);
        } else {
            return <T>property;
        }
    }

    export function isLandscape(): boolean {
        return window.innerWidth > window.innerHeight;
    }

    export var MajorVersion = 1;

    export function openFile(filePath: string): boolean {
        try {
            throw new Error("openFile not implemented");
            // const appPath = getCurrentAppPath();
            // const path = filePath.replace("~", appPath)
            //
            // const controller = UIDocumentInteractionController.interactionControllerWithURL(NSURL.fileURLWithPath(path));
            // controller.delegate = new UIDocumentInteractionControllerDelegateImpl();
            // return controller.presentPreviewAnimated(true);
        }
        catch (e) {
            traceWrite("Error in openFile", traceCategories.Error, traceMessageType.error);
        }
        return false;
    }

    export function getCurrentAppPath(): string {
        const currentDir = __dirname;
        const tnsModulesIndex = currentDir.indexOf("/tns_modules");

        // Module not hosted in ~/tns_modules when bundled. Use current dir.
        let appPath = currentDir;
        if (tnsModulesIndex !== -1) {
            // Strip part after tns_modules to obtain app root
            appPath = currentDir.substring(0, tnsModulesIndex);
        }

        return appPath;
    }

    export function joinPaths(...paths: string[]): string {
        if (!paths || paths.length === 0) {
            return "";
        }

        return paths.join("/");
    }

    export function getVisibleViewController(rootViewController: UIViewController): UIViewController {
        // if (rootViewController.presentedViewController) {
        //     return getVisibleViewController(rootViewController.presentedViewController);
        // }
        //
        // if (rootViewController.isKindOfClass(UINavigationController.class())) {
        //     return getVisibleViewController((<UINavigationController>rootViewController).visibleViewController);
        // }
        //
        // if (rootViewController.isKindOfClass(UITabBarController.class())) {
        //     let selectedTab = (<UITabBarController>rootViewController).selectedViewController;
        //     return getVisibleViewController(<UITabBarController>rootViewController);
        // }

        return rootViewController;

    }

}

export function GC() {
    __collect();
}

export function openUrl(location: string): boolean {
    try {
        throw new Error("openUrl not implemented");
        // var url = NSURL.URLWithString(location.trim());
        // if (ios.getter(UIApplication, UIApplication.sharedApplication).canOpenURL(url)) {
        //     return ios.getter(UIApplication, UIApplication.sharedApplication).openURL(url);
        // }
    }
    catch (e) {
        // We Don't do anything with an error.  We just output it
        traceWrite("Error in OpenURL", traceCategories.Error, traceMessageType.error);
    }
    return false;
}

//class UIDocumentInteractionControllerDelegateImpl extends NSObject implements UIDocumentInteractionControllerDelegate {
    // public static ObjCProtocols = [UIDocumentInteractionControllerDelegate];
    //
    // public getViewController(): UIViewController {
    //     const app = ios.getter(UIApplication, UIApplication.sharedApplication);
    //     return app.keyWindow.rootViewController;
    // }
    //
    // public documentInteractionControllerViewControllerForPreview(controller: UIDocumentInteractionController) {
    //     return this.getViewController();
    // }
    //
    // public documentInteractionControllerViewForPreview(controller: UIDocumentInteractionController) {
    //     return this.getViewController().view;
    // }
    //
    // public documentInteractionControllerRectForPreview(controller: UIDocumentInteractionController): CGRect {
    //     return this.getViewController().view.frame;
    // }
//}

mainScreenScale = 1.0;
