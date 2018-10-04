<template>
    <button class="ns-button__content" :class="buttonClass" :style="styles" @click="tap">
        <i class="ns-button__icon fa" :class="iconClass"></i>
        <slot><span>{{ currentText }}</span></slot>
    </button>
</template>

<script>
    import { props, styles } from "../consts";

    export default {
        name: 'ns-button',

        extends: import("./ns-element"),

        props: ["icon", "text"].concat(props),

        computed: {
            iconClass() {
                return {
                    [`fa-${this.icon}`]: true,
                    [`-${this.iconAlign}`]: true
                };
            },

            buttonClass() {
                return this.$el ? this.$el.className : "";
            },

            styles() {
                return styles.call(this);
            },

            currentText() {
                return this.text;
            }
        },

        methods: {
            tap() {
                this.$emit("tap");
            }
        }
    }
</script>

<style>
    :host > button {
        position: relative;
        display: inline-block;
        align-self: center;
    }

    :host > button {
        margin: 0 5px;
        padding: 0;
        font-family: inherit;
    }

    :host .ns-button__content {
        border-color: #ccc;
        border-style: solid;
        -webkit-appearance: none;
        appearance: none;
        display: block;
        font-size: inherit;
        color: inherit;
        background-color: inherit;
        width: 100%;
        height: 100%;
    }

    :host .ns-button__content {
        margin: 0;
        font-family: inherit;
    }
</style>
