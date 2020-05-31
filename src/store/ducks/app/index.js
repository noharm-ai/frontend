import { createActions, createReducer } from 'reduxsauce';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

export const { Types, Creators } = createActions({
  appSetSider: ['sider'],
  appSetScreeningListFilter: ['params']
});

const INITIAL_STATE = {
  sider: {
    collapsed: false
  },
  filter: {
    screeningList: {
      idSegment: null,
      idDepartment: []
    }
  }
};

const setSider = (state = INITIAL_STATE, { sider }) => ({
  ...state,
  sider: {
    ...state.sider,
    ...sider
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

const HANDLERS = {
  [Types.APP_SET_SIDER]: setSider,
  [Types.APP_SET_SCREENING_LIST_FILTER]: setScreeningListFilter
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

const persist = {
  storage,
  key: 'app',
  stateReconciler: autoMergeLevel2
};

export default persistReducer(persist, reducer);
