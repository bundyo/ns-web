<template>
    <div :class="classes" :style="styles">
        <slot></slot>
    </div>
</template>

<script>
    import { props, styles } from "../consts";

    export default {
        name: 'ns-stack-layout',

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
        flex-direction: column;
        min-height: 10px;
    }

    :host [horizontalAlignment="left"] {
        align-self: flex-start;
    }

    :host [horizontalAlignment="center"] {
        align-self: center;
    }

    :host [horizontalAlignment="right"] {
        align-self: flex-end;
    }

    :host [horizontalAlignment="stretch"] {
        align-self: stretch;
    }

    :host > div.-horizontal {
        flex-direction: row;
    }

    :host [verticalAlignment="top"] {
        align-self: flex-start;
    }

    :host [verticalAlignment="center"] {
        align-self: center;
    }

    :host [verticalAlignment="bottom"] {
        align-self: flex-end;
    }

    :host [verticalAlignment="stretch"] {
        align-self: stretch;
    }
</style>
