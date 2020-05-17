import Vue from './nativescript-vue';
import App from './components/App';

import "app.scss";

// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = false;

new Vue({
  render: h => h('frame', [h(App)])
}).$start();
