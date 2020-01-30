import { createActions, createReducer } from 'reduxsauce';
import { persistReducer } from 'redux-persist';
import session from 'redux-persist/lib/storage/session';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

export const { Types, Creators } = createActions({
  sessionSetFirstAccess: ['']
});

const INITIAL_STATE = {
  isFirstAccess: true
};

const setFirstAccess = (state = INITIAL_STATE) => ({
  ...state,
  isFirstAccess: false
});

const HANDLERS = {
  [Types.SESSION_SET_FIRST_ACCESS]: setFirstAccess
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

const persist = {
  key: 'session',
  storage: session,
  stateReconciler: autoMergeLevel2
};

export default persistReducer(persist, reducer);
