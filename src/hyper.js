import HyperHTMLElement from 'hyperhtml-element';

import "./css/nweb.css";

import "./css/_app-common.scss";

import "./ns-app";
import "./hypers/ns-element";
import "./hypers/ns-button";
import "./hypers/ns-absolute-layout";
import "./hypers/ns-grid-layout";
import "./hypers/ns-stack-layout";
import "./hypers/ns-wrap-layout";
import "./hypers/ns-scroll-view";
import "./hypers/ns-action-bar";
import "./hypers/ns-action-item";
import "./hypers/ns-navigation-button";
import "./hypers/ns-page";
import "./hypers/ns-image";
import "./hypers/ns-label";

const $root = document.getElementById('root');

HyperHTMLElement.bind($root)`
    <h1>HyperHTMLElement test</h1>
    <ns-app />
`;
