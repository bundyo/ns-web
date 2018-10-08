import "~/src/tns-core-modules/bundle-entry-points";

import {
    notify, launchEvent, setApplication
} from "./application-common";
import { createViewFromEntry } from "~/src/tns-core-modules/ui/builder";

import "../../css/nweb.css";

import "../../css/_app-common.scss";

import "../../hypers/ns-element";
import "../../hypers/ns-button";
import "../../hypers/ns-absolute-layout";
import "../../hypers/ns-grid-layout";
import "../../hypers/ns-stack-layout";
import "../../hypers/ns-wrap-layout";
import "../../hypers/ns-scroll-view";
import "../../hypers/ns-action-bar";
import "../../hypers/ns-action-item";
import "../../hypers/ns-navigation-button";
import "../../hypers/ns-page";
import "../../hypers/ns-frame";
import "../../hypers/ns-image";
import "../../hypers/ns-label";

// First reexport so that app module is initialized.
export * from "./application-common";

class Application {
    constructor(entry) {
        this.started = null;
    }

    setEntry(entry) {
        this.entry = entry;
    }

    scheduleAnimation(currentEntry, nextEntry, callback) {
        if (currentEntry) {
            const transition = nextEntry.entry.transition;

            const prevElement = currentEntry.resolvedPage.nativeView,
                nextElement = nextEntry.resolvedPage.nativeView,
                parentElement = nextElement.parentElement,
                transitionEnd = () => {
                    parentElement.removeEventListener("transitionend", transitionEnd);

                    parentElement.classList.remove("ns-fx", "ns-fx-end", "ns-fx-start", "ns-fx-slide", "ns-fx-reverse");

                    prevElement.classList.add("ns-fx-hidden");
                    prevElement.classList.remove("ns-fx-current", "ns-fx-next");
                    nextElement.classList.remove("ns-fx-next", "ns-fx-current");
                    callback();
                };

            if (currentEntry.resolvedPage.frame._isBack) {
                parentElement.classList.add("ns-fx-reverse");
            }

            prevElement.classList.add("ns-fx-current");
            nextElement.classList.add("ns-fx-next");

            prevElement.classList.remove("ns-fx-hidden");
            nextElement.classList.remove("ns-fx-hidden");

            parentElement.classList.add("ns-fx", "ns-fx-start", `ns-fx-${ transition ? (transition.name || transition) : "slide" }`);
            nextElement.offsetWidth;

            parentElement.transitionHandled = false;
            parentElement.addEventListener("transitionend", transitionEnd);

            parentElement.classList.remove("ns-fx-start");
            parentElement.classList.add("ns-fx-end");

            setTimeout(transitionEnd, 300);
        } else {
            callback();
        }
    }
}

const webApp = new Application();

const appModule = require("./application-common");
const observable = require("../data/observable");
import { Frame } from "../ui/frame";

const trace = require("../trace");

trace.enable();
trace.setCategories(trace.categories.All);

export class WebApplication extends observable.Observable {
    constructor() {
        super(arguments);
        this._registeredReceivers = {};
        this._pendingReceiverRegistrations = [];
    }

    init(webApp) {
        if (this._nativeApp) {
            throw new Error("application.web already initialized.");
        }

        this._window = {};

        this._nativeApp = webApp;
        // this.packageName = webApp.getPackageName();
        // this.context = webApp.getApplicationContext();
        this._registerPendingReceivers();

        notify({
            eventName: launchEvent,
            object: this,
            web: null
        });

        //this._rootView = webApp.entry.root;

        if (!this._rootView) {
            // try to navigate to the mainEntry (if specified)
            if (mainEntry) {
                if (createRootFrame.value) {
                    const frame = this._rootView = new Frame();
                    frame.navigate(mainEntry);
                } else {
                    this._rootView = createViewFromEntry(mainEntry);
                }
            } else {
                // TODO: Throw an exception?
                throw new Error("A Frame must be used to navigate to a Page.");
            }
        }

        this._window.content = this._rootView;

        document.body.append(this._rootView.web);

        if (!this._rootView.isLoaded) {
            this._rootView.callLoaded();
        }

        return this._rootView;
        // if (rootView instanceof Frame) {
        //     this.rootController = this._window.rootViewController = rootView.web.controller;
        // }
        // else {
        //     throw new Error("Root should be either UIViewController or UIView");
        // }
    }

    get nativeApp() {
        return this._nativeApp;
    }

    get window() {
        return this._window;
    }

    get rootView() {
        return this._rootView;
    }

    _registerPendingReceivers() {
        if (this._pendingReceiverRegistrations) {
            var i = 0;
            var length = this._pendingReceiverRegistrations.length;
            for (; i < length; i++) {
                var registerFunc = this._pendingReceiverRegistrations[i];
                registerFunc(this.context);
            }
            this._pendingReceiverRegistrations = [];
        }
    }
}

let started = false;
const createRootFrame = {value: true};
let mainEntry;

export const web = new WebApplication();

function createRootView(v) {
    let rootView = v;
    if (!rootView) {
        // try to navigate to the mainEntry (if specified)
        if (mainEntry) {
            if (createRootFrame.value) {
                const frame = rootView = new Frame();
                frame.navigate(mainEntry);
            } else {
                rootView = createViewFromEntry(mainEntry);
            }
        } else {
            // TODO: Throw an exception?
            throw new Error("A Frame must be used to navigate to a Page.");
        }
    }

    return rootView;
}

export function getMainEntry() {
    return mainEntry;
}

export function getRootView() {
    return webApp.rootView;
}

export function start(entry) {
    if (started) {
        throw new Error("Application is already started.");
    }
    if (entry) {
        mainEntry = entry;
    }

    if (this.mainModule) {
        entry = mainEntry = {
            moduleName: this.mainModule
        }
    }

    if (!web.nativeApp) {
        setApplication(web);

        webApp.setEntry(entry);

        document.addEventListener("DOMContentLoaded", function () {
            web.init(webApp);
        });
    }
    started = true;
}

export function run(entry) {
    createRootFrame.value = false;
    start(entry);
}

export function addCss(cssText) {
    // var parsed = exports.parseCss(cssText);
    // if (parsed) {
    //     exports.additionalSelectors.push.apply(exports.additionalSelectors, parsed);
    //     exports.mergeCssSelectors(exports);
    // }
}

Object.assign(appModule, {WebApplication, start, addCss, getMainEntry, getRootView});
