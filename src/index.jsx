import React from "react";
import * as ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import { ConfigProvider } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";
import localePtBr from "antd/locale/pt_BR";
import localeEnUs from "antd/locale/en_US";
import dayjs from "dayjs";
import dayjsLocalePtBr from "dayjs/locale/pt-br";
import dayjsLocaleEnUs from "dayjs/locale/en";

import RoutedComponent from "routes";
import App from "containers/App";
import { SupportDrawer } from "./features/support/SupportDrawer";
import { store, persistor } from "store/index.ts";
import * as serviceWorker from "./serviceWorker";

import trans_pt from "./translations/pt.json";
import trans_en from "./translations/en.json";

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

if (i18next.language === "en") {
  dayjs.locale(dayjsLocaleEnUs);
} else {
  dayjs.locale(dayjsLocalePtBr);
}

let hashPriority = "low";
window.nh_compatibility = false;
if (window.UAParser) {
  const uap = new window.UAParser();
  const uapResult = uap ? uap.getResult() : null;

  if (uapResult) {
    if (uapResult.browser.name === "Chrome" && uapResult.browser.major <= 87) {
      window.nh_compatibility = true;
      hashPriority = "high";
    }
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <I18nextProvider i18n={i18next}>
        <PersistGate loading={null} persistor={persistor}>
          <ConfigProvider
            locale={i18next.language === "en" ? localeEnUs : localePtBr}
          >
            <StyleProvider hashPriority={hashPriority}>
              <App>
                <BrowserRouter>
                  <RoutedComponent />
                  <SupportDrawer />
                </BrowserRouter>
              </App>
            </StyleProvider>
          </ConfigProvider>
        </PersistGate>
      </I18nextProvider>
    </Provider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
