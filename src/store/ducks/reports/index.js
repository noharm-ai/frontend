import { createActions, createReducer } from "reduxsauce";

export const { Types, Creators } = createActions({
  reportsFetchListStart: [""],
  reportsFetchListError: ["error"],
  reportsFetchListSuccess: ["list"],

  reportsSelect: ["report"],

  reportsReset: [],
});

const INITIAL_STATE = {
  error: null,
  isFetching: true,
  list: [],
  single: null,
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

const select = (state = INITIAL_STATE, { report }) => ({
  ...state,
  single: report,
});

const HANDLERS = {
  [Types.REPORTS_FETCH_LIST_START]: fetchListStart,
  [Types.REPORTS_FETCH_LIST_ERROR]: fetchListError,
  [Types.REPORTS_FETCH_LIST_SUCCESS]: fetchListSuccess,

  [Types.REPORTS_SELECT]: select,

  [Types.REPORTS_RESET]: reset,
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

export default reducer;
