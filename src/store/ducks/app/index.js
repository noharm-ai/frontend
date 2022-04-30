import { createActions, createReducer } from 'reduxsauce';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

export const { Types, Creators } = createActions({
  appSetConfig: ['config'],
  appSetSider: ['sider'],
  appSetScreeningListFilter: ['params'],
  appSaveFilter: ['filterType', 'filter'],
  appRemoveFilter: ['filterType', 'index'],
  appSetJourney: ['journey'],
  appSetCurrentVersion: ['version'],
  appSetNotification: ['notification']
});

const INITIAL_STATE = {
  config: {
    nameUrl: null,
    nameHeaders: [],
    apiKey: process.env.REACT_APP_API_KEY || null
  },
  sider: {
    collapsed: false
  },
  filter: {
    screeningList: {
      idSegment: null,
      idDepartment: [],
      idDrug: [],
      pending: 0
    }
  },
  savedFilters: {
    screeningList: []
  },
  help: {
    section: null
  },
  preferences: {
    journey: 'patient'
  },
  notification: null,
  currentVersion: '0'
};

const saveFilter = (state = INITIAL_STATE, { filterType, filter }) => {
  const getListByType = type => {
    switch (type) {
      case 'screeningList':
        return [...state.savedFilters.screeningList];
      default:
        console.log('invalid filter type');
    }
  };
  const updateListByType = (type, newList) => {
    switch (type) {
      case 'screeningList':
        return {
          ...state,
          savedFilters: {
            ...state.savedFilters,
            screeningList: newList
          }
        };
      default:
        console.log('invalid filter type');
    }
  };

  const list = getListByType(filterType);
  list.push(filter);
  return updateListByType(filterType, list);
};

const removeFilter = (state = INITIAL_STATE, { filterType, index }) => {
  const getListByType = type => {
    switch (type) {
      case 'screeningList':
        return [...state.savedFilters.screeningList];
      default:
        console.log('invalid filter type');
    }
  };
  const updateListByType = (type, newList) => {
    switch (type) {
      case 'screeningList':
        return {
          ...state,
          savedFilters: {
            ...state.savedFilters,
            screeningList: newList
          }
        };
      default:
        console.log('invalid filter type');
    }
  };

  const list = getListByType(filterType);
  list.splice(index, 1);
  return updateListByType(filterType, list);
};

const setCurrentVersion = (state = INITIAL_STATE, { version }) => ({
  ...state,
  currentVersion: version
});

const setNotification = (state = INITIAL_STATE, { notification }) => ({
  ...state,
  notification
});

const setSider = (state = INITIAL_STATE, { sider }) => ({
  ...state,
  sider: {
    ...state.sider,
    ...sider
  }
});

const setConfig = (state = INITIAL_STATE, { config }) => ({
  ...state,
  config: {
    ...state.config,
    ...config
  }
});

const setScreeningListFilter = (state = INITIAL_STATE, { params }) => ({
  ...state,
  filter: {
    ...state.filter,
    screeningList: {
      ...state.filter.screeningList,
      ...params
    }
  }
});

const setJourney = (state = INITIAL_STATE, { journey }) => ({
  ...state,
  preferences: {
    ...state.preferences,
    journey
  }
});

const HANDLERS = {
  [Types.APP_SET_CONFIG]: setConfig,
  [Types.APP_SET_SIDER]: setSider,
  [Types.APP_SET_JOURNEY]: setJourney,
  [Types.APP_SET_SCREENING_LIST_FILTER]: setScreeningListFilter,
  [Types.APP_SAVE_FILTER]: saveFilter,
  [Types.APP_REMOVE_FILTER]: removeFilter,
  [Types.APP_SET_CURRENT_VERSION]: setCurrentVersion,
  [Types.APP_SET_NOTIFICATION]: setNotification
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

const persist = {
  storage,
  key: 'app',
  stateReconciler: autoMergeLevel2
};

export default persistReducer(persist, reducer);
