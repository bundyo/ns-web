/* tslint:disable:class-name */
import { Device as DeviceDefinition, ScreenMetrics as ScreenMetricsDefinition } from ".";
import * as appModule from "../application";

const MIN_TABLET_PIXELS = 600;

export module platformNames {
    export const android = "Android";
    export const ios = "iOS";
    export const web = "Web";
}

class Device implements DeviceDefinition {
    private _manufacturer: string;
    private _model: string;
    private _osVersion: string;
    private _sdkVersion: string;
    private _deviceType: "Phone" | "Tablet";
    private _uuid: string;
    private _language: string;
    private _region: string;

    get os(): string {
        return platformNames.web;
    }

    get manufacturer(): string {
        if (!this._manufacturer) {
            this._manufacturer = "{N}";
        }

        return this._manufacturer;
    }

    get osVersion(): string {
        if (!this._osVersion) {
            this._osVersion = "1";
        }

        return this._osVersion;
    }

    get model(): string {
        if (!this._model) {
            this._model = "Web Model";
        }

        return this._model;
    }

    get sdkVersion(): string {
        if (!this._sdkVersion) {
            this._sdkVersion = navigator.userAgent;
        }

        return this._sdkVersion;
    }

    get deviceType(): "Phone" | "Tablet" {
        if (!this._deviceType) {
            const dips = Math.min(window.innerWidth, window.innerHeight) / window.devicePixelRatio;
            // If the device has more than 600 dips it is considered to be a tablet.
            if (dips >= MIN_TABLET_PIXELS) {
                this._deviceType = "Tablet";
            }
            else {
                this._deviceType = "Phone";
            }
        }

        return this._deviceType;
    }

    get uuid(): string {
        if (!this._uuid) {
            this._uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        return this._uuid;
    }

    get language(): string {
        if (!this._language) {
            this._language = "en_US";
        }

        return this._language;
    }

    get region(): string {
        if (!this._region) {
            this._region = "bg";
        }

        return this._region;
    }
}

class MainScreen implements ScreenMetricsDefinition {
    private get metrics() {
        // if (!this._metrics) {
        //     // NOTE: This will be memory leak but we MainScreen is singleton
        //     appModule.on("cssChanged", this.reinitMetrics, this);
        //     appModule.on(appModule.orientationChangedEvent, this.reinitMetrics, this);
        //
        //     this._metrics = new android.util.DisplayMetrics();
        //     this.initMetrics();
        // }
        // return this._metrics;
        return "";
    }

    get widthPixels(): number {
        return window.innerWidth;
    }
    get heightPixels(): number {
        return window.innerHeight;
    }
    get scale(): number {
        return window.devicePixelRatio;
    }
    get widthDIPs(): number {
        return window.innerWidth / window.devicePixelRatio;
    }
    get heightDIPs(): number {
        return window.innerHeight / window.devicePixelRatio;
    }

}

export const device = new Device();

export module screen {
    export const mainScreen = new MainScreen();
}

export const isWeb = true;
