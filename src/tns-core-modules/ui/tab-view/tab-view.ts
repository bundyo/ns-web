﻿import { TabViewItem as TabViewItemDefinition } from ".";
import { Font } from "../styling/font";

import { ios as iosView, ViewBase } from "../core/view";
import {
    TabViewBase, TabViewItemBase, itemsProperty, selectedIndexProperty,
    tabTextColorProperty, tabTextFontSizeProperty, tabBackgroundColorProperty, selectedTabTextColorProperty, iosIconRenderingModeProperty,
    View, fontInternalProperty, layout, traceEnabled, traceWrite, traceCategories, Color
} from "./tab-view-common"
import { textTransformProperty, TextTransform, getTransformedText } from "../text-base";
import { fromFileOrResource } from "../../image-source";
import { profile } from "../../profiling";
import { Frame } from "../frame";

export * from "./tab-view-common";

class UITabBarControllerImpl extends UITabBarController {

    private _owner: WeakRef<TabView>;

    public static initWithOwner(owner: WeakRef<TabView>): UITabBarControllerImpl {
        let handler = <UITabBarControllerImpl>UITabBarControllerImpl.new();
        handler._owner = owner;
        return handler;
    }

    @profile
    public viewWillAppear(animated: boolean): void {
        super.viewWillAppear(animated);
        const owner = this._owner.get();
        if (!owner) {
            return;
        }

        iosView.updateAutoAdjustScrollInsets(this, owner);

        if (!owner.parent) {
            owner.callLoaded();
        }
    }

    @profile
    public viewDidDisappear(animated: boolean): void {
        super.viewDidDisappear(animated);
        const owner = this._owner.get();
        if (owner && !owner.parent && owner.isLoaded && !this.presentedViewController) {
            owner.callUnloaded();
        }
    }
}

class UITabBarControllerDelegateImpl extends NSObject implements UITabBarControllerDelegate {
    public static ObjCProtocols = [UITabBarControllerDelegate];

    private _owner: WeakRef<TabView>;

    public static initWithOwner(owner: WeakRef<TabView>): UITabBarControllerDelegateImpl {
        let delegate = <UITabBarControllerDelegateImpl>UITabBarControllerDelegateImpl.new();
        delegate._owner = owner;
        return delegate;
    }

    public tabBarControllerShouldSelectViewController(tabBarController: UITabBarController, viewController: UIViewController): boolean {
        if (traceEnabled()) {
            traceWrite("TabView.delegate.SHOULD_select(" + tabBarController + ", " + viewController + ");", traceCategories.Debug);
        }

        let owner = this._owner.get();
        if (owner) {
            // "< More" cannot be visible after clicking on the main tab bar buttons.
            let backToMoreWillBeVisible = false;
            owner._handleTwoNavigationBars(backToMoreWillBeVisible);
        }

        (<any>tabBarController)._willSelectViewController = viewController;

        return true;
    }

    public tabBarControllerDidSelectViewController(tabBarController: UITabBarController, viewController: UIViewController): void {
        if (traceEnabled()) {
            traceWrite("TabView.delegate.DID_select(" + tabBarController + ", " + viewController + ");", traceCategories.Debug);
        }

        const owner = this._owner.get();
        if (owner) {
            owner._onViewControllerShown(viewController);
        }

        (<any>tabBarController)._willSelectViewController = undefined;
    }
}

class UINavigationControllerDelegateImpl extends NSObject implements UINavigationControllerDelegate {
    public static ObjCProtocols = [UINavigationControllerDelegate];

    private _owner: WeakRef<TabView>;

    public static initWithOwner(owner: WeakRef<TabView>): UINavigationControllerDelegateImpl {
        let delegate = <UINavigationControllerDelegateImpl>UINavigationControllerDelegateImpl.new();
        delegate._owner = owner;
        return delegate;
    }

    navigationControllerWillShowViewControllerAnimated(navigationController: UINavigationController, viewController: UIViewController, animated: boolean): void {
        if (traceEnabled()) {
            traceWrite("TabView.moreNavigationController.WILL_show(" + navigationController + ", " + viewController + ", " + animated + ");", traceCategories.Debug);
        }

        let owner = this._owner.get();
        if (owner) {
            // If viewController is one of our tab item controllers, then "< More" will be visible shortly.
            // Otherwise viewController is the UIMoreListController which shows the list of all tabs beyond the 4th tab.
            let backToMoreWillBeVisible = owner._ios.viewControllers.containsObject(viewController);
            owner._handleTwoNavigationBars(backToMoreWillBeVisible);
        }
    }

