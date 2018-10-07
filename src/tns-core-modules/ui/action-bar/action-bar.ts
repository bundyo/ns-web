import NSActionBar from "../../../hypers/ns-action-bar";
import NSActionItem from "../../../hypers/ns-action-item";
import NSNavigationButton from "../../../hypers/ns-navigation-button";

import { ActionItemBase, ActionBarBase, isVisible, View, layout, colorProperty, flatProperty, Color } from "./action-bar-common";
import { RESOURCE_PREFIX } from "../../utils";
import { fromFileOrResource } from "../../image-source";
import * as application from "../../application";

export * from "./action-bar-common";

const R_ID_HOME = 0x0102002c;
const ACTION_ITEM_ID_OFFSET = 10000;
const DEFAULT_ELEVATION = 4;

let actionItemIdGenerator = ACTION_ITEM_ID_OFFSET;
function generateItemId(): number {
    actionItemIdGenerator++;
    return actionItemIdGenerator;
}

const menuItemClickListener: any = function onClick(v) {
    if (v) {
        v._emit(ActionItemBase.tapEvent);
    }
};

export class ActionItem extends ActionItemBase {
    private _webPosition: Object = {
        position: "actionBar",
        systemIcon: undefined
    };

    nativeViewProtected: NSActionItem;

    private _itemId;
    constructor() {
        super();
        this._itemId = generateItemId();
    }

    public createNativeView() {
        return document.createElement("ns-action-item");
    }

    public initNativeView(): void {
        super.initNativeView();
        const view = this.nativeViewProtected;
        view.onclick = menuItemClickListener.bind(this, this);
        (<any>view).menuItemClickListener = menuItemClickListener;
    }

    public disposeNativeView() {
        (<any>this.nativeViewProtected).menuItemClickListener = null;
        super.disposeNativeView();
    }

    public get web(): Object {
        return this._webPosition;
    }
    public set web(value: Object) {
        throw new Error("ActionItem.android is read-only");
    }

    public _getItemId() {
        return this._itemId;
    }
}

export class WebActionBarSettings {
    private _actionBar: ActionBar;
    private _icon: string;
    private _iconVisibility: "auto" | "never" | "always" = "auto";

    constructor(actionBar: ActionBar) {
        this._actionBar = actionBar;
    }

    public get icon(): string {
        return this._icon;
    }
    public set icon(value: string) {
        if (value !== this._icon) {
            this._icon = value;
            this._actionBar._onIconPropertyChanged();
        }
    }

    public get iconVisibility(): "auto" | "never" | "always" {
        return this._iconVisibility;
    }
    public set iconVisibility(value: "auto" | "never" | "always") {
        if (value !== this._iconVisibility) {
            this._iconVisibility = value;
            this._actionBar._onIconPropertyChanged();
        }
    }
}

export class NavigationButton extends ActionItem {
}

export class ActionBar extends ActionBarBase {
    private _web: WebActionBarSettings;
    public nativeViewProtected: NSActionBar;

    constructor() {
        super();
        this._context = {};
        this._web = new WebActionBarSettings(this);
    }

    get web(): WebActionBarSettings {
        return this._web;
    }

    public _addChildFromBuilder(name: string, value: any) {
        if (value instanceof NavigationButton) {
            this.navigationButton = value;
        }
        else if (value instanceof ActionItem) {
            this.actionItems.addItem(value);
        }
        else if (value instanceof View) {
            this.titleView = value;
        }
    }

    public createNativeView() {
        return document.createElement("ns-action-bar");
    }

    public onLoaded() {
        super.onLoaded();
        this.update();
    }

    public update() {
        if (!this.nativeViewProtected) {
            return;
        }

        const page = this.page;
        if (!page.frame || !page.frame._getNavBarVisible(page)) {
            this.nativeViewProtected.style.display = "none";

            // If action bar is hidden - no need to fill it with items.
            return;
        }

        this.nativeViewProtected.style.display = "";

        // Add menu items
        this._addActionItems();

        // Set title
        this._updateTitleAndTitleView();

        // Set home icon
        this._updateIcon();

        // Set navigation button
        this._updateNavigationButton();
    }

    public _updateNavigationButton() {
        const navButton = this.navigationButton;
        if (navButton && isVisible(navButton)) {
            const systemIcon = navButton["web"].systemIcon;
            // if (systemIcon !== undefined) {
            //     // Try to look in the system resources.
            //     const systemResourceId = getSystemResourceId(systemIcon);
            //     if (systemResourceId) {
            //         this.nativeViewProtected.setNavigationIcon(systemResourceId);
            //     }
            // }
            // else if (navButton.icon) {
            //     let drawableOrId = getDrawableOrResourceId(navButton.icon, appResources);
            //     this.nativeViewProtected.setNavigationIcon(drawableOrId);
            // }

            // Set navigation content descripion, used by screen readers for the vision-impaired users
            this.nativeViewProtected.text = navButton.text || null;

            let navBtn = new WeakRef(navButton);
            this.nativeViewProtected.onclick = function (v) {
                let owner = navBtn.get();
                if (owner) {
                    owner._raiseTap();
                }
            };
        }
        else {
            //this.nativeViewProtected.setNavigationIcon(null);
        }
    }

