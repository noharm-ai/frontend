import { createActions, createReducer } from 'reduxsauce';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

export const { Types, Creators } = createActions({
  appSetSider: ['sider']
});

const INITIAL_STATE = {
  sider: {
    collapsed: false,
  }
};

const setSider = (state = INITIAL_STATE, { sider }) => ({
  ...state,
  sider: {
    ...state.sider,
    ...sider
  }
});

const HANDLERS = {
  [Types.APP_SET_SIDER]: setSider,
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

const persist = {
  storage,
  key: 'app',
  stateReconciler: autoMergeLevel2
};

export default persistReducer(persist, reducer);