    navigationControllerDidShowViewControllerAnimated(navigationController: UINavigationController, viewController: UIViewController, animated: boolean): void {
        if (traceEnabled()) {
            traceWrite("TabView.moreNavigationController.DID_show(" + navigationController + ", " + viewController + ", " + animated + ");", traceCategories.Debug);
        }
        // We don't need Edit button in More screen.
        navigationController.navigationBar.topItem.rightBarButtonItem = null;
        let owner = this._owner.get();
        if (owner) {
            owner._onViewControllerShown(viewController);
        }
    }
}

function updateItemTitlePosition(tabBarItem: UITabBarItem): void {
    if (typeof (<any>tabBarItem).setTitlePositionAdjustment === "function") {
        (<any>tabBarItem).setTitlePositionAdjustment({ horizontal: 0, vertical: -20 });
    } else {
        tabBarItem.titlePositionAdjustment = { horizontal: 0, vertical: -20 };
    }
}

function updateItemIconPosition(tabBarItem: UITabBarItem): void {
    tabBarItem.imageInsets = new UIEdgeInsets({ top: 6, left: 0, bottom: -6, right: 0 });
}

export class TabViewItem extends TabViewItemBase {
    private __controller: UIViewController;

    public setViewController(controller: UIViewController, nativeView: UIView) {
        this.__controller = controller;
        this.setNativeView(nativeView);
    }

    public disposeNativeView() {
        this.__controller = undefined;
        this.setNativeView(undefined);
    }

    public loadView(view: ViewBase): void {
        const tabView = this.parent as TabViewBase;
        if (tabView && tabView.items) {
            const index = tabView.items.indexOf(this);

            if (index === tabView.selectedIndex) {
                super.loadView(view);
            }
        }
    }

    public _update() {
        const parent = <TabView>this.parent;
        const controller = this.__controller;
        if (parent && controller) {
            const icon = parent._getIcon(this.iconSource);
            const index = parent.items.indexOf(this);
            const title = getTransformedText(this.title, this.style.textTransform);

            const tabBarItem = UITabBarItem.alloc().initWithTitleImageTag(title, icon, index);
            if (!icon) {
                updateItemTitlePosition(tabBarItem);
            } else if (!title) {
                updateItemIconPosition(tabBarItem);
            }

            // TODO: Repeating code. Make TabViewItemBase - ViewBase and move the colorProperty on tabViewItem.
            // Delete the repeating code.
            const states = getTitleAttributesForStates(parent);
            applyStatesToItem(tabBarItem, states);
            controller.tabBarItem = tabBarItem;
        }
    }

    [textTransformProperty.setNative](value: TextTransform) {
        this._update();
    }
}

export class TabView extends TabViewBase {
    public viewController: UITabBarControllerImpl;
    public _ios: UITabBarControllerImpl;
    private _delegate: UITabBarControllerDelegateImpl;
    private _moreNavigationControllerDelegate: UINavigationControllerDelegateImpl;
    private _iconsCache = {};

    constructor() {
        super();

        this.viewController = this._ios = UITabBarControllerImpl.initWithOwner(new WeakRef(this));
        this.nativeViewProtected = this._ios.view;
    }

    initNativeView() {
        super.initNativeView();
        this._delegate = UITabBarControllerDelegateImpl.initWithOwner(new WeakRef(this));
        this._moreNavigationControllerDelegate = UINavigationControllerDelegateImpl.initWithOwner(new WeakRef(this));
    }

    disposeNativeView() {
        this._delegate = null;
        this._moreNavigationControllerDelegate = null;
        super.disposeNativeView();
    }

    @profile
    public onLoaded() {
        super.onLoaded();

        const selectedIndex = this.selectedIndex;
        const selectedView = this.items && this.items[selectedIndex] && this.items[selectedIndex].view;
        if (selectedView instanceof Frame) {
            selectedView._pushInFrameStack();
        }

        this._ios.delegate = this._delegate;
    }

    public onUnloaded() {
        this._ios.delegate = null;
        this._ios.moreNavigationController.delegate = null;
        super.onUnloaded();
    }

    get ios(): UITabBarController {
        return this._ios;
    }

    public layoutNativeView(left: number, top: number, right: number, bottom: number): void {
        //
    }

    public _setNativeViewFrame(nativeView: UIView, frame: CGRect) {
        //
    }

    public onSelectedIndexChanged(oldIndex: number, newIndex: number): void {
        const items = this.items;
        if (!items) {
            return;
        }

        const oldItem = items[oldIndex];
        if (oldItem) {
            oldItem.unloadView(oldItem.view);
        }

        const newItem = items[newIndex];
        if (newItem && this.isLoaded) {
            const selectedView = items[newIndex].view;
            if (selectedView instanceof Frame) {
                selectedView._pushInFrameStack();
            }

            newItem.loadView(newItem.view);
        }

        super.onSelectedIndexChanged(oldIndex, newIndex);
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        const width = layout.getMeasureSpecSize(widthMeasureSpec);
        const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);

