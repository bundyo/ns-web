export const props = ["color", "left", "right", "top", "bottom", "width", "height", "margin", "padding", "background-color"];

export function styles() {
    return Object.entries(this.$props).map(([k, v]) => {
        return v && { [k]: typeof +v === "number" ? v + "px" : v }
    }) || {};
}
