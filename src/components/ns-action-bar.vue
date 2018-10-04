<template>
    <div>
        <span :text="currentTitle"></span>
        <slot></slot>
    </div>
</template>

<script>
    export default {
        name: 'ns-action-bar',
        props: ["title"],

        computed: {
            currentTitle() {
                return this.title;
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
