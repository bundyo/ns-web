﻿import { Label as LabelDefinition } from ".";
import { Background } from "../styling/background";
import {
    TextBase, View, layout,
    borderTopWidthProperty, borderRightWidthProperty, borderBottomWidthProperty, borderLeftWidthProperty,
    paddingTopProperty, paddingRightProperty, paddingBottomProperty, paddingLeftProperty, whiteSpaceProperty,
    Length, WhiteSpace, booleanConverter, CSSType
} from "../text-base";

// import { ios } from "../styling/background";

import NSLabel from "../../../hypers/ns-label";

export * from "../text-base";

enum FixedSize {
    NONE = 0,
    WIDTH = 1,
    HEIGHT = 2,
    BOTH = 3
}

@CSSType("Label")
export class Label extends TextBase implements LabelDefinition {
    nativeViewProtected: NSLabel;
    private _fixedSize: FixedSize;

    public createNativeView() {
        return document.createElement("ns-label");
    }

    get web(): TNSLabel {
        return this.nativeTextViewProtected;
    }

    get textWrap(): boolean {
        return this.style.whiteSpace === "normal";
    }
    set textWrap(value: boolean) {
        if (typeof value === "string") {
            value = booleanConverter(value)
        }

        this.style.whiteSpace = value ? "normal" : "nowrap";
    }

