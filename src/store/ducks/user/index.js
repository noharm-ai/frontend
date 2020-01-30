import { createActions, createReducer } from 'reduxsauce';
import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

export const { Types, Creators } = createActions({
  userLogout: [''],
  userSetLoginStart: [''],
  userSetCurrentUser: ['account', 'keepMeLogged']
});

const INITIAL_STATE = {
  account: {
    userName: ''
  },
  keepMeLogged: false,
  isLogged: false,
  isLogging: false
};

const setLoginStart = (state = INITIAL_STATE) => ({
  ...state,
  isLogging: true
});

const setCurrentUser = (state = INITIAL_STATE, { account, keepMeLogged }) => ({
  ...state,
  isLogging: false,
  isLogged: true,
  keepMeLogged,
  account: {
    ...state.account,
    ...account
  }
});

const logout = (state = INITIAL_STATE) => ({
  ...state,
  ...INITIAL_STATE
});

const HANDLERS = {
  [Types.USER_LOGOUT]: logout,
  [Types.USER_SET_LOGIN_START]: setLoginStart,
  [Types.USER_SET_CURRENT_USER]: setCurrentUser
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

const persist = {
  key: 'user',
  storage,
  blacklist: ['isLogging'],
  stateReconciler: autoMergeLevel2
};

export default persistReducer(persist, reducer);
