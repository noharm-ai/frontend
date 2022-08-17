import React from "react";
import * as ReactDOM from "react-dom/client";
import Webfontloader from "webfontloader";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import reportWebVitals from "./reportWebVitals";
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import "antd/dist/antd.min.css";

import RoutedComponent from "routes";
import App from "containers/App";
import { store, persistor } from "store";
import * as serviceWorker from "./serviceWorker";

import trans_pt from "./translations/pt.json";
import trans_en from "./translations/en.json";

Webfontloader.load({
  google: {
    families: ["Montserrat:300,400,500,700", "Roboto:300", "sans-serif"],
  },
});

i18next.init({
  interpolation: { escapeValue: false },
  lng: localStorage.getItem("language") || "pt", // language to use
  ns: ["common"],
  defaultNS: "common",
  resources: {
    en: {
      name: "English",
      common: trans_en,
    },
    pt: {
      name: "Português",
      common: trans_pt,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <I18nextProvider i18n={i18next}>
        <PersistGate loading={null} persistor={persistor}>
          <App>
            <BrowserRouter>
              <RoutedComponent />
            </BrowserRouter>
          </App>
        </PersistGate>
      </I18nextProvider>
    </Provider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
