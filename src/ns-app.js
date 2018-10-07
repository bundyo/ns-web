import HyperHTMLElement from 'hyperhtml-element';

class NSApp extends HyperHTMLElement {

    attributeChangedCallback(name, prev, curr) {
        this.render();
    }

    render() {
        return this.html`<ns-page xmlns="http://schemas.nativescript.org/tns.xsd"
             loaded="pageLoaded">
        <ns-action-bar class="action-bar" title="ActionBar">
            <ns-action-item android.position="left" tap="showButtons" text="Buttons"></ns-action-item>
            <ns-action-item android.position="right" tap="showSlideout" text="Details"></ns-action-item>
        </ns-action-bar>
        <ns-scroll-view>
            <ns-grid-layout rows="auto, auto, auto, auto, auto, auto" columns="100, *, 100">
                <ns-label text="Page" class="title" col="0"></ns-label>
                <ns-button text="TAP" icon="logo.png" @tap="onTap" col="1"></ns-button>
                <ns-label :text="message" class="message" textWrap="true" col="2"></ns-label>
                <ns-label class="title" col="0" row="1" colSpan="3" text="Span Label"></ns-label>
                <ns-stack-layout row="2" col="0" colSpan="2" orientation="vertical">
                    <ns-image src="http://www.google.com/images/errors/logo_sm_2.png" stretch="none"></ns-image>
                    <ns-absolute-layout width="210" height="210" background-color="lightgray">
                        <ns-label text="10, 10" left="10" top="10" width="90" height="90"
                                  background-color="orangered"></ns-label>
                        <ns-label text="110, 10" left="110" top="10" width="90" height="90"
                                  background-color="lightgreen"></ns-label>
                        <ns-label text="110, 110" left="110" top="110" width="90" height="90"
                                  background-color="dodgerblue"></ns-label>
                        <ns-label text="10, 110" left="10" top="110" width="90" height="90"
                                  background-color="yellow"></ns-label>
                    </ns-absolute-layout>
                </ns-stack-layout>
                <ns-stack-layout row="3" col="0" colSpan="3" orientation="horizontal">
                    <ns-image src="http://www.google.com/images/errors/logo_sm_2.png" stretch="none"></ns-image>
                    <ns-absolute-layout width="210" height="210" background-color="lightgray">
                        <ns-label text="10, 10" left="10" top="10" width="90" height="90"
                                  background-color="orangered"></ns-label>
                        <ns-label text="110, 10" left="110" top="10" width="90" height="90"
                                  background-color="lightgreen"></ns-label>
                        <ns-label text="110, 110" left="110" top="110" width="90" height="90"
                                  background-color="dodgerblue"></ns-label>
                        <ns-label text="10, 110" left="10" top="110" width="90" height="90"
                                  background-color="yellow"></ns-label>
                    </ns-absolute-layout>
                </ns-stack-layout>
                <ns-stack-layout row="4" col="0" colSpan="3" orientation="horizontal">
                    <ns-image src="http://www.google.com/images/errors/logo_sm_2.png" stretch="none"></ns-image>
                    <ns-absolute-layout width="210" height="210" background-color="lightgray">
                        <ns-label text="10, 10" left="10" top="10" width="90" height="90"
                                  background-color="orangered"></ns-label>
                        <ns-label text="110, 10" left="110" top="10" width="90" height="90"
                                  background-color="lightgreen"></ns-label>
                        <ns-label text="110, 110" left="110" top="110" width="90" height="90"
                                  background-color="dodgerblue"></ns-label>
                        <ns-label text="10, 110" left="10" top="110" width="90" height="90"
                                  background-color="yellow"></ns-label>
                    </ns-absolute-layout>
                </ns-stack-layout>
                <ns-stack-layout row="5" col="0" colSpan="3" orientation="horizontal">
                    <ns-image src="http://www.google.com/images/errors/logo_sm_2.png" stretch="none"></ns-image>
                    <ns-absolute-layout width="210" height="210" background-color="lightgray">
                        <ns-label text="10, 10" left="10" top="10" width="90" height="90"
                                  background-color="orangered"></ns-label>
                        <ns-label text="110, 10" left="110" top="10" width="90" height="90"
                                  background-color="lightgreen"></ns-label>
                        <ns-label text="110, 110" left="110" top="110" width="90" height="90"
                                  background-color="dodgerblue"></ns-label>
                        <ns-label text="10, 110" left="10" top="110" width="90" height="90"
                                  background-color="yellow"></ns-label>
                    </ns-absolute-layout>
                </ns-stack-layout>
            </ns-grid-layout>

            <!--        <ns-absolute-layout width="210" height="210" background-color="lightgray">
                <ns-label text="no margin" left="10" top="10" width="100" height="100" background-color="dodgerblue"></ns-label>
                <ns-label text="margin=30" left="10" top="10" margin="30" width="100" height="90" background-color="lightgreen"></ns-label>
            </ns-absolute-layout>
            <ns-stack-layout orientation="horizontal">
                <ns-label text="Items Page" class="title" col="0"></ns-label>
                <ns-button text="TAP" @tap="onTap" col="1" color="red"></ns-button>
                <ns-label :text="message" class="message" textWrap="true" col="2"></ns-label>
            </ns-stack-layout>
            <ns-stack-layout orientation="vertical" width="210" height="210" background-color="lightgray">
                <ns-label text="Label 1" horizontalAlignment="left" background-color="orangered"></ns-label>
                <ns-label text="Label 2" horizontalAlignment="center" background-color="lightgreen"></ns-label>
                <ns-label text="Label 3" horizontalAlignment="right" background-color="dodgerblue"></ns-label>
                <ns-label text="Label 4" horizontalAlignment="stretch" background-color="yellow"></ns-label>
            </ns-stack-layout>
            <ns-stack-layout orientation="horizontal" width="210" height="210" background-color="lightgray">
                <ns-label text="Label 1" verticalAlignment="top" background-color="orangered"></ns-label>
                <ns-label text="Label 2" verticalAlignment="center" background-color="lightgreen"></ns-label>
                <ns-label text="Label 3" verticalAlignment="bottom" background-color="dodgerblue"></ns-label>
                <ns-label text="Label 4" verticalAlignment="stretch" background-color="yellow"></ns-label>
            </ns-stack-layout>
            <ns-wrap-layout orientation="horizontal" width="210" height="210" background-color="lightgray">
                <ns-label text="Label 1" width="70" height="70" background-color="orangered"></ns-label>
                <ns-label text="Label 2" width="70" height="70" background-color="lightgreen"></ns-label>
                <ns-label text="Label 3" width="70" height="70" background-color="dodgerblue"></ns-label>
                <ns-label text="Label 4" width="70" height="70" background-color="yellow"></ns-label>
            </ns-wrap-layout>
            <ns-wrap-layout orientation="vertical" width="210" height="210" background-color="lightgray">
                <ns-label text="Label 1" width="70" height="70" background-color="orangered"></ns-label>
                <ns-label text="Label 2" width="70" height="70" background-color="lightgreen"></ns-label>
                <ns-label text="Label 3" width="70" height="70" background-color="dodgerblue"></ns-label>
                <ns-label text="Label 4" width="70" height="70" background-color="yellow"></ns-label>
            </ns-wrap-layout>-->
        </ns-scroll-view>
    </ns-page>`;
    }

    onclick() {
        //console.log("tap");
    }

    onAnyEvent(e) {
        //console.log(this, e.type, e.currentTarget, e.target);
    }

    get defaultState() {
        return { version: "0.1" };
    }
}

NSApp.define('ns-app');
