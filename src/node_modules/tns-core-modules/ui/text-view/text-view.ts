import { TextView as TextViewDefinition } from ".";
import { EditableTextBase, CSSType } from "../editable-text-base";

export * from "../text-base";

@CSSType("TextView")
export class TextView extends EditableTextBase implements TextViewDefinition {
}

TextView.prototype.recycleNativeView = "auto";
