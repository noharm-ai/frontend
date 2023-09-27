import { createActions, createReducer } from "reduxsauce";

export const { Types, Creators } = createActions({
  departmentsFetchListStart: [""],
  departmentsFetchListError: ["error"],
  departmentsFetchListSuccess: ["list"],

  departmentsReset: [],
});

const INITIAL_STATE = {
  error: null,
  isFetching: true,
  list: [],
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
  [Types.DEPARTMENTS_FETCH_LIST_START]: fetchListStart,
  [Types.DEPARTMENTS_FETCH_LIST_ERROR]: fetchListError,
  [Types.DEPARTMENTS_FETCH_LIST_SUCCESS]: fetchListSuccess,

  [Types.DEPARTMENTS_RESET]: reset,
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

export default reducer;
