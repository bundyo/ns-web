<template>
    <div>
        <slot></slot>
    </div>
</template>

<script>
    export default {
        name: 'ns-absolute-layout',
        props: {
            msg: String
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    h3 {
        margin: 40px 0 0;
    }
</style>
