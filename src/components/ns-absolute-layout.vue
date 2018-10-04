<template>
    <div :style="styles">
        <slot></slot>
    </div>
</template>

<script>
    import { props, styles } from "../consts";

    export default {
        name: 'ns-absolute-layout',

        extends: import("./ns-element"),

        props,

        computed: {
            styles() {
                return styles.call(this);
            }
        }
    }
</script>

<style>
    :host > div {
        display: inline-block;
        position: relative;
    }

    :host > div > * {
        position: absolute;
    }
</style>
