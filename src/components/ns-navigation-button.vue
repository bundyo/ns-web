<template>
    <div :style="styles">
        <slot></slot>
    </div>
</template>

<script>
    import { props, styles } from "../consts";

    export default {
        name: 'ns-navigation-button',

        extends: import("./ns-button"),

        props,

        computed: {
            styles() {
                return styles.call(this);
            },
        }
    }
</script>
