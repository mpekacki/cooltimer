import "./custom.scss";
import "@fontsource/signika";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import DefaultSettings from "./DefaultSettings";
import BrowserNotifications from "./BrowserNotifications";
import LocalStorage from "./LocalStorage";

ReactDOM.render(
  <App
    basename={process.env.PUBLIC_URL}
    defaultSettings={new DefaultSettings()}
    notifications={new BrowserNotifications()}
    storage={new LocalStorage()}
  />,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();
