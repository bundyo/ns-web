<template>
    <div :class="classes">
        <slot></slot>
    </div>
</template>

<script>
    export default {
        name: 'ns-wrap-layout',
        props: ["disabled", "orientation"],

        computed: {
            isDisabled() {
                return !!this.disabled;
            },

            isVertical() {
                return this.orientation === "vertical";
            },

            classes() {
                return {
                    "-disabled": this.isDisabled,
                    "-vertical": this.isVertical,
                    "-horizontal": this.isVertical
                };
            }
        }
    }
</script>
