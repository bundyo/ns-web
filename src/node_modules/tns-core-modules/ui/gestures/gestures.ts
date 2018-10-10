// Definitions.
import { GestureEventData, SwipeGestureEventData, PanGestureEventData, RotationGestureEventData, PinchGestureEventData } from ".";
import { View, EventData } from "../core/view";

// Types.
import { GesturesObserverBase, toString, TouchAction, GestureStateTypes, GestureTypes, SwipeDirection } from "./gestures-common";
import { ios } from "../../utils";
import getter = ios.getter;

export * from "./gestures-common";
