﻿/* tslint:disable:class-name */
import { Device as DeviceDefinition, ScreenMetrics as ScreenMetricsDefinition } from ".";

import * as utils from "../utils/utils";

export module platformNames {
    export const android = "Android";
    export const ios = "iOS";
}

class Device implements DeviceDefinition {
    private _model: string;
    private _osVersion: string;
    private _sdkVersion: string;
    private _deviceType: "Phone" | "Tablet";
    private _language: string;
    private _region: string;

    get manufacturer(): string {
        return "Apple";
    }

    get os(): string {
        return platformNames.ios;
    }

    get osVersion(): string {
        if (!this._osVersion) {
            this._osVersion = utils.ios.getter(UIDevice, UIDevice.currentDevice).systemVersion;
        }

        return this._osVersion;
    }

    get model(): string {
        if (!this._model) {
            this._model = utils.ios.getter(UIDevice, UIDevice.currentDevice).model;
        }

        return this._model;
    }

    get sdkVersion(): string {
        if (!this._sdkVersion) {
            this._sdkVersion = utils.ios.getter(UIDevice, UIDevice.currentDevice).systemVersion;
        }

        return this._sdkVersion;
    }

    get deviceType(): "Phone" | "Tablet" {
        if (!this._deviceType) {
            if (utils.ios.getter(UIDevice, UIDevice.currentDevice).userInterfaceIdiom === UIUserInterfaceIdiom.Phone) {
                this._deviceType = "Phone";
            }
            else {
                this._deviceType = "Tablet";
            }
        }

        return this._deviceType;
    }

    get uuid(): string {
        var userDefaults = utils.ios.getter(NSUserDefaults, NSUserDefaults.standardUserDefaults);
        var uuid_key = "TNSUUID";
        var app_uuid = userDefaults.stringForKey(uuid_key);

        if (!app_uuid) {
            app_uuid = NSUUID.UUID().UUIDString;
            userDefaults.setObjectForKey(app_uuid, uuid_key);
            userDefaults.synchronize();
        }

        return app_uuid;
    }

    get language(): string {
        if (!this._language) {
            var languages = utils.ios.getter(NSLocale, NSLocale.preferredLanguages);
            this._language = languages[0];
        }
        
        return this._language;
    }

    get region(): string {
        if (!this._region) {
            this._region = utils.ios.getter(NSLocale, NSLocale.currentLocale).objectForKey(NSLocaleCountryCode);
        }

        return this._region;
    }
}

class MainScreen implements ScreenMetricsDefinition {
    private _screen: UIScreen;
    
    private get screen(): UIScreen {
        if (!this._screen) {
            this._screen = utils.ios.getter(UIScreen, UIScreen.mainScreen);
        }

        return this._screen;
    }

    get widthPixels(): number {
        return this.widthDIPs * this.scale;
    }
    get heightPixels(): number {
        return this.heightDIPs * this.scale;
    }
    get scale(): number {
        return this.screen.scale;
    }
    get widthDIPs(): number {
        return this.screen.bounds.size.width;
    }
    get heightDIPs(): number {
        return this.screen.bounds.size.height;
    }
}

export const device = new Device();

export module screen {
    export const mainScreen = new MainScreen();
}

export const isIOS = true;
