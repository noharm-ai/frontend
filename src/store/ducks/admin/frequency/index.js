import { createActions, createReducer } from "reduxsauce";

export const { Types, Creators } = createActions({
  frequencyFetchListStart: [""],
  frequencyFetchListError: ["error"],
  frequencyFetchListSuccess: ["list"],

  frequencyReset: [],
});

const INITIAL_STATE = {
  error: null,
  isFetching: true,
  list: [],
  save: {
    isSaving: false,
    success: false,
    error: null,
  },
  single: {
    error: null,
    isFetching: false,
    content: {},
  },
};

const reset = () => INITIAL_STATE;

const fetchListStart = (state = INITIAL_STATE) => ({
  ...state,
  isFetching: true,
});

const fetchListError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  error,
  isFetching: false,
});

const fetchListSuccess = (state = INITIAL_STATE, { list }) => ({
  ...state,
  list,
  error: null,
  isFetching: false,
});

const HANDLERS = {
  [Types.FREQUENCY_FETCH_LIST_START]: fetchListStart,
  [Types.FREQUENCY_FETCH_LIST_ERROR]: fetchListError,
  [Types.FREQUENCY_FETCH_LIST_SUCCESS]: fetchListSuccess,

  [Types.FREQUENCY_RESET]: reset,
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

export default reducer;
