import { ItemEventData, ItemsSource } from ".";
import {
    ListViewBase, View, KeyedTemplate, Length, unsetValue, Observable, Color,
    separatorColorProperty, itemTemplatesProperty
} from "./list-view-common";
import { StackLayout } from "../layouts/stack-layout";
import { ProxyViewContainer } from "../proxy-view-container";
import { LayoutBase } from "../layouts/layout-base";
import { profile } from "../../profiling";
import { WebApplication } from "../../application";

import NSElement from "../../../hypers/ns-element";
import NSListView from "../../../hypers/ns-list-view";

import * as utils from "../../../utils";

export * from "./list-view-common";

const ITEMLOADING = ListViewBase.itemLoadingEvent;
const LOADMOREITEMS = ListViewBase.loadMoreItemsEvent;
const ITEMTAP = ListViewBase.itemTapEvent;

let ItemClickListener;

function initializeItemClickListener(): void {
    if (ItemClickListener) {
        return;
    }

    class ItemClickListenerImpl {
        private owner: any;

        constructor(owner) {
            this.owner = owner;
        }

        public onItemClick(event) {
            const child = utils.childOf(event.target, "ns-list-view");
            const index = utils.index(child);

            if (this.owner) {
                const view = this.owner._realizedTemplates.get(this.owner._getItemTemplate(index).key).get(child);

                this.owner.notify({eventName: ITEMTAP, object: this.owner, index: index, view: view});
            }
        }
    }

    ItemClickListener = ItemClickListenerImpl;
}


export class ListView extends ListViewBase {
    nativeViewProtected: NSListView;
    private _webViewId: number = -1;

    public _realizedItems = new Map<NSElement, View>();
    public _realizedTemplates = new Map<string, Map<NSElement, View>>();

    @profile
    public createNativeView() {
        return document.createElement("ns-list-view");
    }

    public initNativeView(): void {
        super.initNativeView();
        this.updateEffectiveRowHeight();

        const nativeView = this.nativeViewProtected;

        initializeItemClickListener();
        ensureListViewAdapterClass();

        nativeView.adapter = new ListViewAdapterClass(this);

        const itemClickListener = new ItemClickListener(this);
        nativeView.onclick = itemClickListener.onItemClick.bind(itemClickListener);

        if (this._webViewId < 0) {
            this._webViewId = WebApplication.generateViewId();
        }
    }

    public disposeNativeView() {
        const nativeView = this.nativeViewProtected;
        //nativeView.setAdapter(null);
        nativeView.onclick = null;
        //(<any>nativeView).adapter.owner = null;
        nativeView.adapter = null;
        this.clearRealizedCells();
        super.disposeNativeView();
    }

    public onLoaded() {
        super.onLoaded();
        // Without this call itemClick won't be fired... :(
        this.requestLayout();
    }

    public refresh() {
        const nativeView = this.nativeViewProtected;
        if (!nativeView || !nativeView.adapter) {
            return;
        }

        // clear bindingContext when it is not observable because otherwise bindings to items won't reevaluate
        this._realizedItems.forEach((view, nativeView) => {
            if (!(view.bindingContext instanceof Observable)) {
                view.bindingContext = null;
            }
        });

        (<any>this.items).forEach((v, i) => {
            this.nativeView.append(this.nativeViewProtected.adapter.getView(i));
        });
    }

    public scrollToIndex(index: number) {
        const nativeView = this.nativeViewProtected;
        if (nativeView) {
            nativeView.setSelection(index);
        }
    }

    public scrollToIndexAnimated(index: number) {
        const nativeView = this.nativeViewProtected;
        if (nativeView) {
            nativeView.smoothScrollToPosition(index);
        }
    }

    get _childrenCount(): number {
        return this._realizedItems.size;
    }

    public eachChildView(callback: (child: View) => boolean): void {
        this._realizedItems.forEach((view, nativeView) => {
            if (view.parent instanceof ListView) {
                callback(view);
            }
            else {
                // in some cases (like item is unloaded from another place (like angular) view.parent becomes undefined)
                if (view.parent) {
                    callback(<View>view.parent);
                }
            }
        });
    }

    public _dumpRealizedTemplates() {
        console.log(`Realized Templates:`);
        this._realizedTemplates.forEach((value, index) => {
            console.log(`\t${index}:`);
            value.forEach((value, index) => {
                console.log(`\t\t${index.hashCode()}: ${value}`);
            });
        });
        console.log(`Realized Items Size: ${this._realizedItems.size}`);
    }

    private clearRealizedCells(): void {
        // clear the cache
        this._realizedItems.forEach((view, nativeView) => {
            if (view.parent) {
                // This is to clear the StackLayout that is used to wrap non LayoutBase & ProxyViewContainer instances.
                if (!(view.parent instanceof ListView)) {
                    this._removeView(view.parent);
                }
                view.parent._removeView(view);
            }
        });

        this._realizedItems.clear();
        this._realizedTemplates.clear();
    }

