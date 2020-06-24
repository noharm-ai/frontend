import { createActions, createReducer } from 'reduxsauce';

export const { Types, Creators } = createActions({
  segmentsFetchListStart: [''],
  segmentsFetchListError: ['error'],
  segmentsFetchListSuccess: ['list'],

  segmentsFetchSingleStart: [''],
  segmentsFetchSingleError: ['error'],
  segmentsFetchSingleSuccess: ['content', 'firstFilter'],
  segmentsFetchSingleReset: [''],

  segmentsSaveSingleStart: [''],
  segmentsSaveSingleSuccess: [''],
  segmentsSaveSingleReset: [''],
  segmentsSaveSingleError: ['error']
});

const INITIAL_STATE = {
  error: null,
  isFetching: true,
  list: [],
  firstFilter: {
    idSegment: undefined
  },
  save: {
    isSaving: false,
    success: false,
    error: null
  },
  single: {
    error: null,
    isFetching: false,
    content: {}
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

const fetchSingleSuccess = (state = INITIAL_STATE, { content, firstFilter }) => ({
  ...state,
  firstFilter,
  single: {
    ...state.single,
    content,
    error: null,
    isFetching: false
  }
});

const fetchSingleReset = (state = INITIAL_STATE) => ({
  ...state,
  single: {
    ...INITIAL_STATE.single
  }
});

const saveSingleStart = (state = INITIAL_STATE) => ({
  ...state,
  save: {
    ...state.save,
    isSaving: true
  }
});

const saveSingleError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  save: {
    ...state.save,
    error,
    isSaving: false
  }
});

const saveSingleReset = (state = INITIAL_STATE) => ({
  ...state,
  save: {
    ...INITIAL_STATE.save
  }
});

const saveSingleSuccess = (state = INITIAL_STATE) => ({
  ...state,
  save: {
    ...state.save,
    error: null,
    success: true,
    isSaving: false
  }
});

const HANDLERS = {
  [Types.SEGMENTS_FETCH_LIST_START]: fetchListStart,
  [Types.SEGMENTS_FETCH_LIST_ERROR]: fetchListError,
  [Types.SEGMENTS_FETCH_LIST_SUCCESS]: fetchListSuccess,

  [Types.SEGMENTS_FETCH_SINGLE_START]: fetchSingleStart,
  [Types.SEGMENTS_FETCH_SINGLE_ERROR]: fetchSingleError,
  [Types.SEGMENTS_FETCH_SINGLE_SUCCESS]: fetchSingleSuccess,
  [Types.SEGMENTS_FETCH_SINGLE_RESET]: fetchSingleReset,

  [Types.SEGMENTS_SAVE_SINGLE_START]: saveSingleStart,
  [Types.SEGMENTS_SAVE_SINGLE_ERROR]: saveSingleError,
  [Types.SEGMENTS_SAVE_SINGLE_RESET]: saveSingleReset,
  [Types.SEGMENTS_SAVE_SINGLE_SUCCESS]: saveSingleSuccess
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

export default reducer;
