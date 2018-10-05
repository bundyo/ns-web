<template>
    <img :src="source" :style="styles" alt=""/>
</template>

<script>
    import { props, styles } from "../consts";

    const sourceRegExp = /^~\//;

    export default {
        name: 'ns-image',

        extends: import("./ns-element"),

        props: ["src"].concat(props),

        computed: {
            styles() {
                return styles.call(this);
            },

            source() {
                return this.src.replace(sourceRegExp, "");
            }
        }
    }
</script>