    public isItemAtIndexVisible(index: number): boolean {
        let nativeView = this.nativeViewProtected;
        const start = nativeView.getFirstVisiblePosition();
        const end =  nativeView.getLastVisiblePosition();
        return ( index >= start && index <= end );
    }

    [separatorColorProperty.getDefault](): { dividerHeight: number, divider: android.graphics.drawable.Drawable } {
        let nativeView = this.nativeViewProtected;
        return {
            dividerHeight: nativeView.getDividerHeight(),
            divider: nativeView.getDivider()
        };
    }
    [separatorColorProperty.setNative](value: Color | { dividerHeight: number, divider: android.graphics.drawable.Drawable }) {
        let nativeView = this.nativeViewProtected;
        if (value instanceof Color) {
            nativeView.setDivider(new android.graphics.drawable.ColorDrawable(value.android));
            nativeView.setDividerHeight(1);
        } else {
            nativeView.setDivider(value.divider);
            nativeView.setDividerHeight(value.dividerHeight);
        }
    }

    [itemTemplatesProperty.getDefault](): KeyedTemplate[] {
        return null;
    }
    [itemTemplatesProperty.setNative](value: KeyedTemplate[]) {
        this._itemTemplatesInternal = new Array<KeyedTemplate>(this._defaultTemplate);
        if (value) {
            this._itemTemplatesInternal = this._itemTemplatesInternal.concat(value);
        }

        this.nativeViewProtected.adapter = new ListViewAdapterClass(this);
        this.refresh();
    }
}

let ListViewAdapterClass;
function ensureListViewAdapterClass() {
    if (ListViewAdapterClass) {
        return;
    }

    class ListViewAdapter {
        constructor(public owner: ListView) {}

        public getCount() {
            return this.owner && this.owner.items && this.owner.items.length ? this.owner.items.length : 0;
        }

        public getItem(i: number) {
            if (this.owner && this.owner.items && i < this.owner.items.length) {
                let getItem = (<ItemsSource>this.owner.items).getItem;
                return getItem ? getItem.call(this.owner.items, i) : this.owner.items[i];
            }

            return null;
        }

        public getItemId(i: number) {
            let item = this.getItem(i);
            let id = i;
            if (this.owner && item && this.owner.items) {
                id = this.owner.itemIdGenerator(item, i, this.owner.items);
            }
            return long(id);
        }

        public hasStableIds(): boolean {
            return true;
        }

        public getViewTypeCount() {
            return this.owner._itemTemplatesInternal.length;
        }

        public getItemViewType(index: number) {
            let template = this.owner._getItemTemplate(index);
            let itemViewType = this.owner._itemTemplatesInternal.indexOf(template);
            return itemViewType;
        }

        @profile
        public getView(index: number, convertView: any, parent: any): any {
            //this.owner._dumpRealizedTemplates();

            if (!this.owner) {
                return null;
            }

            let totalItemCount = this.owner.items ? this.owner.items.length : 0;
            if (index === (totalItemCount - 1)) {
                this.owner.notify({ eventName: LOADMOREITEMS, object: this.owner });
            }

            // Recycle an existing view or create a new one if needed.
            let template = this.owner._getItemTemplate(index);
            let view: View;
            if (convertView) {
                view = this.owner._realizedTemplates.get(template.key).get(convertView);
                if (!view) {
                    throw new Error(`There is no entry with key '${convertView}' in the realized views cache for template with key'${template.key}'.`);
                }
            }
            else {
                view = template.createView();
            }

            let args: ItemEventData = {
                eventName: ITEMLOADING, object: this.owner, index: index, view: view,
                web: parent,
                android: parent,
                ios: undefined
            };

            this.owner.notify(args);

            if (!args.view) {
                args.view = this.owner._getDefaultItemContent(index);
            }

            if (args.view) {
                if (this.owner._effectiveRowHeight > -1) {
                    args.view.height = this.owner.rowHeight;
                }
                else {
                    args.view.height = <Length>unsetValue;
                }

                this.owner._prepareItem(args.view, index);
                if (!args.view.parent) {
                    // Proxy containers should not get treated as layouts.
                    // Wrap them in a real layout as well.
                    if (args.view instanceof LayoutBase &&
                        !(args.view instanceof ProxyViewContainer)) {
                        this.owner._addView(args.view);
                        convertView = args.view.nativeViewProtected;
                    } else {
                        let sp = new StackLayout();
                        sp.addChild(args.view);
                        this.owner._addView(sp);

                        convertView = sp.nativeViewProtected;
                    }
                }

                // Cache the view for recycling
                let realizedItemsForTemplateKey = this.owner._realizedTemplates.get(template.key);
                if (!realizedItemsForTemplateKey) {
                    realizedItemsForTemplateKey = new Map<NSElement, View>();
                    this.owner._realizedTemplates.set(template.key, realizedItemsForTemplateKey);
                }
                realizedItemsForTemplateKey.set(convertView, args.view);
                this.owner._realizedItems.set(convertView, args.view);
            }

            return convertView;
        }
    }

    ListViewAdapterClass = ListViewAdapter;
}
