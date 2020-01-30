import { createActions, createReducer } from 'reduxsauce';

export const { Types, Creators } = createActions({
  prescriptionsFetchListStart: [''],
  prescriptionsFetchListError: ['error'],
  prescriptionsFetchListSuccess: ['list'],

  prescriptionsFetchSingleStart: [''],
  prescriptionsFetchSingleError: ['error'],
  prescriptionsFetchSingleSuccess: ['data'],

  prescriptionsCheckStart: [''],
  prescriptionsCheckError: ['error'],
  prescriptionsCheckSuccess: ['success']
});

const INITIAL_STATE = {
  error: null,
  isFetching: true,
  list: [],
  single: {
    error: null,
    isFetching: true,
    check: {
      error: null,
      success: {},
      isChecking: false
    },
    data: {}
  }
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

const fetchSingleStart = (state = INITIAL_STATE) => ({
  ...state,
  single: {
    ...state.single,
    isFetching: true
  }
});

const fetchSingleError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  single: {
    ...state.single,
    error,
    isFetching: false
  }
});

const fetchSingleSuccess = (state = INITIAL_STATE, { data }) => ({
  ...state,
  single: {
    ...state.single,
    data,
    error: null,
    isFetching: false
  }
});

const checkStart = (state = INITIAL_STATE) => ({
  ...state,
  single: {
    ...state.single,
    check: {
      ...state.check,
      isChecking: true
    }
  }
});

const checkError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  single: {
    ...state.single,
    check: {
      ...state.check,
      isChecking: false,
      error
    }
  }
});

const checkSuccess = (state = INITIAL_STATE, { success }) => ({
  ...state,
  single: {
    ...state.single,
    check: {
      ...state.single.check,
      error: null,
      isChecking: false,
      success
    }
  }
});

const HANDLERS = {
  [Types.PRESCRIPTIONS_FETCH_LIST_START]: fetchListStart,
  [Types.PRESCRIPTIONS_FETCH_LIST_ERROR]: fetchListError,
  [Types.PRESCRIPTIONS_FETCH_LIST_SUCCESS]: fetchListSuccess,

  [Types.PRESCRIPTIONS_FETCH_SINGLE_START]: fetchSingleStart,
  [Types.PRESCRIPTIONS_FETCH_SINGLE_ERROR]: fetchSingleError,
  [Types.PRESCRIPTIONS_FETCH_SINGLE_SUCCESS]: fetchSingleSuccess,

  [Types.PRESCRIPTIONS_CHECK_START]: checkStart,
  [Types.PRESCRIPTIONS_CHECK_ERROR]: checkError,
  [Types.PRESCRIPTIONS_CHECK_SUCCESS]: checkSuccess
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

export default reducer;
