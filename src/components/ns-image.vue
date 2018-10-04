<template>
    <img :src="source" alt=""/>
</template>

<script>
    const sourceRegExp = /^~\//;

    export default {
        name: 'ns-image',
        extends: import("./ns-element"),

        props: ["src"],

        computed: {
            source() {
                return this.src.replace(sourceRegExp, "");
            }
        }
    }
</script>