        const height = layout.getMeasureSpecSize(heightMeasureSpec);
        const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);

        const widthAndState = View.resolveSizeAndState(width, width, widthMode, 0);
        const heightAndState = View.resolveSizeAndState(height, height, heightMode, 0);

        this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public _onViewControllerShown(viewController: UIViewController) {
        // This method could be called with the moreNavigationController or its list controller, so we have to check.
        if (traceEnabled()) {
            traceWrite("TabView._onViewControllerShown(" + viewController + ");", traceCategories.Debug);
        }
        if (this._ios.viewControllers && this._ios.viewControllers.containsObject(viewController)) {
            this.selectedIndex = this._ios.viewControllers.indexOfObject(viewController);
        } else {
            if (traceEnabled()) {
                traceWrite("TabView._onViewControllerShown: viewController is not one of our viewControllers", traceCategories.Debug);
            }
        }
    }

    private _actionBarHiddenByTabView: boolean;
    public _handleTwoNavigationBars(backToMoreWillBeVisible: boolean) {
        if (traceEnabled()) {
            traceWrite(`TabView._handleTwoNavigationBars(backToMoreWillBeVisible: ${backToMoreWillBeVisible})`, traceCategories.Debug);
        }

        // The "< Back" and "< More" navigation bars should not be visible simultaneously.
        const page = this.page || this._selectedView.page || (<any>this)._selectedView.currentPage;
        if (!page || !page.frame) {
            return;
        }

        let actionBarVisible = page.frame._getNavBarVisible(page);

        if (backToMoreWillBeVisible && actionBarVisible) {
            page.frame.ios._disableNavBarAnimation = true;
            page.actionBarHidden = true;
            page.frame.ios._disableNavBarAnimation = false;
            this._actionBarHiddenByTabView = true;
            if (traceEnabled()) {
                traceWrite(`TabView hid action bar`, traceCategories.Debug);
            }
            return;
        }

        if (!backToMoreWillBeVisible && this._actionBarHiddenByTabView) {
            page.frame.ios._disableNavBarAnimation = true;
            page.actionBarHidden = false;
            page.frame.ios._disableNavBarAnimation = false;
            this._actionBarHiddenByTabView = undefined;
            if (traceEnabled()) {
                traceWrite(`TabView restored action bar`, traceCategories.Debug);
            }
            return;
        }
    }

    private getViewController(item: TabViewItem): UIViewController {
        let newController: UIViewController = item.view ? item.view.viewController : null;

        if (newController) {
            item.setViewController(newController, newController.view);
            return newController;
        }

        if (item.view.ios instanceof UIViewController) {
            newController = item.view.ios;
            item.setViewController(newController, newController.view);
        } else if (item.view.ios && item.view.ios.controller instanceof UIViewController) {
            newController = item.view.ios.controller;
            item.setViewController(newController, newController.view);
        } else {
            newController = iosView.UILayoutViewController.initWithOwner(new WeakRef(item.view)) as UIViewController;
            newController.view.addSubview(item.view.nativeViewProtected);
            item.view.viewController = newController;
            item.setViewController(newController, item.view.nativeViewProtected);
        }

        return newController;
    }

    private setViewControllers(items: TabViewItem[]) {
        const length = items ? items.length : 0;
        if (length === 0) {
            this._ios.viewControllers = null;
            return;
        }

        const controllers = NSMutableArray.alloc<UIViewController>().initWithCapacity(length);
        const states = getTitleAttributesForStates(this);

        items.forEach((item, i) => {
            const controller = this.getViewController(item);
            const icon = this._getIcon(item.iconSource);
            const tabBarItem = UITabBarItem.alloc().initWithTitleImageTag((item.title || ""), icon, i);
            if (!icon) {
                updateItemTitlePosition(tabBarItem);
            } else if (!item.title) {
                updateItemIconPosition(tabBarItem);
            }

            applyStatesToItem(tabBarItem, states);

            controller.tabBarItem = tabBarItem;
            controllers.addObject(controller);
            (<TabViewItemDefinition>item).canBeLoaded = true;
        });

        this._ios.viewControllers = controllers;
        this._ios.customizableViewControllers = null;

        // When we set this._ios.viewControllers, someone is clearing the moreNavigationController.delegate, so we have to reassign it each time here.
        this._ios.moreNavigationController.delegate = this._moreNavigationControllerDelegate;
    }

    private _getIconRenderingMode(): UIImageRenderingMode {
        switch (this.iosIconRenderingMode) {
            case "alwaysOriginal":
                return UIImageRenderingMode.AlwaysOriginal;
            case "alwaysTemplate":
                return UIImageRenderingMode.AlwaysTemplate;
            case "automatic":
            default:
                return UIImageRenderingMode.Automatic;
        }
    }

    public _getIcon(iconSource: string): UIImage {
        if (!iconSource) {
            return null;
        }

        let image: UIImage = this._iconsCache[iconSource];
        if (!image) {
            const is = fromFileOrResource(iconSource);
            if (is && is.ios) {
                const originalRenderedImage = is.ios.imageWithRenderingMode(this._getIconRenderingMode());
                this._iconsCache[iconSource] = originalRenderedImage;
                image = originalRenderedImage;
            }
        }

        return image;
    }

    private _updateIOSTabBarColorsAndFonts(): void {
        if (!this.items) {
            return;
        }

        const tabBar = <UITabBar>this.ios.tabBar;
        const states = getTitleAttributesForStates(this);
        for (let i = 0; i < tabBar.items.count; i++) {
            applyStatesToItem(tabBar.items[i], states);
        }
    }

    [selectedIndexProperty.setNative](value: number) {
        if (traceEnabled()) {
            traceWrite("TabView._onSelectedIndexPropertyChangedSetNativeValue(" + value + ")", traceCategories.Debug);
        }

        if (value > -1) {
            (<any>this._ios)._willSelectViewController = this._ios.viewControllers[value];
            this._ios.selectedIndex = value;
        }
    }

    [itemsProperty.getDefault](): TabViewItem[] {
        return null;
    }
    [itemsProperty.setNative](value: TabViewItem[]) {
        this.setViewControllers(value);
        selectedIndexProperty.coerce(this);
    }

    [tabTextFontSizeProperty.getDefault](): number {
        return null;
    }
    [tabTextFontSizeProperty.setNative](value: number | { nativeSize: number }) {
        this._updateIOSTabBarColorsAndFonts();
    }

    [tabTextColorProperty.getDefault](): UIColor {
        return null;
    }
    [tabTextColorProperty.setNative](value: UIColor | Color) {
        this._updateIOSTabBarColorsAndFonts();
    }

    [tabBackgroundColorProperty.getDefault](): UIColor {
        return this._ios.tabBar.barTintColor;
    }
    [tabBackgroundColorProperty.setNative](value: UIColor | Color) {
        this._ios.tabBar.barTintColor = value instanceof Color ? value.ios : value;
    }

    [selectedTabTextColorProperty.getDefault](): UIColor {
        return this._ios.tabBar.tintColor;
    }
    [selectedTabTextColorProperty.setNative](value: UIColor) {
        this._ios.tabBar.tintColor = value instanceof Color ? value.ios : value;
        this._updateIOSTabBarColorsAndFonts();
    }

    // TODO: Move this to TabViewItem
    [fontInternalProperty.getDefault](): Font {
        return null;
    }
    [fontInternalProperty.setNative](value: Font) {
        this._updateIOSTabBarColorsAndFonts();
    }

    // TODO: Move this to TabViewItem
    [iosIconRenderingModeProperty.getDefault](): "automatic" | "alwaysOriginal" | "alwaysTemplate" {
        return "automatic";
    }
    [iosIconRenderingModeProperty.setNative](value: "automatic" | "alwaysOriginal" | "alwaysTemplate") {
        this._iconsCache = {};
        let items = this.items;
        if (items && items.length) {
            for (let i = 0, length = items.length; i < length; i++) {
                const item = items[i];
                if (item.iconSource) {
                    (<TabViewItem>item)._update();
                }
            }
        }
    }
}

