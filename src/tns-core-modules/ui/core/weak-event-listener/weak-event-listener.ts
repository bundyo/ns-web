﻿import { Observable, EventData } from "../../../data/observable";

import { WeakRef } from "../../../../utils/weakref";

const handlersForEventName = new Map<string, (eventData: EventData) => void>();
const sourcesMap = new WeakMap<Observable, Map<string, Array<TargetHandlerPair>>>();

class TargetHandlerPair {
    tagetRef: WeakRef<Object>;
    handler: (eventData: EventData) => void;

    constructor(target: Object, handler: (eventData: EventData) => void) {
        this.tagetRef = new WeakRef(target);
        this.handler = handler;
    }
}

function getHandlerForEventName(eventName: string): (eventData: EventData) => void {
    var handler = handlersForEventName.get(eventName);
    if (!handler) {
        handler = function (eventData: EventData) {
            var source = eventData.object;
            var sourceEventMap = sourcesMap.get(source);
            if (!sourceEventMap) {
                // There is no event map for this source - it is safe to detach the listener;
                source.removeEventListener(eventName, handlersForEventName.get(eventName));
                return;
            }

            var targetHandlerPairList = sourceEventMap.get(eventName);
            if (!targetHandlerPairList) {
                return;
            }

            var deadPairsIndexes = [];
            for (var i = 0; i < targetHandlerPairList.length; i++) {
                var pair = targetHandlerPairList[i];

                var target = pair.tagetRef.get();
                if (target) {
                    pair.handler.call(target, eventData);
                }
                else {
                    deadPairsIndexes.push(i);
                }
            }

            if (deadPairsIndexes.length === targetHandlerPairList.length) {
                // There are no alive targets for this event - unsubscribe
                source.removeEventListener(eventName, handlersForEventName.get(eventName));
                sourceEventMap.delete(eventName);
            }
            else {
                for (var j = deadPairsIndexes.length - 1; j >= 0; j--) {
                    targetHandlerPairList.splice(deadPairsIndexes[j], 1);
                }
            }
        };
        handlersForEventName.set(eventName, handler);
    }

    return handler;
}

function validateArgs(source: Observable, eventName: string, handler: (eventData: EventData) => void, target: any) {
    if (!source) {
        throw new Error("source is null or undefined");
    }

    if (!target) {
        throw new Error("target is null or undefined");
    }

    if (typeof eventName !== "string") {
        throw new Error("eventName is not a string");
    }

    if (typeof handler !== "function") {
        throw new Error("handler is not a function");
    }
}

export function addWeakEventListener(source: Observable, eventName: string, handler: (eventData: EventData) => void, target: any) {
    validateArgs(source, eventName, handler, target);

    var shouldAttach: boolean = false;

    var sourceEventMap = sourcesMap.get(source);
    if (!sourceEventMap) {
        sourceEventMap = new Map<string, Array<TargetHandlerPair>>();
        sourcesMap.set(source, sourceEventMap);
        shouldAttach = true;
    }

    var pairList = sourceEventMap.get(eventName);
    if (!pairList) {
        pairList = new Array<TargetHandlerPair>();
        sourceEventMap.set(eventName, pairList);
        shouldAttach = true;
    }

    pairList.push(new TargetHandlerPair(target, handler));

    if (shouldAttach) {
        source.addEventListener(eventName, getHandlerForEventName(eventName));
    }
}

export function removeWeakEventListener(source: Observable, eventName: string, handler: (eventData: EventData) => void, target: any) {
    validateArgs(source, eventName, handler, target);

    var handlerForEventWithName = handlersForEventName.get(eventName);
    if (!handlerForEventWithName) {
        // We have never created handler for event with this name;
        return;
    }

    var sourceEventMap = sourcesMap.get(source);
    if (!sourceEventMap) {
        return;
    }

    var targetHandlerPairList = sourceEventMap.get(eventName);
    if (!targetHandlerPairList) {
        return;
    }

    // Remove all pairs that match given target and handler or have a dead target
    var targetHandlerPairsToRemove = [];
    for (var i = 0; i < targetHandlerPairList.length; i++) {
        var pair = targetHandlerPairList[i];

        var registeredTarget = pair.tagetRef.get();
        if (!registeredTarget || (registeredTarget === target && handler === pair.handler)) {
            targetHandlerPairsToRemove.push(i);
        }
    }

    if (targetHandlerPairsToRemove.length === targetHandlerPairList.length) {
        // There are no alive targets for this event - unsubscribe
        source.removeEventListener(eventName, handlerForEventWithName);
        sourceEventMap.delete(eventName);
    }
    else {
        for (var j = targetHandlerPairsToRemove.length - 1; j >= 0; j--) {
            targetHandlerPairList.splice(targetHandlerPairsToRemove[j], 1);
        }
    }
}
