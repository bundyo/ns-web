import Vue from 'vue';
import wrap from '@vue/web-component-wrapper';

import App from './my-app.vue';

Vue.config.productionTip = false;

window.customElements.define(App.name, wrap(Vue, App));
