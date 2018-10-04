<template>
  <div id="app">
    <ns-stack-layout>
        <ns-label text="test"></ns-label>
    </ns-stack-layout>
  </div>
</template>

<script>
    export default {
        name: 'my-app',

        created() {}
    }
</script>

<style>
    @import "./css/nweb.css";
    @import "./css/core.light.css";

    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>
