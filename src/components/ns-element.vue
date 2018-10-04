<template :class="classes">
    <div>
        <slot></slot>
    </div>
</template>

<script>
    export default {
        name: 'ns-element',

        props: ["disabled"],

        computed: {
            isDisabled() {
                return !!this.disabled;
            },

            classes() {
                return {
                    "ns-element": true,
                    "-disabled": this.isDisabled,
                };
            }
        }
    }
</script>
