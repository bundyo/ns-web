<template>
    <div :style="styles">
        <slot></slot>
    </div>
</template>

<script>
    import { props, styles } from "../consts";

    export default {
        name: 'ns-action-item',

        extends: import("./ns-button"),

        props,

        computed: {
            styles() {
                return styles.call(this);
            },
        }
    }
</script>
