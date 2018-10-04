<template>
    <span>{{ this.currentText }}</span>
</template>

<script>
    export default {
        name: 'ns-label',
        extends: import("./ns-element"),

        props: ["text"],

        computed: {
            currentText() {
                return this.text;
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    a {
        color: #42b983;
    }
</style>
