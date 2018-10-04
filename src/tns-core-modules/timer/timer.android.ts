﻿/**
 * Android specific timer functions implementation.
 */
var timeoutHandler;
var timeoutCallbacks = {};
var timerId = 0;

function createHandlerAndGetId(): number {
    if (!timeoutHandler) {
        timeoutHandler = new android.os.Handler(android.os.Looper.myLooper());
    }

    timerId++;
    return timerId;
}

export function setTimeout(callback: Function, milliseconds = 0, ...args): number {
    const id = createHandlerAndGetId();
    const invoke = () => callback(...args);
    const zoneBound = zonedCallback(invoke);

    var runnable = new java.lang.Runnable({
        run: () => {
            zoneBound();

            if (timeoutCallbacks[id]) {
                delete timeoutCallbacks[id];
            }
        }
    });

    if (!timeoutCallbacks[id]) {
        timeoutCallbacks[id] = runnable;
    }

    timeoutHandler.postDelayed(runnable, long(milliseconds));

    return id;
}

export function clearTimeout(id: number): void {
    let index = id;
    if (timeoutCallbacks[index]) {
        timeoutHandler.removeCallbacks(timeoutCallbacks[index]);
        delete timeoutCallbacks[index];
    }
}

export function setInterval(callback: Function, milliseconds = 0, ...args): number {
    const id = createHandlerAndGetId();
    const handler = timeoutHandler;
    const invoke = () => callback(...args);
    const zoneBound = zonedCallback(invoke);

    var runnable = new java.lang.Runnable({
        run: () => {
            zoneBound();
            if (timeoutCallbacks[id]) {
                handler.postDelayed(runnable, long(milliseconds));
            }
        }
    });

    if (!timeoutCallbacks[id]) {
        timeoutCallbacks[id] = runnable;
    }

    timeoutHandler.postDelayed(runnable, long(milliseconds));

    return id;
}

export var clearInterval = clearTimeout;
