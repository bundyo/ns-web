<template>
    <div :style="styles">
        <span :text="currentTitle"></span>
        <slot></slot>
    </div>
</template>

<script>
    import { props, styles } from "../consts";

    export default {
        name: 'ns-action-bar',

        extends: import("./ns-element"),

        props: ["title"].concat(props),

        computed: {
            styles() {
                return styles.call(this);
            },

            currentTitle() {
                return this.title;
            }
        }
    }
</script>
