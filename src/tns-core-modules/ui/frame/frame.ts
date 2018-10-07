// Definitions.
import { BackstackEntry, NavigationTransition, Observable } from ".";
import { Page } from "../page";
import { profile } from "../../profiling";

import { web } from "../../application/application.js";

//Types.
import NSFrame from "../../../hypers/ns-frame.js";
import { FrameBase, View, layout, traceEnabled, traceWrite, traceError, traceCategories, isCategorySet, stack } from "./frame-common";

import * as utils from "../../utils";

export * from "./frame-common";

const ownerSymbol = Symbol("_owner");

let navDepth = -1;
let fragmentId = -1;
export let moduleLoaded: boolean;

export let attachStateChangeListener;

function getAttachListener() {
    if (!attachStateChangeListener) {
        class AttachListener {
            onViewAttachedToWindow(view): void {
                const owner: View = view[ownerSymbol];
                if (owner) {
                    owner._onAttachedToWindow();
                }
            }

            onViewDetachedFromWindow(view): void {
                const owner: View = view[ownerSymbol];
                if (owner) {
                    owner._onDetachedFromWindow();
                }
            }
        }

        attachStateChangeListener = new AttachListener();
    }

    return attachStateChangeListener;
}

export class Frame extends FrameBase {

    private _containerViewId: number = -1;
    private _tearDownPending = false;
    private _attachedToWindow = false;

    public nativeViewProtected: NSFrame;
    public _context: any;
    public _isBack: boolean = true;

    constructor() {
        super();
        this._context = {};
        this.nativeViewProtected = document.createElement("ns-frame");
    }

    createNativeView() {
        return this.nativeViewProtected;
    }

    public get web(): NSFrame {
        return this.nativeViewProtected;
    }

    public static get defaultAnimatedNavigation(): boolean {
        return FrameBase.defaultAnimatedNavigation;
    }
    public static set defaultAnimatedNavigation(value: boolean) {
        FrameBase.defaultAnimatedNavigation = value;
    }

    public static get defaultTransition(): NavigationTransition {
        return FrameBase.defaultTransition;
    }
    public static set defaultTransition(value: NavigationTransition) {
        FrameBase.defaultTransition = value;
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        // const width = layout.getMeasureSpecSize(widthMeasureSpec);
        // const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);
        //
        // const height = layout.getMeasureSpecSize(heightMeasureSpec);
        // const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);
        //
        // const widthAndState = View.resolveSizeAndState(width, width, widthMode, 0);
        // const heightAndState = View.resolveSizeAndState(height, height, heightMode, 0);
        //
        // this.setMeasuredDimension(widthAndState, heightAndState);
    }

    public layoutNativeView(left: number, top: number, right: number, bottom: number): void {
        //
    }

    public _setNativeViewFrame(nativeView: UIView, frame: CGRect) {
        //
    }

    public _onNavigatingTo(backstackEntry: BackstackEntry, isBack: boolean) {
        //
    }

    _onAttachedToWindow(): void {
        super._onAttachedToWindow();
        this._attachedToWindow = true;
        this._processNextNavigationEntry();
    }

    _onDetachedFromWindow(): void {
        super._onDetachedFromWindow();
        this._attachedToWindow = false;
    }

    public onBackPressed(): boolean {
        if (this.canGoBack()) {
            this.goBack();
            return true;
        }

        return false;
    }

    @profile
    public _navigateCore(newEntry: BackstackEntry) {
        super._navigateCore(newEntry);
        this._isBack = false;

        // set frameId here so that we could use it in fragment.transitions
        newEntry.frameId = this.nativeViewProtected.frameId;

        // New Fragment
        if (newEntry.entry.clearHistory) {
            navDepth = -1;
        }

        navDepth++;

        this.web.append(this._createPage(newEntry));
        web.nativeApp.scheduleAnimation(this._currentEntry, newEntry, this.setCurrent.bind(this, newEntry, this._isBack));
    }

