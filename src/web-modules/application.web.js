var appModule = require("../tns-core-modules/application/application-common");
var observable = require("data/observable");
var webApp = require("../application");
var Frame = require("ui/frame").Frame;
var trace = require("trace");

trace.enable();

global.moduleMerge(appModule, exports);

var WebApplication = (function (_super) {
    __extends(WebApplication, _super);
    function WebApplication() {
        _super.apply(this, arguments);
        this._registeredReceivers = {};
        this._pendingReceiverRegistrations = new Array();
    }
    WebApplication.prototype.init = function (webApp) {
        if (this.nativeApp) {
            throw new Error("application.web already initialized.");
        }

        this._window = {};

        this.nativeApp = webApp;
        // this.packageName = webApp.getPackageName();
        // this.context = webApp.getApplicationContext();
        this._registerPendingReceivers();

        if (exports.onLaunch) {
            exports.onLaunch();
        }

        exports.notify({
            eventName: exports.launchEvent,
            object: this,
            web: null
        });

        var rootView = webApp.entry.root;
        var frame;
        var navParam;
        if (!rootView) {
            navParam = exports.mainEntry;
            if (!navParam) {
                navParam = exports.mainModule;
            }
            if (navParam) {
                frame = new Frame();
                frame.navigate(navParam);
            }
            else {
                throw new Error("A Frame must be used to navigate to a Page.");
            }
            rootView = frame;
        }
        this._window.content = rootView;
        // if (rootView instanceof Frame) {
        //     this.rootController = this._window.rootViewController = rootView.web.controller;
        // }
        // else {
        //     throw new Error("Root should be either UIViewController or UIView");
        // }
    };
    WebApplication.prototype._registerPendingReceivers = function () {
        if (this._pendingReceiverRegistrations) {
            var i = 0;
            var length = this._pendingReceiverRegistrations.length;
            for (; i < length; i++) {
                var registerFunc = this._pendingReceiverRegistrations[i];
                registerFunc(this.context);
            }
            this._pendingReceiverRegistrations = new Array();
        }
    };
    return WebApplication;
}(observable.Observable));
exports.WebApplication = WebApplication;

var started = false;
function start(entry) {
    if (started) {
        throw new Error("Application is already started.");
    }
    if (entry) {
        exports.mainEntry = entry;
    }

    if (this.mainModule) {
        entry = exports.mainEntry = {
            moduleName: this.mainModule
        }
    }

    if (!exports.web || !exports.web.nativeApp) {
        exports.web = new WebApplication();
        webApp.setEntry(entry);

        document.addEventListener("DOMContentLoaded", function () {
            exports.web.init(webApp);
        });
    }
    started = true;
}
exports.start = start;

function addCss(cssText) {
    // var parsed = exports.parseCss(cssText);
    // if (parsed) {
    //     exports.additionalSelectors.push.apply(exports.additionalSelectors, parsed);
    //     exports.mergeCssSelectors(exports);
    // }
}
exports.addCss = addCss;
