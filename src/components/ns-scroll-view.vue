<template :class="classes">
    <div>
        <slot :class="classes"></slot>
    </div>
</template>

<script>
    export default {
        name: 'ns-scroll-view',
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
