import { createActions, createReducer } from 'reduxsauce';
import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

export const { Types, Creators } = createActions({
  patientsFetchListStart: [''],
  patientsFetchListError: ['error'],
  patientsFetchListSuccess: ['list']
});

const INITIAL_STATE = {
  message: '',
  error: null,
  isFetching: false,
  list: {}
};

const fetchListStart = (state = INITIAL_STATE) => ({
  ...state,
  isFetching: true
});

const fetchListError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  error,
  isFetching: false
});

const fetchListSuccess = (state = INITIAL_STATE, { list }) => ({
  ...state,
  list,
  error: null,
  isFetching: false
});

const HANDLERS = {
  [Types.PATIENTS_FETCH_LIST_START]: fetchListStart,
  [Types.PATIENTS_FETCH_LIST_ERROR]: fetchListError,
  [Types.PATIENTS_FETCH_LIST_SUCCESS]: fetchListSuccess
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

const persist = {
  key: 'patients',
  storage,
  blacklist: ['message', 'error', 'isFetching'],
  stateReconciler: autoMergeLevel2
};

export default persistReducer(persist, reducer);
