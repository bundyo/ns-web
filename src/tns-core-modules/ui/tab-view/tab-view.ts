import { TabViewItem as TabViewItemDefinition } from ".";
import { Font } from "../styling/font";

import {
    TabViewBase, TabViewItemBase, itemsProperty, selectedIndexProperty,
    tabTextColorProperty, tabBackgroundColorProperty, tabTextFontSizeProperty, selectedTabTextColorProperty,
    fontSizeProperty, fontInternalProperty, layout, traceCategory, traceEnabled,
    traceWrite, Color
} from "./tab-view-common"
import { textTransformProperty, TextTransform, getTransformedText } from "../text-base";
import { fromFileOrResource } from "../../image-source";
import { RESOURCE_PREFIX, ad } from "../../utils";
import { Frame } from "../frame";

import NSElement from "../../../hypers/ns-element";

export * from "./tab-view-common";

const ACCENT_COLOR = "colorAccent";
const PRIMARY_COLOR = "colorPrimary";
const DEFAULT_ELEVATION = 4;

interface PagerAdapter {
    new(owner: TabView): android.support.v4.view.PagerAdapter;
}

const TABID = "_tabId";
const INDEX = "_index";
let PagerAdapter: PagerAdapter;

export class TabViewItem extends TabViewItemBase {
    nativeViewProtected: NSElement;
    public index: number;
    private _defaultTransformationMethod: "none";

    public onLoaded(): void {
        super.onLoaded();
    }

    public disposeNativeView(): void {
        super.disposeNativeView();
        (<TabViewItemDefinition>this).canBeLoaded = false;
    }

    public createNativeView() {
        return document.createElement("ns-element");
    }

    _update() {}

    //[fontSizeProperty.getDefault](): { nativeSize: number } {
    //    return { nativeSize: this.nativeViewProtected.getTextSize() };
    //}
    //[fontSizeProperty.setNative](value: number | { nativeSize: number }) {
    //    if (typeof value === "number") {
    //        this.nativeViewProtected.setTextSize(value);
    //    } else {
    //        this.nativeViewProtected.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, value.nativeSize);
    //    }
    //}
    //
    //[fontInternalProperty.getDefault](): android.graphics.Typeface {
    //    return this.nativeViewProtected.getTypeface();
    //}
    //[fontInternalProperty.setNative](value: Font | android.graphics.Typeface) {
    //    this.nativeViewProtected.setTypeface(value instanceof Font ? value.getAndroidTypeface() : value);
    //}
    //
    //[textTransformProperty.getDefault](): "default" {
    //    return "default";
    //}
    //[textTransformProperty.setNative](value: TextTransform | "default") {
    //    const tv = this.nativeViewProtected;
    //    if (value === "default") {
    //        tv.setTransformationMethod(this._defaultTransformationMethod);
    //        tv.setText(this.title);
    //    } else {
    //        const result = getTransformedText(this.title, value);
    //        tv.setText(result);
    //        tv.setTransformationMethod(null);
    //    }
    //}
}

export const tabs = [];

export class TabView extends TabViewBase {
    private _tabLayout: org.nativescript.widgets.TabLayout;
    private _webViewId: number = -1;

    constructor() {
        super();
        tabs.push(new WeakRef(this));
    }

    public onItemsChanged(oldItems: TabViewItem[], newItems: TabViewItem[]): void {
        super.onItemsChanged(oldItems, newItems);

        if (oldItems) {
            oldItems.forEach((item: TabViewItem, i, arr) => {
                item.index = 0;
                item.setNativeView(null);
            });
        }
    }

    public createNativeView() {
        if (traceEnabled()) {
            traceWrite("TabView._createUI(" + this + ");", traceCategory);
        }

        const nativeView = new org.nativescript.widgets.GridLayout(this._context);
        const viewPager = new org.nativescript.widgets.TabViewPager(this._context);
        const tabLayout = new org.nativescript.widgets.TabLayout(this._context);
        const lp = new org.nativescript.widgets.CommonLayoutParams();
        const primaryColor = ad.resources.getPaletteColor(PRIMARY_COLOR, this._context);

        lp.row = 1;

        //if (this.androidTabsPosition === "top") {
        //    nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.auto));
        //    nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.star));
        //
        //    viewPager.setLayoutParams(lp);
        //} else {
        //    nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.star));
        //    nativeView.addRow(new org.nativescript.widgets.ItemSpec(1, org.nativescript.widgets.GridUnitType.auto));
        //
        //    tabLayout.setLayoutParams(lp);
        //    viewPager.setSwipePageEnabled(false);
        //    // set completely transparent accent color for tab selected indicator.
        //    accentColor = 0x00FFFFFF;
        //}

        nativeView.addView(viewPager);
        (<any>nativeView).viewPager = viewPager;

        const adapter = new PagerAdapter(this);
        viewPager.setAdapter(adapter);
        (<any>viewPager).adapter = adapter;

        nativeView.addView(tabLayout);
        (<any>nativeView).tabLayout = tabLayout;

        if (primaryColor) {
            tabLayout.setBackgroundColor(primaryColor);
        }

        return nativeView;
    }

