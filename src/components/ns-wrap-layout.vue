<template>
    <div :class="classes" :style="styles">
        <slot></slot>
    </div>
</template>

<script>
    import { props, styles } from "../consts";

    export default {
        name: 'ns-wrap-layout',

        extends: import("./ns-element"),

        props: ["orientation"].concat(props),

        computed: {
            styles() {
                return styles.call(this);
            },

            isVertical() {
                return this.orientation !== "horizontal";
            },

            classes() {
                return {
                    "-disabled": this.isDisabled,
                    "-vertical": this.isVertical,
                    "-horizontal": !this.isVertical
                };
            }
        }
    }
</script>

<style>
    :host > div {
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
    }

    :host > .-vertical {
        flex-direction: column;
    }
</style>
