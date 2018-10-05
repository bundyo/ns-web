<template>
    <span :style="styles">{{ this.currentText }}</span>
</template>

<script>
    import { props, styles } from "../consts";

    export default {
        name: 'ns-label',

        extends: import("./ns-element"),

        props: ["text"].concat(props),

        computed: {
            styles() {
                return styles.call(this);
            },

            currentText() {
                return this.text;
            }
        }
    }
</script>

<style>
    :host > span {
        display: inline-block;
    }
</style>