    _requestLayoutOnTextChanged(): void {
        if (this._fixedSize === FixedSize.BOTH) {
            return;
        }
        if (this._fixedSize === FixedSize.WIDTH && !this.textWrap && this.getMeasuredHeight() > 0) {
            // Single line label with fixed width will skip request layout on text change.
            return;
        }
        super._requestLayoutOnTextChanged();
    }

    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        // let nativeView = this.nativeTextViewProtected;
        // if (nativeView) {
        //     const width = layout.getMeasureSpecSize(widthMeasureSpec);
        //     const widthMode = layout.getMeasureSpecMode(widthMeasureSpec);
        //
        //     const height = layout.getMeasureSpecSize(heightMeasureSpec);
        //     const heightMode = layout.getMeasureSpecMode(heightMeasureSpec);
        //
        //     this._fixedSize = (widthMode === layout.EXACTLY ? FixedSize.WIDTH : FixedSize.NONE)
        //         | (heightMode === layout.EXACTLY ? FixedSize.HEIGHT : FixedSize.NONE);
        //
        //     let nativeSize;
        //     if (this.textWrap) {
        //         // https://github.com/NativeScript/NativeScript/issues/4834
        //         // NOTE: utils.measureNativeView(...) relies on UIView.sizeThatFits(...) that
        //         // seems to have various issues when laying out UILabel instances.
        //         // We use custom measure logic here that relies on overriden
        //         // UILabel.textRectForBounds:limitedToNumberOfLines: in TNSLabel widget.
        //         nativeSize = this._measureNativeView(width, widthMode, height, heightMode);
        //     } else {
        //         // https://github.com/NativeScript/NativeScript/issues/6059
        //         // NOTE: _measureNativeView override breaks a scenario with StackLayout that arranges
        //         // labels horizontally (with textWrap=false) e.g. we are measuring label #2 within 356px,
        //         // label #2 needs more, and decides to show ellipsis(...) but because of this its native size
        //         // returned from UILabel.textRectForBounds:limitedToNumberOfLines: logic becomes 344px, so
        //         // StackLayout tries to measure label #3 within the remaining 12px which is wrong;
        //         // label #2 with ellipsis should take the whole 356px and label #3 should not be visible at all.
        //         nativeSize = layout.measureNativeView(nativeView, width, widthMode, height, heightMode);
        //     }
        //
        //     let labelWidth = nativeSize.width;
        //
        //     if (this.textWrap && widthMode === layout.AT_MOST) {
        //         labelWidth = Math.min(labelWidth, width);
        //     }
        //
        //     const measureWidth = Math.max(labelWidth, this.effectiveMinWidth);
        //     const measureHeight = Math.max(nativeSize.height, this.effectiveMinHeight);
        //
        //     const widthAndState = View.resolveSizeAndState(measureWidth, width, widthMode, 0);
        //     const heightAndState = View.resolveSizeAndState(measureHeight, height, heightMode, 0);
        //
        //     this.setMeasuredDimension(widthAndState, heightAndState);
        // }
    }

    private _measureNativeView(width: number, widthMode: number, height: number, heightMode: number) {
        // const view = <UILabel>this.nativeTextViewProtected;
        //
        // const nativeSize = view.textRectForBoundsLimitedToNumberOfLines(
        //     CGRectMake(
        //         0,
        //         0,
        //         widthMode === 0 /* layout.UNSPECIFIED */ ? Number.POSITIVE_INFINITY : layout.toDeviceIndependentPixels(width),
        //         heightMode === 0 /* layout.UNSPECIFIED */ ? Number.POSITIVE_INFINITY : layout.toDeviceIndependentPixels(height)
        //     ), 0).size;
        //
        // nativeSize.width = layout.round(layout.toDevicePixels(nativeSize.width));
        // nativeSize.height = layout.round(layout.toDevicePixels(nativeSize.height));
        // return nativeSize;
    }

    [whiteSpaceProperty.setNative](value: WhiteSpace) {
        this.nativeTextViewProtected.style.whiteSpace = value;
        // const nativeView = this.nativeTextViewProtected;
        // switch (value) {
        //     case "normal":
        //         nativeView.lineBreakMode = NSLineBreakMode.ByWordWrapping;
        //         nativeView.numberOfLines = 0;
        //         break;
        //     case "nowrap":
        //     case "initial":
        //         nativeView.lineBreakMode = NSLineBreakMode.ByTruncatingTail;
        //         nativeView.numberOfLines = 1;
        //         break;
        // }
    }

    _redrawNativeBackground(value: UIColor | Background): void {
        // if (value instanceof Background) {
        //     ios.createBackgroundUIColor(this, (color: UIColor) => {
        //         const cgColor = color ? color.CGColor : null;
        //         this.nativeTextViewProtected.layer.backgroundColor = cgColor;
        //     }, true);
        // }

        this._setNativeClipToBounds();
    }

    [borderTopWidthProperty.setNative](value: Length) {
        this.nativeTextViewProtected.style.borderTopWidth = value;

        // const nativeView = this.nativeTextViewProtected;
        // const border = nativeView.borderThickness;
        // nativeView.borderThickness = {
        //     top: layout.toDeviceIndependentPixels(this.effectiveBorderTopWidth),
        //     right: border.right,
        //     bottom: border.bottom,
        //     left: border.left
        // };
    }

    [borderRightWidthProperty.setNative](value: Length) {
        this.nativeTextViewProtected.style.borderRightWidth = value;

        // const nativeView = this.nativeTextViewProtected;
        // const border = nativeView.borderThickness;
        // nativeView.borderThickness = {
        //     top: border.top,
        //     right: layout.toDeviceIndependentPixels(this.effectiveBorderRightWidth),
        //     bottom: border.bottom,
        //     left: border.left
        // };
    }

    [borderBottomWidthProperty.setNative](value: Length) {
        this.nativeTextViewProtected.style.borderBottomWidth = value;

        // const nativeView = this.nativeTextViewProtected;
        // const border = nativeView.borderThickness;
        // nativeView.borderThickness = {
        //     top: border.top,
        //     right: border.right,
        //     bottom: layout.toDeviceIndependentPixels(this.effectiveBorderBottomWidth),
        //     left: border.left
        // };
    }

    [borderLeftWidthProperty.setNative](value: Length) {
        this.nativeTextViewProtected.style.borderLeftWidth = value;

        // const nativeView = this.nativeTextViewProtected;
        // const border = nativeView.borderThickness;
        // nativeView.borderThickness = {
        //     top: border.top,
        //     right: border.right,
        //     bottom: border.bottom,
        //     left: layout.toDeviceIndependentPixels(this.effectiveBorderLeftWidth)
        // };
    }

    [paddingTopProperty.setNative](value: Length) {
        this.nativeTextViewProtected.style.paddingTop = value;

        // const nativeView = this.nativeTextViewProtected;
        // const padding = nativeView.padding;
        // nativeView.padding = {
        //     top: layout.toDeviceIndependentPixels(this.effectivePaddingTop),
        //     right: padding.right,
        //     bottom: padding.bottom,
        //     left: padding.left
        // };
    }

    [paddingRightProperty.setNative](value: Length) {
        this.nativeTextViewProtected.style.paddingRight = value;

        // const nativeView = this.nativeTextViewProtected;
        // const padding = nativeView.padding;
        // nativeView.padding = {
        //     top: padding.top,
        //     right: layout.toDeviceIndependentPixels(this.effectivePaddingRight),
        //     bottom: padding.bottom,
        //     left: padding.left
        // };
    }

    [paddingBottomProperty.setNative](value: Length) {
        this.nativeTextViewProtected.style.paddingBottom = value;

        // const nativeView = this.nativeTextViewProtected;
        // const padding = nativeView.padding;
        // nativeView.padding = {
        //     top: padding.top,
        //     right: padding.right,
        //     bottom: layout.toDeviceIndependentPixels(this.effectivePaddingBottom),
        //     left: padding.left
        // };
    }

    [paddingLeftProperty.setNative](value: Length) {
        this.nativeTextViewProtected.style.paddingLeft = value;

        // const nativeView = this.nativeTextViewProtected;
        // const padding = nativeView.padding;
        // nativeView.padding = {
        //     top: padding.top,
        //     right: padding.right,
        //     bottom: padding.bottom,
        //     left: layout.toDeviceIndependentPixels(this.effectivePaddingLeft)
        // };
    }
}

Label.prototype.recycleNativeView = "auto";