    public setCurrent(entry: BackstackEntry, isBack: boolean): void {
        const current = this._currentEntry;
        const currentEntryChanged = current !== entry;
        if (currentEntryChanged) {
            this._updateBackstack(entry, isBack);

            super.setCurrent(entry, isBack);

            // If we had real navigation process queue.
            this._processNavigationQueue(entry.resolvedPage);
        } else {
            // Otherwise currentPage was recreated so this wasn't real navigation.
            // Continue with next item in the queue.
            this._processNextNavigationEntry();
        }
    }

    _createPage(entry) {
        if (!entry) {
            traceError(`onCreateView: entry is null or undefined`);
            return null;
        }

        const page = entry.resolvedPage;
        if (!page) {
            traceError(`onCreateView: entry has no resolvedPage`);
            return null;
        }

        if (page.parent === this) {
            // If we are navigating to a page that was destroyed
            // reinitialize its UI.
            if (!page._context) {
                page._setupUI({});
            }
        } else {
            if (!this._styleScope) {
                // Make sure page will have styleScope even if parents don't.
                page._updateStyleScope();
            }

            this._addView(page);
        }

        if (this.isLoaded && !page.isLoaded) {
            page.callLoaded();
        }

        const savedState = entry.viewSavedState;
        if (savedState) {
            page.nativeViewProtected.restoreHierarchyState(savedState);
            entry.viewSavedState = null;
        }

        return page.nativeViewProtected;
    }

    public _goBackCore(backstackEntry: BackstackEntry) {
        this._isBack = true;
        super._goBackCore(backstackEntry);
        navDepth = backstackEntry.navDepth;

        web.nativeApp.scheduleAnimation(this._currentEntry, backstackEntry, this.setCurrent.bind(this, backstackEntry, this._isBack));
    }

    public _removeEntry(removed: BackstackEntry): void {
        super._removeEntry(removed);

        // if (removed.fragment) {
        //     _clearEntry(removed);
        // }

        // removed.fragment = null;
        // removed.viewSavedState = null;
    }

    public initNativeView(): void {
        super.initNativeView();
        const listener = getAttachListener();
        this.nativeViewProtected.addOnAttachStateChangeListener(listener);
        this.nativeViewProtected[ownerSymbol] = this;
        this.nativeViewProtected.rootViewGroup = this.nativeViewProtected;
        if (this._containerViewId < 0) {
            this._containerViewId = android.view.View.generateViewId();
        }
        this.nativeViewProtected.rootViewGroup.setId(this._containerViewId);
    }

    public disposeNativeView() {
        const listener = getAttachListener();
        this.nativeViewProtected.removeOnAttachStateChangeListener(listener);
        this.nativeViewProtected[ownerSymbol] = null;
        this._tearDownPending = !!this._executingEntry;
        const current = this._currentEntry;

        this.backStack.forEach(entry => {
            // Don't destroy current and executing entries or UI will look blank.
            // We will do it in setCurrent.
            if (entry !== this._executingEntry) {
                clearEntry(entry);
            }
        });

        if (current && !this._executingEntry) {
            clearEntry(current);
        }

        this.nativeViewProtected.rootViewGroup = null;
        super.disposeNativeView();
    }

    public _popFromFrameStack() {
        if (!this._isInFrameStack) {
            return;
        }

        super._popFromFrameStack();
    }

    public _getNavBarVisible(page: Page): boolean {
        if (page.actionBarHidden !== undefined) {
            return !page.actionBarHidden;
        }

        if (this.nativeViewProtected && this.nativeViewProtected.showActionBar !== undefined) {
            return this.nativeViewProtected.showActionBar;
        }

        return true;
    }
}

function clearEntry(entry: BackstackEntry): void {
    // if (entry.fragment) {
    //     _clearFragment(entry);
    // }

    entry.recreated = false;
    entry.fragment = null;
    const page = entry.resolvedPage;
    if (page._context) {
        entry.resolvedPage._tearDownUI(true);
    }
}
