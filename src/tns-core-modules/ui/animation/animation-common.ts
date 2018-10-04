﻿// Definitions.
import {
    CubicBezierAnimationCurve as CubicBezierAnimationCurveDefinition,
    AnimationPromise as AnimationPromiseDefinition,
    Animation as AnimationBaseDefinition,
    AnimationDefinition,
    Pair
} from ".";
import { View } from "../core/view";

// Types.
import { Color } from "../../color";
import { isEnabled as traceEnabled, write as traceWrite, categories as traceCategories, messageType as traceType } from "../../trace";

export { Color, traceEnabled, traceWrite, traceCategories, traceType };
export { AnimationPromise } from ".";

export module Properties {
    export var opacity = "opacity";
    export var backgroundColor = "backgroundColor";
    export var translate = "translate";
    export var rotate = "rotate";
    export var scale = "scale";
}

export interface PropertyAnimation {
    target: View;
    property: string;
    value: any;
    duration?: number;
    delay?: number;
    iterations?: number;
    curve?: any;
}

export class CubicBezierAnimationCurve implements CubicBezierAnimationCurveDefinition {

    public x1: number;
    public y1: number;
    public x2: number;
    public y2: number;

    constructor(x1: number, y1: number, x2: number, y2: number) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
}

export abstract class AnimationBase implements AnimationBaseDefinition {
    public _propertyAnimations: Array<PropertyAnimation>;
    public _playSequentially: boolean;
    private _isPlaying: boolean;
    private _resolve;
    private _reject;

    constructor(animationDefinitions: Array<AnimationDefinition>, playSequentially?: boolean) {
        if (!animationDefinitions || animationDefinitions.length === 0) {
            throw new Error("No animation definitions specified");
        }

        if (traceEnabled()) {
            traceWrite("Analyzing " + animationDefinitions.length + " animation definitions...", traceCategories.Animation);
        }

        this._propertyAnimations = new Array<PropertyAnimation>();
        for (let i = 0, length = animationDefinitions.length; i < length; i++) {
            if (animationDefinitions[i].curve) {
                animationDefinitions[i].curve = this._resolveAnimationCurve(animationDefinitions[i].curve);
            }
            this._propertyAnimations = this._propertyAnimations.concat(AnimationBase._createPropertyAnimations(animationDefinitions[i]));
        }

        if (this._propertyAnimations.length === 0) {
            throw new Error("Nothing to animate.");
        }
        if (traceEnabled()) {
            traceWrite("Created " + this._propertyAnimations.length + " individual property animations.", traceCategories.Animation);
        }

        this._playSequentially = playSequentially;
    }

    abstract _resolveAnimationCurve(curve: any): any;

    protected _rejectAlreadyPlaying(): AnimationPromiseDefinition {
        const reason = "Animation is already playing.";
        traceWrite(reason, traceCategories.Animation, traceType.warn);
        
        return <AnimationPromiseDefinition>new Promise<void>((resolve, reject) => {
            reject(reason);
        });
    }

    public play(): AnimationPromiseDefinition {
        // We have to actually create a "Promise" due to a bug in the v8 engine and decedent promises
        // We just cast it to a animationPromise so that all the rest of the code works fine
        var animationFinishedPromise = <AnimationPromiseDefinition>new Promise<void>((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });

        this.fixupAnimationPromise(animationFinishedPromise);

        this._isPlaying = true;
        return animationFinishedPromise;
    }

    private fixupAnimationPromise(promise: AnimationPromiseDefinition): void {
        // Since we are using function() below because of arguments, TS won't automatically do a _this for those functions.
        var _this = this;
        promise.cancel = () => {
            _this.cancel();
        };
        var _then = promise.then;
        promise.then = function () {
            var r = _then.apply(promise, arguments);
            _this.fixupAnimationPromise(r);
            return r;
        };
        var _catch = promise.catch;
        promise.catch = function () {
            var r = _catch.apply(promise, arguments);
            _this.fixupAnimationPromise(r);
            return r;
        };
    }