interface TabStates {
    normalState?: any;
    selectedState?: any;
}

function getTitleAttributesForStates(tabView: TabView): TabStates {
    const result: TabStates = {};

    const defaultTabItemFontSize = 10;
    const tabItemFontSize = tabView.style.tabTextFontSize || defaultTabItemFontSize;
    const font: UIFont = tabView.style.fontInternal.getUIFont(UIFont.systemFontOfSize(tabItemFontSize));
    const tabItemTextColor = tabView.style.tabTextColor;
    const textColor = tabItemTextColor instanceof Color ? tabItemTextColor.ios : null;
    result.normalState = { [NSFontAttributeName]: font }
    if (textColor) {
        result.normalState[UITextAttributeTextColor] = textColor
    }

    const tabSelectedItemTextColor = tabView.style.selectedTabTextColor;
    const selectedTextColor = tabItemTextColor instanceof Color ? tabSelectedItemTextColor.ios : null;
    result.selectedState = { [NSFontAttributeName]: font }
    if (selectedTextColor) {
        result.selectedState[UITextAttributeTextColor] = selectedTextColor
    }

    return result;
}

function applyStatesToItem(item: UITabBarItem, states: TabStates) {
    item.setTitleTextAttributesForState(states.normalState, UIControlState.Normal);
    item.setTitleTextAttributesForState(states.selectedState, UIControlState.Selected);
}