    public _updateIcon() {
        this.nativeViewProtected.icon = this.web.icon;
        // let visibility = getIconVisibility(this.android.iconVisibility);
        // if (visibility) {
        //     let icon = this.web.icon;
        //     if (icon !== undefined) {
        //         let drawableOrId = getDrawableOrResourceId(icon, appResources);
        //         if (drawableOrId) {
        //             this.nativeViewProtected.setLogo(drawableOrId);
        //         }
        //     }
        //     else {
        //         let defaultIcon = application.android.nativeApp.getApplicationInfo().icon;
        //         this.nativeViewProtected.setLogo(defaultIcon);
        //     }
        // }
        // else {
        //     this.nativeViewProtected.setLogo(null);
        // }
    }

    public _updateTitleAndTitleView() {
        this.nativeViewProtected.title = this.title;
        // if (!this.titleView) {
        //     // No title view - show the title
        //     let title = this.title;
        //     if (title !== undefined) {
        //         this.nativeViewProtected.setTitle(title);
        //     } else {
        //         let appContext = application.android.context;
        //         let appInfo = appContext.getApplicationInfo();
        //         let appLabel = appContext.getPackageManager().getApplicationLabel(appInfo);
        //         if (appLabel) {
        //             this.nativeViewProtected.setTitle(appLabel);
        //         }
        //     }
        // }
    }

    public _addActionItems() {
        let items = this.actionItems.getVisibleItems();

        this.nativeViewProtected.innerHTML = "";

        for (let i = 0; i < items.length; i++) {
            let item = <ActionItem>items[i];

            item.nativeViewProtected["text"] = item.text + "";

            if (item.icon) {
                item.nativeViewProtected["icon"] = item.icon;
            }

            this.nativeViewProtected.append(item.nativeViewProtected);
        }
    }

    public _onTitlePropertyChanged() {
        if (this.nativeViewProtected) {
            this._updateTitleAndTitleView();
        }
    }

    public _onIconPropertyChanged() {
        if (this.nativeViewProtected) {
            this._updateIcon();
        }
    }

    public _addViewToNativeVisualTree(child: View, atIndex: number = Number.MAX_VALUE): boolean {
        super._addViewToNativeVisualTree(child);

        if (this.nativeViewProtected && child.nativeViewProtected) {
            if (atIndex >= this.nativeViewProtected.children.length) {
                this.nativeViewProtected.append(child.nativeViewProtected);
            }
            else {
                this.nativeViewProtected.insertBefore(child.nativeViewProtected,
                                                      this.nativeViewProtected.children[atIndex]);
            }
            return true;
        }

        return false;
    }

    public _removeViewFromNativeVisualTree(child: View): void {
        super._removeViewFromNativeVisualTree(child);

        if (child.nativeViewProtected) {
            child.nativeViewProtected.remove();
        }
    }

    getTitle() {
        return this.nativeViewProtected.querySelector(".ns-action-bar__title");
    }

    [colorProperty.getDefault](): number {
        return this.getTitle().style.color;
    }
    [colorProperty.setNative](value: number | Color) {
        this.getTitle().style.color = value instanceof Color ? value.android : value;
    }

    [flatProperty.setNative](value: boolean) {
        // const compat = <any>android.support.v4.view.ViewCompat;
        // if (compat.setElevation) {
        //     if (value) {
        //         compat.setElevation(this.nativeViewProtected, 0);
        //     } else {
        //         const val = DEFAULT_ELEVATION * layout.getDisplayDensity();
        //         compat.setElevation(this.nativeViewProtected, val);
        //     }
        // }
    }
}

function getAppCompatTextView(toolbar: android.support.v7.widget.Toolbar): typeof Object {
    // for (let i = 0, count = toolbar.getChildCount(); i < count; i++) {
    //     const child = toolbar.getChildAt(i);
    //     if (child instanceof AppCompatTextView) {
    //         return child;
    //     }
    // }
    //
    return null;
}

ActionBar.prototype.recycleNativeView = "auto";

let defaultTitleTextColor: number;

function getDrawableOrResourceId(icon: string, resources: android.content.res.Resources): any {
    if (typeof icon !== "string") {
        return undefined;
    }

    if (icon.indexOf(RESOURCE_PREFIX) === 0) {
        let resourceId: number = resources.getIdentifier(icon.substr(RESOURCE_PREFIX.length), "drawable", application.android.packageName);
        if (resourceId > 0) {
            return resourceId;
        }
    }
    else {
        let drawable: android.graphics.drawable.BitmapDrawable;

        let is = fromFileOrResource(icon);
        if (is) {
            drawable = new android.graphics.drawable.BitmapDrawable(is.android);
        }

        return drawable;
    }

    return undefined;
}

function getShowAsAction(menuItem: ActionItem): number {
    switch (menuItem.android.position) {
        case "actionBarIfRoom":
            return android.view.MenuItem.SHOW_AS_ACTION_IF_ROOM;

        case "popup":
            return android.view.MenuItem.SHOW_AS_ACTION_NEVER;

        case "actionBar":
        default:
            return android.view.MenuItem.SHOW_AS_ACTION_ALWAYS;
    }
}

function getIconVisibility(iconVisibility: string): boolean {
    switch (iconVisibility) {
        case "always":
            return true;

        case "auto":
        case "never":
        default:
            return false;
    }
}

function getSystemResourceId(systemIcon: string): number {
    return android.content.res.Resources.getSystem().getIdentifier(systemIcon, "drawable", "android");
}
