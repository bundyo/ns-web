<template>
    <div :class="classes">
        <slot></slot>
    </div>
</template>

<script>
    export default {
        name: 'ns-wrap-layout',
        extends: import("./ns-element"),

        props: ["orientation"],

        computed: {
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
