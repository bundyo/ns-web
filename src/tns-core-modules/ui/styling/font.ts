import { Font as FontBase, parseFontFamily, genericFontFamilies, FontStyle, FontWeight } from "./font-common";
import { isEnabled as traceEnabled, write as traceWrite, categories as traceCategories, messageType as traceMessageType } from "../../trace";
import { device } from "../../platform"
import * as fs from "../../file-system";
import * as utils from "../../utils";
export * from "./font-common";
