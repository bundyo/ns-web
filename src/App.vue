<template>
    <div id="app">

        <my-app></my-app>

    </div>
</template>

<script>
    import Vue from 'vue';
    import wrap from '@vue/web-component-wrapper'
    import MyApp from './my-app?shadow';

    window.customElements.define('my-app', wrap(Vue, MyApp));

    export default {
        name: 'app'
    }
</script>