    public cancel(): void {
        // Implemented in platform specific files
    }

    public get isPlaying(): boolean {
        return this._isPlaying;
    }

    public _resolveAnimationFinishedPromise() {
        this._isPlaying = false;
        this._resolve();
    }

    public _rejectAnimationFinishedPromise() {
        this._isPlaying = false;
        this._reject(new Error("Animation cancelled."));
    }

    private static _createPropertyAnimations(animationDefinition: AnimationDefinition): Array<PropertyAnimation> {
        if (!animationDefinition.target) {
            throw new Error("No animation target specified.");
        }

        for (let item in animationDefinition) {
            if (animationDefinition[item] === undefined) {
                continue;
            }

            if ((item === Properties.opacity ||
                item === Properties.rotate ||
                item === "duration" ||
                item === "delay" ||
                item === "iterations") && typeof animationDefinition[item] !== "number") {
                throw new Error(`Property ${item} must be valid number. Value: ${animationDefinition[item]}`);
            } else if ((item === Properties.scale || item === Properties.translate) &&
                (typeof (<Pair>animationDefinition[item]).x !== "number" || typeof (<Pair>animationDefinition[item]).y !== "number")) {
                throw new Error(`Property ${item} must be valid Pair. Value: ${animationDefinition[item]}`);
            } else if (item === Properties.backgroundColor && !Color.isValid(animationDefinition.backgroundColor)) {
                throw new Error(`Property ${item} must be valid color. Value: ${animationDefinition[item]}`);
            }
        }

        const propertyAnimations = new Array<PropertyAnimation>();

        // opacity
        if (animationDefinition.opacity !== undefined) {
            propertyAnimations.push({
                target: animationDefinition.target,
                property: Properties.opacity,
                value: animationDefinition.opacity,
                duration: animationDefinition.duration,
                delay: animationDefinition.delay,
                iterations: animationDefinition.iterations,
                curve: animationDefinition.curve
            });
        }

        // backgroundColor
        if (animationDefinition.backgroundColor !== undefined) {
            propertyAnimations.push({
                target: animationDefinition.target,
                property: Properties.backgroundColor,
                value: typeof animationDefinition.backgroundColor === "string" ?
                    new Color(<any>animationDefinition.backgroundColor) : animationDefinition.backgroundColor,
                duration: animationDefinition.duration,
                delay: animationDefinition.delay,
                iterations: animationDefinition.iterations,
                curve: animationDefinition.curve
            });
        }

        // translate
        if (animationDefinition.translate !== undefined) {
            propertyAnimations.push({
                target: animationDefinition.target,
                property: Properties.translate,
                value: animationDefinition.translate,
                duration: animationDefinition.duration,
                delay: animationDefinition.delay,
                iterations: animationDefinition.iterations,
                curve: animationDefinition.curve
            });
        }

        // scale
        if (animationDefinition.scale !== undefined) {
            propertyAnimations.push({
                target: animationDefinition.target,
                property: Properties.scale,
                value: animationDefinition.scale,
                duration: animationDefinition.duration,
                delay: animationDefinition.delay,
                iterations: animationDefinition.iterations,
                curve: animationDefinition.curve
            });
        }

        // rotate
        if (animationDefinition.rotate !== undefined) {
            propertyAnimations.push({
                target: animationDefinition.target,
                property: Properties.rotate,
                value: animationDefinition.rotate,
                duration: animationDefinition.duration,
                delay: animationDefinition.delay,
                iterations: animationDefinition.iterations,
                curve: animationDefinition.curve
            });
        }

        if (propertyAnimations.length === 0) {
            throw new Error("No animation property specified.");
        }

        return propertyAnimations;
    }

    public static _getAnimationInfo(animation: PropertyAnimation): string {
        return JSON.stringify({
            target: animation.target.id,
            property: animation.property,
            value: animation.value,
            duration: animation.duration,
            delay: animation.delay,
            iterations: animation.iterations,
            curve: animation.curve
        });
    }
}