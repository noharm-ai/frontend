import { createActions, createReducer } from "reduxsauce";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";

export const { Types, Creators } = createActions({
  appSetData: ["data"],
  appSetConfig: ["config"],
  appSetSider: ["sider"],
  appSetScreeningListFilter: ["params"],
  appSetJourney: ["journey"],
  appSetCurrentVersion: ["version"],
  appSetNotification: ["notification"],
});

const INITIAL_STATE = {
  data: {
    hospitals: [],
  },
  config: {
    nameUrl: null,
    logoutUrl: null,
    nameHeaders: [],
    apiKey: import.meta.env.VITE_APP_API_KEY || null,
  },
  sider: {
    collapsed: true,
  },
  filter: {
    screeningList: {
      idSegment: [],
      idDepartment: [],
      idDrug: [],
      pending: 0,
    },
  },
  help: {
    section: null,
  },
  preferences: {
    journey: "cards",
  },
  notification: null,
  currentVersion: "0",
};

const setCurrentVersion = (state = INITIAL_STATE, { version }) => ({
  ...state,
  currentVersion: version,
});

const setNotification = (state = INITIAL_STATE, { notification }) => ({
  ...state,
  notification,
});

const setSider = (state = INITIAL_STATE, { sider }) => ({
  ...state,
  sider: {
    ...state.sider,
    ...sider,
  },
});

const setData = (state = INITIAL_STATE, { data }) => ({
  ...state,
  data: {
    ...state.data,
    ...data,
  },
});

const setConfig = (state = INITIAL_STATE, { config }) => ({
  ...state,
  config: {
    ...state.config,
    ...config,
  },
});

const setScreeningListFilter = (state = INITIAL_STATE, { params }) => ({
  ...state,
  filter: {
    ...state.filter,
    screeningList: {
      ...state.filter.screeningList,
      ...params,
    },
  },
});

const setJourney = (state = INITIAL_STATE, { journey }) => ({
  ...state,
  preferences: {
    ...state.preferences,
    journey,
  },
});

const HANDLERS = {
  [Types.APP_SET_DATA]: setData,
  [Types.APP_SET_CONFIG]: setConfig,
  [Types.APP_SET_SIDER]: setSider,
  [Types.APP_SET_JOURNEY]: setJourney,
  [Types.APP_SET_SCREENING_LIST_FILTER]: setScreeningListFilter,
  [Types.APP_SET_CURRENT_VERSION]: setCurrentVersion,
  [Types.APP_SET_NOTIFICATION]: setNotification,
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

const persist = {
  storage,
  key: "app",
  stateReconciler: autoMergeLevel2,
};

export default persistReducer(persist, reducer);
