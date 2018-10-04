import { AnimationDefinition } from ".";
import { View } from "../core/view";

import { AnimationBase, Properties, PropertyAnimation, CubicBezierAnimationCurve, AnimationPromise, traceWrite, traceEnabled, traceCategories, traceType } from "./animation-common";
import {
    opacityProperty, backgroundColorProperty, rotateProperty,
    translateXProperty, translateYProperty, scaleXProperty, scaleYProperty
} from "../styling/style-properties";

import { ios } from "../../utils";

export * from "./animation-common";

export class Animation extends AnimationBase {
    public _resolveAnimationCurve(curve: any): any {
        return null;
    }
}
    