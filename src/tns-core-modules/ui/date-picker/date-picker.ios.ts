﻿import {
    DatePickerBase, yearProperty, monthProperty, dayProperty,
    dateProperty, maxDateProperty, minDateProperty, colorProperty, Color
} from "./date-picker-common";

import { ios } from "../../utils/utils";

export * from "./date-picker-common";

export class DatePicker extends DatePickerBase {
    private _changeHandler: NSObject;
    public nativeViewProtected: UIDatePicker;

    public createNativeView() {
        const picker = UIDatePicker.new();
        picker.datePickerMode = UIDatePickerMode.Date;
        return picker;
    }

    public initNativeView(): void {
        super.initNativeView();
        const nativeView = this.nativeViewProtected;
        this._changeHandler = UIDatePickerChangeHandlerImpl.initWithOwner(new WeakRef(this));
        nativeView.addTargetActionForControlEvents(this._changeHandler, "valueChanged", UIControlEvents.ValueChanged);
    }

    public disposeNativeView() {
        this._changeHandler = null;
        super.disposeNativeView();
    }

    get ios(): UIDatePicker {
        return this.nativeViewProtected;
    }

    [yearProperty.setNative](value: number) {
        this.date = new Date(value, this.month - 1, this.day);
    }

    [monthProperty.setNative](value: number) {
        this.date = new Date(this.year, value - 1, this.day);
    }

    [dayProperty.setNative](value: number) {
        this.date = new Date(this.year, this.month - 1, value);
    }

    [dateProperty.setNative](value: Date) {
        const picker = this.nativeViewProtected;
        const comps = ios.getter(NSCalendar, NSCalendar.currentCalendar).componentsFromDate(NSCalendarUnit.CalendarUnitYear | NSCalendarUnit.CalendarUnitMonth | NSCalendarUnit.CalendarUnitDay, picker.date);
        comps.year = value.getFullYear();
        comps.month = value.getMonth() + 1;
        comps.day = value.getDate();
        picker.setDateAnimated(ios.getter(NSCalendar, NSCalendar.currentCalendar).dateFromComponents(comps), false);
    }

    [maxDateProperty.getDefault](): Date {
        return this.nativeViewProtected.maximumDate;
    }
    [maxDateProperty.setNative](value: Date) {
        const picker = this.nativeViewProtected;
        const nsDate = NSDate.dateWithTimeIntervalSince1970(value.getTime() / 1000);
        picker.maximumDate = <any>nsDate;
    }

    [minDateProperty.getDefault](): Date {
        return this.nativeViewProtected.minimumDate;
    }
    [minDateProperty.setNative](value: Date) {
        const picker = this.nativeViewProtected;
        const nsDate = NSDate.dateWithTimeIntervalSince1970(value.getTime() / 1000);
        picker.minimumDate = <any>nsDate;
    }

    [colorProperty.getDefault](): UIColor {
        return this.nativeViewProtected.valueForKey("textColor");
    }
    [colorProperty.setNative](value: Color | UIColor) {
        const picker = this.nativeViewProtected;
        picker.setValueForKey(value instanceof Color ? value.ios : value, "textColor");
    }
}

class UIDatePickerChangeHandlerImpl extends NSObject {
    private _owner: WeakRef<DatePicker>;

    public static initWithOwner(owner: WeakRef<DatePicker>): UIDatePickerChangeHandlerImpl {
        const impl = <UIDatePickerChangeHandlerImpl>UIDatePickerChangeHandlerImpl.new();
        impl._owner = owner;
        return impl;
    }

    public valueChanged(sender: UIDatePicker) {
        const comps = ios.getter(NSCalendar, NSCalendar.currentCalendar).componentsFromDate(NSCalendarUnit.CalendarUnitYear | NSCalendarUnit.CalendarUnitMonth | NSCalendarUnit.CalendarUnitDay, sender.date);

        const owner = this._owner.get();
        if (!owner) {
            return;
        }

        let dateChanged = false;
        if (comps.year !== owner.year) {
            yearProperty.nativeValueChange(owner, comps.year);
            dateChanged = true;
        }

        if (comps.month !== owner.month) {
            monthProperty.nativeValueChange(owner, comps.month);
            dateChanged = true;
        }

        if (comps.day !== owner.day) {
            dayProperty.nativeValueChange(owner, comps.day);
            dateChanged = true;
        }

        if (dateChanged) {
            dateProperty.nativeValueChange(owner, new Date(comps.year, comps.month - 1, comps.day));
        }
    }

    public static ObjCExposedMethods = {
        "valueChanged": { returns: interop.types.void, params: [UIDatePicker] }
    };
}
