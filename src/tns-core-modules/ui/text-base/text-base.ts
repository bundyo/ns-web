import { TextDecoration, TextAlignment, TextTransform } from ".";
import { Font } from "../styling/font";
import {
    TextBaseCommon, textProperty, formattedTextProperty, textAlignmentProperty, textDecorationProperty,
    textTransformProperty, letterSpacingProperty, colorProperty, fontInternalProperty, lineHeightProperty,
    FormattedString, Span, Color, isBold
} from "./text-base-common";

export * from "./text-base-common";

export class TextBase extends TextBaseCommon {

    public nativeViewProtected: HTMLElement;
    public nativeTextViewProtected: HTMLElement;

    [textProperty.getDefault](): number | symbol {
        return this.nativeTextViewProtected["text"];
    }
    [textProperty.setNative](value: string | number | symbol) {
        this.nativeTextViewProtected["text"] = value;
    }

    [formattedTextProperty.setNative](value: string) {
        this.nativeTextViewProtected["text"] = value;
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

    setFormattedTextDecorationAndTransform() {
        // const attrText = this.createNSMutableAttributedString(this.formattedText);
        // // TODO: letterSpacing should be applied per Span.
        // if (this.letterSpacing !== 0) {
        //     attrText.addAttributeValueRange(NSKernAttributeName, this.letterSpacing * this.nativeTextViewProtected.font.pointSize, { location: 0, length: attrText.length });
        // }
        //
        // if (this.style.lineHeight) {
        //     const paragraphStyle = NSMutableParagraphStyle.alloc().init();
        //     paragraphStyle.lineSpacing = this.lineHeight;
        //     // make sure a possible previously set text alignment setting is not lost when line height is specified
        //     paragraphStyle.alignment = (<UITextField | UITextView | UILabel>this.nativeTextViewProtected).textAlignment;
        //     if (this.nativeTextViewProtected instanceof  UILabel) {
        //         // make sure a possible previously set line break mode is not lost when line height is specified
        //         paragraphStyle.lineBreakMode = this.nativeTextViewProtected.lineBreakMode;
        //     }
        //     attrText.addAttributeValueRange(NSParagraphStyleAttributeName, paragraphStyle, { location: 0, length: attrText.length });
        // }
        //
        // if (this.nativeTextViewProtected instanceof UIButton) {
        //     this.nativeTextViewProtected.setAttributedTitleForState(attrText, UIControlState.Normal);
        // }
        // else {
        //     this.nativeTextViewProtected.attributedText = attrText;
        // }
    }

    setTextDecorationAndTransform() {
        // const style = this.style;
        // const dict = new Map<string, any>();
        // switch (style.textDecoration) {
        //     case "none":
        //         break;
        //     case "underline":
        //         dict.set(NSUnderlineStyleAttributeName, NSUnderlineStyle.StyleSingle);
        //         break;
        //     case "line-through":
        //         dict.set(NSStrikethroughStyleAttributeName, NSUnderlineStyle.StyleSingle);
        //         break;
        //     case "underline line-through":
        //         dict.set(NSUnderlineStyleAttributeName, NSUnderlineStyle.StyleSingle);
        //         dict.set(NSStrikethroughStyleAttributeName, NSUnderlineStyle.StyleSingle);
        //         break;
        //     default:
        //         throw new Error(`Invalid text decoration value: ${style.textDecoration}. Valid values are: 'none', 'underline', 'line-through', 'underline line-through'.`);
        // }
        //
        // if (style.letterSpacing !== 0) {
        //     dict.set(NSKernAttributeName, style.letterSpacing * this.nativeTextViewProtected.font.pointSize);
        // }
        //
        // if (style.lineHeight) {
        //     const paragraphStyle = NSMutableParagraphStyle.alloc().init();
        //     paragraphStyle.lineSpacing = style.lineHeight;
        //     // make sure a possible previously set text alignment setting is not lost when line height is specified
        //     paragraphStyle.alignment = (<UITextField | UITextView | UILabel>this.nativeTextViewProtected).textAlignment;
        //     if (this.nativeTextViewProtected instanceof  UILabel) {
        //         // make sure a possible previously set line break mode is not lost when line height is specified
        //         paragraphStyle.lineBreakMode = this.nativeTextViewProtected.lineBreakMode;
        //     }
        //     dict.set(NSParagraphStyleAttributeName, paragraphStyle);
        // }
        //
        // const isTextView = this.nativeTextViewProtected instanceof UITextView;
        // if (style.color && (dict.size > 0 || isTextView)) {
        //     dict.set(NSForegroundColorAttributeName, style.color.ios);
        // }
        //
        // const text = this.text;
        // const string = (text === undefined || text === null) ? "" : text.toString();
        // const source = getTransformedText(string, this.textTransform);
        // if (dict.size > 0 || isTextView) {
        //     if (isTextView) {
        //         // UITextView's font seems to change inside.
        //         dict.set(NSFontAttributeName, this.nativeTextViewProtected.font);
        //     }
        //
        //     const result = NSMutableAttributedString.alloc().initWithString(source);
        //     result.setAttributesRange(<any>dict, { location: 0, length: source.length });
        //     if (this.nativeTextViewProtected instanceof UIButton) {
        //         this.nativeTextViewProtected.setAttributedTitleForState(result, UIControlState.Normal);
        //     } else {
        //         this.nativeTextViewProtected.attributedText = result;
        //     }
        // } else {
        //     if (this.nativeTextViewProtected instanceof UIButton) {
        //         // Clear attributedText or title won't be affected.
        //         this.nativeTextViewProtected.setAttributedTitleForState(null, UIControlState.Normal);
        //         this.nativeTextViewProtected.setTitleForState(source, UIControlState.Normal);
        //     } else {
        //         // Clear attributedText or text won't be affected.
        //         this.nativeTextViewProtected.attributedText = undefined;
        //         this.nativeTextViewProtected.text = source;
        //     }
        // }
    }

}

export function getTransformedText(text: string, textTransform: TextTransform): string {
    return text;
}
