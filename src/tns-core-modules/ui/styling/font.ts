import { Font as FontBase, parseFontFamily, genericFontFamilies, FontStyle, FontWeight } from "./font-common";
import { isEnabled as traceEnabled, write as traceWrite, categories as traceCategories, messageType as traceMessageType } from "../../trace";
import { device } from "../../platform"
import * as fs from "../../file-system";
import * as utils from "../../utils";
export * from "./font-common";

export class Font extends FontBase {
    public static default = new Font(undefined, undefined, FontStyle.NORMAL, FontWeight.NORMAL);

    private _uiFont: UIFont;

    constructor(family: string, size: number, style: FontStyle, weight: FontWeight) {
        super(family, size, style, weight);
    }

    public withFontFamily(family: string): Font {
        return new Font(family, this.fontSize, this.fontStyle, this.fontWeight);
    }

    public withFontStyle(style: FontStyle): Font {
        return new Font(this.fontFamily, this.fontSize, style, this.fontWeight);
    }

    public withFontWeight(weight: FontWeight): Font {
        return new Font(this.fontFamily, this.fontSize, this.fontStyle, weight);
    }

    public withFontSize(size: number): Font {
        return new Font(this.fontFamily, size, this.fontStyle, this.fontWeight);
    }

    public getUIFont(defaultFont: UIFont): UIFont {
        if (!this._uiFont) {
            this._uiFont = createUIFont(this, defaultFont);
        }
        return this._uiFont;
    }

    public getAndroidTypeface(): android.graphics.Typeface {
        return undefined;
    }
}

function createUIFont(font: Font, defaultFont: UIFont): UIFont {
    return null;
}
