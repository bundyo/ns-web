<template :class="classes" :style="styles">
    <div :style="styles">
        <slot></slot>
    </div>
</template>

<script>
    import { props, styles } from "../consts";

    export default {
        name: 'ns-element',

        props: ["disabled"].concat(props),

        computed: {
            styles() {
                return styles.call(this);
            },

            isDisabled() {
                return !!this.disabled;
            },

            classes() {
                return {
                    "ns-element": true,
                    "-disabled": this.isDisabled,
                };
            },
        }
    }
</script>
