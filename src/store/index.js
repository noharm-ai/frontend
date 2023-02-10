import { configureStore } from "@reduxjs/toolkit";
import { createLogger } from "redux-logger";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import autoRefreshToken from "./middlewares/autoRefreshToken";
import reducers from "./ducks";

const isDev = process.env.NODE_ENV === "development";

const logger = createLogger({ collapsed: true });
const middlewares = [autoRefreshToken];

if (isDev) {
  middlewares.push(logger);
}

const persist = {
  storage,
  key: "noHarm",
  whitelist: [],
};

const initialState = {};
const persisted = persistReducer(persist, reducers);

// TODO: review immutableCheck after migration
const store = configureStore({
  reducer: persisted,
  preloadedState: initialState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }).concat(middlewares),
});

const persistor = persistStore(store);

export { store, persistor };
