import React from 'react';
import ReactDOM from 'react-dom';
import Webfontloader from 'webfontloader';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { I18nextProvider } from 'react-i18next';
import i18next from 'i18next';
import Routes from '@routes';
import { store, persistor } from '@store';
import * as serviceWorker from './serviceWorker';

import trans_pt from './translations/pt.json';
import trans_en from './translations/en.json';

Webfontloader.load({
  google: {
    families: ['Montserrat:300,400,500,700', 'Roboto:300', 'sans-serif']
  }
});

i18next.init({
  interpolation: { escapeValue: false },
  lng: localStorage.getItem('language') || 'pt', // language to use
  ns: ['common'],
  defaultNS: 'common',
  resources: {
    en: {
      name: 'English',
      common: trans_en
    },
    pt: {
      name: 'Português',
      common: trans_pt
    }
  }
});

ReactDOM.render(
  <Provider store={store}>
    <I18nextProvider i18n={i18next}>
      <PersistGate loading={null} persistor={persistor}>
        <Routes />
      </PersistGate>
    </I18nextProvider>
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
