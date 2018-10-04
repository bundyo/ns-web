﻿// Definitions.
import { Transition as TransitionDefinition } from ".";

// Types.
import { _resolveAnimationCurve } from "../animation";
import lazy from "../../utils/lazy";

const _defaultInterpolator = lazy(() => new android.view.animation.AccelerateDecelerateInterpolator());

export module AndroidTransitionType {
    export const enter = "enter";
    export const exit = "exit";
    export const popEnter = "popEnter";
    export const popExit = "popExit";
}

let transitionId = 0;
export class Transition implements TransitionDefinition {
    private _duration: number;
    private _interpolator: android.view.animation.Interpolator;
    private _id: number;

    constructor(duration: number, curve: any) {
        this._duration = duration;
        this._interpolator = curve ? _resolveAnimationCurve(curve) : _defaultInterpolator();
        this._id = transitionId++;
    }

    public getDuration(): number {
        return this._duration;
    }

    public getCurve(): android.view.animation.Interpolator {
        return this._interpolator;
    }

    public animateIOSTransition(containerView: any, fromView: any, toView: any, operation: any, completion: (finished: boolean) => void): void {
        throw new Error("Abstract method call");
    }

    public createAndroidAnimation(transitionType: string): android.view.animation.Animation {
        throw new Error("Abstract method call");
    }

    public toString(): string {
        return `Transition@${this._id}`;
    }
}
