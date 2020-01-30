import { createActions, createReducer } from 'reduxsauce';

export const { Types, Creators } = createActions({
  drugsFetchListStart: [''],
  drugsFetchListError: ['error'],
  drugsFetchListSuccess: ['list']
});

const INITIAL_STATE = {
  message: '',
  error: null,
  isFetching: false,
  list: []
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
  [Types.DRUGS_FETCH_LIST_START]: fetchListStart,
  [Types.DRUGS_FETCH_LIST_ERROR]: fetchListError,
  [Types.DRUGS_FETCH_LIST_SUCCESS]: fetchListSuccess
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

export default reducer;
