import { createActions, createReducer } from 'reduxsauce';
import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

export const { Types, Creators } = createActions({
  userLogout: [''],
  userSetLoginStart: [''],
  userSetCurrentUser: ['account', 'keepMeLogged'],
  userSaveStart: [''],
  userSaveError: ['error'],
  userSaveSuccess: [''],
  userSaveReset: ['']
});

const INITIAL_STATE = {
  account: {
    userName: '',
    email: ''
  },
  keepMeLogged: false,
  isLogged: false,
  isLogging: false,
  save: {
    isSaving: false,
    success: false,
    error: null
  }
};

const saveStart = (state = INITIAL_STATE) => ({
  ...state,
  save: {
    ...state.save,
    isSaving: true
  }
});

const saveError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  save: {
    ...state.save,
    error,
    isSaving: false
  }
});

const saveSuccess = (state = INITIAL_STATE) => ({
  ...state,
  save: {
    ...state.save,
    error: null,
    success: true,
    isSaving: false
  }
});

const saveReset = (state = INITIAL_STATE) => ({
  ...state,
  save: {
    ...INITIAL_STATE.save
  }
});

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
  [Types.USER_SET_CURRENT_USER]: setCurrentUser,
  [Types.USER_SAVE_START]: saveStart,
  [Types.USER_SAVE_ERROR]: saveError,
  [Types.USER_SAVE_SUCCESS]: saveSuccess,
  [Types.USER_SAVE_RESET]: saveReset
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

const persist = {
  key: 'user',
  storage,
  blacklist: ['isLogging', 'save'],
  stateReconciler: autoMergeLevel2
};

export default persistReducer(persist, reducer);
