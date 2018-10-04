<template>
    <div>
        <slot></slot>
    </div>
</template>

<script>
    export default {
        name: 'ns-page',
        extends: import("./ns-element"),

        props: {
            msg: String
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    a {
        color: #42b983;
    }
</style>
