<template>
    <div class="ns-element" :style="styles">
        <slot></slot>
    </div>
</template>

<script>
    import { props, styles } from "../consts";

    export default {
        name: 'ns-page',

        extends: import("./ns-element"),

        props,

        computed: {
            styles() {
                return styles.call(this);
            },
        }
    }
</script>

