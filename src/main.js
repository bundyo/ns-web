import Vue from 'vue';
import wrap from '@vue/web-component-wrapper'
import MyApp from './my-app?shadow';

import NSTemplate from "./components/ns-template?shadow";
import NSElement from "./components/ns-element?shadow";
import NSGridLayout from "./components/ns-grid-layout?shadow";
import NSStackLayout from "./components/ns-stack-layout?shadow";
import NSWrapLayout from "./components/ns-wrap-layout?shadow";
import NSAbsoluteLayout from "./components/ns-absolute-layout?shadow";
import NSImage from "./components/ns-image?shadow";
import NSActionBar from "./components/ns-action-bar?shadow";
import NSPage from "./components/ns-page?shadow";
import NSLabel from "./components/ns-label?shadow";
import NSButton from "./components/ns-button?shadow";
import NSNavigationButton from "./components/ns-navigation-button?shadow";
import NSActionItem from "./components/ns-action-item?shadow";
import NSScrollView from "./components/ns-scroll-view?shadow";

window.customElements.define(NSTemplate.name, wrap(Vue, NSTemplate));
window.customElements.define(NSElement.name, wrap(Vue, NSElement));
window.customElements.define(NSGridLayout.name, wrap(Vue, NSGridLayout));
window.customElements.define(NSStackLayout.name, wrap(Vue, NSStackLayout));
window.customElements.define(NSWrapLayout.name, wrap(Vue, NSWrapLayout));
window.customElements.define(NSAbsoluteLayout.name, wrap(Vue, NSAbsoluteLayout));
window.customElements.define(NSImage.name, wrap(Vue, NSImage));
window.customElements.define(NSActionBar.name, wrap(Vue, NSActionBar));
window.customElements.define(NSPage.name, wrap(Vue, NSPage));
window.customElements.define(NSLabel.name, wrap(Vue, NSLabel));
window.customElements.define(NSButton.name, wrap(Vue, NSButton));
window.customElements.define(NSNavigationButton.name, wrap(Vue, NSNavigationButton));
window.customElements.define(NSActionItem.name, wrap(Vue, NSActionItem));
window.customElements.define(NSScrollView.name, wrap(Vue, NSScrollView));

Vue.config.productionTip = false;

window.customElements.define("my-app", wrap(Vue, MyApp));
