import { createActions, createReducer } from "reduxsauce";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";

export const { Types, Creators } = createActions({
  authDelIdentify: [""],
  authSetIdentify: ["identify"],
  authSetErrorIdentify: ["error", "message"],
  authSetRefreshTokenPromise: ["refreshTokenPromise"],
});

const INITIAL_STATE = {
  error: null,
  identify: {},
  refreshTokenPromise: null,
};

const setIdentify = (state = INITIAL_STATE, { identify }) => ({
  ...state,
  error: null,
  identify: {
    ...state.identify,
    ...identify,
  },
});

const setRefreshTokenPromise = (
  state = INITIAL_STATE,
  { refreshTokenPromise }
) => ({
  ...state,
  refreshTokenPromise,
});

const setErrorIdentify = (state = INITIAL_STATE, { error, message }) => ({
  ...state,
  error,
  message,
});

const delIdentify = (state = INITIAL_STATE) => ({
  ...state,
  identify: {},
});

const HANDLERS = {
  [Types.AUTH_DEL_IDENTIFY]: delIdentify,
  [Types.AUTH_SET_IDENTIFY]: setIdentify,
  [Types.AUTH_SET_REFRESH_TOKEN_PROMISE]: setRefreshTokenPromise,
  [Types.AUTH_SET_ERROR_IDENTIFY]: setErrorIdentify,
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

const persist = {
  key: "auth",
  storage,
  blacklist: ["message", "error", "refreshTokenPromise"],
  stateReconciler: autoMergeLevel2,
};

export default persistReducer(persist, reducer);
