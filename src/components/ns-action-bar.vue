<template>
    <div :style="styles">
        <span>{{ currentTitle }}</span>
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

<style>
    :host div {
        display: flex;
        background-color: #efefef;
        position: absolute;
        width: 100%;
        height: 3em;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        align-content: center;
        box-shadow: 0 0 5px rgba(0, 0, 0, .4);
        text-align: center;
        z-index: 1;
    }
    :host span {
        display: inline-block;
        flex-grow: 1;
        font-size: 1.5em;
    }
</style>
