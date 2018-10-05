import * as utils from "../utils";

//iOS specific timer functions implementation.
var timeoutCallbacks = new Map<number, KeyValuePair<NSTimer, TimerTargetImpl>>();
var timerId = 0;

export const setTimeout = global.setTimeout;
export const clearTimeout = global.clearTimeout;

export const setInterval = global.setInterval;

export const clearInterval = global.clearInterval;
