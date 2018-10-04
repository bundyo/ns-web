<template>
    <img :src="source" alt=""/>
</template>

<script>
    const sourceRegExp = /^~\//;

    export default {
        name: 'ns-image',
        props: ["src"],

        computed: {
            source() {
                return this.src.replace(sourceRegExp, "");
            }
        }
    }
</script>
