import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { createLogger } from "redux-logger";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import autoRefreshToken from "./middlewares/autoRefreshToken";
import reducers from "./ducks/index.ts";

const isDev = process.env.NODE_ENV === "development";

const logger = createLogger({ collapsed: true });

const persist = {
  storage,
  key: "noHarm",
  whitelist: [],
};

const persisted = persistReducer(persist, reducers);

const store: any = configureStore({
  reducer: persisted,
  middleware: (getDefaultMiddleware) => {
    if (isDev) {
      return getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
      }).prepend(autoRefreshToken, logger);
    }

    return getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }).prepend(autoRefreshToken);
  },
});

const persistor = persistStore(store);

export { store, persistor };

export type AppDispatch = typeof store.dispatch;
export type IRootState = ReturnType<typeof reducers>;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<IRootState>();
