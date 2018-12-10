import {
    TextDecoration,
    TextAlignment,
    TextTransform,
    paddingTopProperty,
    Length,
    paddingRightProperty,
    paddingBottomProperty, paddingLeftProperty
} from ".";
import { Font } from "../styling/font";
import {
    TextBaseCommon, textProperty, formattedTextProperty, textAlignmentProperty, textDecorationProperty,
    textTransformProperty, letterSpacingProperty, colorProperty, fontInternalProperty, lineHeightProperty,
    FormattedString, Span, Color, isBold
} from "./text-base-common";

import NSElement from "../../../hypers/ns-element";

export * from "./text-base-common";

export class TextBase extends TextBaseCommon {

    public nativeViewProtected: NSElement;
    public nativeTextViewProtected: NSElement;

    [textProperty.getDefault](): number | symbol {
        return this.nativeTextViewProtected["text"];
    }
    [textProperty.setNative](value: string | number | symbol) {
        this.nativeTextViewProtected["text"] = value;
    }

    [formattedTextProperty.setNative](value: FormattedString) {
        createSpannableStringBuilder(value).forEach((el) => this.nativeTextViewProtected.append(el));
    }

    [colorProperty.getDefault](): string {
        return this.nativeTextViewProtected.style.color;
    }
    [colorProperty.setNative](value: string) {
        this.nativeTextViewProtected.style.color = value;
    }

    [fontInternalProperty.getDefault](): string {
        return this.nativeTextViewProtected.style.font;
    }
    [fontInternalProperty.setNative](value: string) {
        this.nativeTextViewProtected.style.font = value;
    }

    [textAlignmentProperty.setNative](value: string) {
        this.nativeTextViewProtected.style.textAlign = value;
    }

    [textDecorationProperty.setNative](value: string) {
        this.nativeTextViewProtected.style.textDecoration = value;
    }

    [textTransformProperty.setNative](value: string) {
        this.nativeTextViewProtected.style.textTransform = value;
    }

    [letterSpacingProperty.setNative](value: string) {
        this.nativeTextViewProtected.style.letterSpacing = value;
    }

    [lineHeightProperty.setNative](value: string) {
        this.nativeTextViewProtected.style.lineHeight = value;
    }

    [paddingTopProperty.getDefault](): Length {
        return { value: this._defaultPaddingTop, unit: "px" }
    }
    [paddingTopProperty.setNative](value: Length) {
        this.nativeViewProtected.style.paddingTop = value + "px";
    }

    [paddingRightProperty.getDefault](): Length {
        return { value: this._defaultPaddingRight, unit: "px" }
    }
    [paddingRightProperty.setNative](value: Length) {
        this.nativeViewProtected.style.paddingRight = value + "px";
    }

    [paddingBottomProperty.getDefault](): Length {
        return { value: this._defaultPaddingBottom, unit: "px" }
    }
    [paddingBottomProperty.setNative](value: Length) {
        this.nativeViewProtected.style.paddingBottom = value + "px";
    }

    [paddingLeftProperty.getDefault](): Length {
        return { value: this._defaultPaddingLeft, unit: "px" }
    }
    [paddingLeftProperty.setNative](value: Length) {
        this.nativeViewProtected.style.paddingLeft = value + "px";
    }
}

function createSpannableStringBuilder(formattedString: FormattedString) {
    if (!formattedString) {
        return null;
    }

    let spans = [];
    for (let i = 0, length = formattedString.spans.length; i < length; i++) {
        const item = formattedString.spans.getItem(i);
        const text = item.text;

        const span = document.createElement("span");
        span.innerHTML = (text === null || text === undefined) ? "" : text.toString();
        span.className = item.className || "";

        ["fontFamily", "fontSize", "fontStyle", "fontWeight", "textDecoration", "color", "backgroundColor"].forEach((k) => {
            item.style[k] && (span.style[k] = item.style[k]);
        });

        spans.push(span);
    }

    return spans;
}