    public initNativeView(): void {
        super.initNativeView();
        if (this._webViewId < 0) {
            this._webViewId = 1;
        }

        const nativeView: any = this.nativeViewProtected;
        this._tabLayout = (<any>nativeView).tabLayout;

        const viewPager = (<any>nativeView).viewPager;
        viewPager.setId(this._webViewId);
    }

    public _loadUnloadTabItems(newIndex: number) {
        const items = this.items;

        let toUnload = [];
        let toLoad = [];

        items.forEach((item, i) => {
            const indexOfI = toLoad.indexOf(i);
            if (indexOfI < 0) {
                toUnload.push(i);
            }
        });

        toUnload.forEach(index => {
            const item = items[index];
            if (items[index]) {
                item.unloadView(item.view);
            }
        });

        const newItem = items[newIndex];
        const selectedView = newItem && newItem.view;
        if (selectedView instanceof Frame) {
            selectedView._pushInFrameStack();
        }

        toLoad.forEach(index => {
            const item = items[index];
            if (this.isLoaded && items[index]) {
                item.loadView(item.view);
            }
        });
    }

    public disposeNativeView() {
        this._tabLayout.setItems(null, null);

        this._tabLayout = null;
        super.disposeNativeView();
    }

    public onBackPressed(): boolean {
        const currentView = this._selectedView;
        if (currentView) {
            return currentView.onBackPressed();
        }

        return false;
    }

    //[selectedIndexProperty.setNative](value: number) {
    //    if (traceEnabled()) {
    //        traceWrite("TabView this._viewPager.setCurrentItem(" + value + ", true);", traceCategory);
    //    }
    //
    //    this._viewPager.setCurrentItem(value, true);
    //}
    //
    //[itemsProperty.getDefault](): TabViewItem[] {
    //    return null;
    //}
    //[itemsProperty.setNative](value: TabViewItem[]) {
    //    this.setAdapterItems(value);
    //    selectedIndexProperty.coerce(this);
    //}
    //
    //[tabBackgroundColorProperty.getDefault](): android.graphics.drawable.Drawable {
    //    return this._tabLayout.getBackground();
    //}
    //[tabBackgroundColorProperty.setNative](value: android.graphics.drawable.Drawable | Color) {
    //    if (value instanceof Color) {
    //        this._tabLayout.setBackgroundColor(value.android);
    //    } else {
    //        this._tabLayout.setBackground(tryCloneDrawable(value, this.nativeViewProtected.getResources));
    //    }
    //}
    //
    //[tabTextFontSizeProperty.getDefault](): number {
    //    return this._tabLayout.getTabTextFontSize();
    //}
    //[tabTextFontSizeProperty.setNative](value: number | { nativeSize: number }) {
    //    if (typeof value === "number") {
    //        this._tabLayout.setTabTextFontSize(value);
    //    } else {
    //        this._tabLayout.setTabTextFontSize(value.nativeSize);
    //    }
    //}
    //
    //[tabTextColorProperty.getDefault](): number {
    //    return this._tabLayout.getTabTextColor();
    //}
    //[tabTextColorProperty.setNative](value: number | Color) {
    //    const color = value instanceof Color ? value.android : value;
    //    this._tabLayout.setTabTextColor(color);
    //}
    //
    //[selectedTabTextColorProperty.getDefault](): number {
    //    return this._tabLayout.getSelectedTabTextColor();
    //}
    //[selectedTabTextColorProperty.setNative](value: number | Color) {
    //    const color = value instanceof Color ? value.android : value;
    //    this._tabLayout.setSelectedTabTextColor(color);
    //}
}

