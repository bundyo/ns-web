<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <hello-world msg="Welcome to Your Vue.js App"></hello-world>
  </div>
</template>

<script>
  import Vue from "vue";
  import wrap from '@vue/web-component-wrapper';

  import HelloWorld from './components/hello-world.vue';

  window.customElements.define(HelloWorld.name, wrap(Vue, HelloWorld));

  export default {
    name: 'my-app',

    created() {
      console.log(this.$root.$options.shadowRoot);
    }
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
</style>
