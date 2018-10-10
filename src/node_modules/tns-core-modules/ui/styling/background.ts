import { ScrollEventData } from "../scroll-view";

import { Background as BackgroundDefinition } from "./background";
import { View, Point } from "../core/view";
import { LinearGradient } from "./linear-gradient";
import { Color } from "../../color";
import { FILE_PREFIX, isDataURI, isFileOrResourcePath, layout, RESOURCE_PREFIX } from "../../utils";
import { fromFileOrResource, fromBase64, fromUrl } from "../../image-source";
import { CSSValue, parse as cssParse } from "../../css-value";

export * from "./background-common";

