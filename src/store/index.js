import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import autoRefreshToken from './middlewares/autoRefreshToken';
import reducers from './ducks';

const isDev = process.env.NODE_ENV === 'development';

const logger = createLogger({ collapsed: true });
const middlewares = [autoRefreshToken, thunk];

if (isDev) {
  middlewares.push(logger);
}

const persist = {
  storage,
  key: 'noHarm',
  whitelist: []
};

/* eslint-disable no-underscore-dangle */
const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
/* eslint-enable */

const initialState = {};
const persisted = persistReducer(persist, reducers);

const store = createStore(
  persisted,
  initialState,
  composeEnhancer(applyMiddleware(...middlewares))
);

const persistor = persistStore(store);

export { store, persistor };
