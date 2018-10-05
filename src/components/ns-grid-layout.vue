<template>
    <div :style="styles">
        <slot></slot>
    </div>
</template>

<script>
    import { props, styles } from "../consts";

    export default {
        name: 'ns-grid-layout',

        extends: import("./ns-element"),

        props,

        computed: {
            styles() {
                return styles.call(this);
            },
        }
    }
</script>

<style>
    :host > div {
        display: flex;
        flex-wrap: wrap;
    }

    :host > div > * {
        align-self: stretch;
    }
</style>
