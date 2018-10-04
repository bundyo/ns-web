<template>
    <div :class="classes" :style="styles">
        <slot></slot>
    </div>
</template>

<script>
    import { props, styles } from "../consts";

    export default {
        name: 'ns-scroll-view',
        extends: import("./ns-element"),

        props: ["orientation"].concat(props),

        computed: {
            styles() {
                return styles.call(this);
            },

            isVertical() {
                return this.orientation !== "horizontal";
            },

            classes() {
                return {
                    "ns-element": true,
                    "-disabled": this.isDisabled,
                    "-vertical": this.isVertical,
                    "-horizontal": !this.isVertical
                };
            }
        },

        mounted() {
            console.log(this);
        },

        activated() {
            console.log("activate");
        },

        deactivated() {
            console.log("deactivate");
        }
    }
</script>
