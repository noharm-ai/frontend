import { createActions, createReducer } from 'reduxsauce';

export const { Types, Creators } = createActions({
  outliersGenerateStart: ['segment'],
  outliersGenerateStop: ['status'],
  outliersResetGenerate: [''],

  outliersFetchListStart: [''],
  outliersFetchListError: ['error'],
  outliersFetchListSuccess: ['list', 'firstFilter'],

  outliersSaveStart: [''],
  outliersSaveSuccess: [''],
  outliersSaveReset: [''],
  outliersSaveError: ['error']
});

const INITIAL_STATE = {
  error: null,
  isFetching: false,
  list: [],
  firstFilter: {
    idDrug: undefined,
    idSegment: undefined
  },
  generate: {
    idSegment: null,
    nameSegment: '',
    isGenerating: false,
    status: null
  },
  save: {
    isSaving: false,
    success: false,
    error: null
  }
};

const generateStart = (state = INITIAL_STATE, { segment }) => ({
  ...state,
  generate: {
    ...segment,
    isGenerating: true
  }
});

const generateStop = (state = INITIAL_STATE, { status }) => ({
  ...state,
  generate: {
    ...state.generate,
    status,
    isGenerating: false
  }
});

const resetGenerate = (state = INITIAL_STATE) => ({
  ...state,
  generate: {
    ...INITIAL_STATE.generate
  }
});

const fetchListStart = (state = INITIAL_STATE) => ({
  ...state,
  isFetching: true
});

const fetchListError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  error,
  isFetching: false
});

const fetchListSuccess = (state = INITIAL_STATE, { list, firstFilter }) => ({
  ...state,
  list,
  firstFilter,
  error: null,
  isFetching: false
});

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
    isSaving: false,
  }
});

const saveReset = (state = INITIAL_STATE) => ({
  ...state,
  save: {
    ...INITIAL_STATE.save
  }
});

const saveSuccess = (state = INITIAL_STATE) => ({
  ...state,
  save: {
    ...state.save,
    error: null,
    success: true,
    isSaving: false,
  }
});

const HANDLERS = {
  [Types.OUTLIERS_GENERATE_STOP]: generateStop,
  [Types.OUTLIERS_GENERATE_START]: generateStart,
  [Types.OUTLIERS_RESET_GENERATE]: resetGenerate,

  [Types.OUTLIERS_FETCH_LIST_START]: fetchListStart,
  [Types.OUTLIERS_FETCH_LIST_ERROR]: fetchListError,
  [Types.OUTLIERS_FETCH_LIST_SUCCESS]: fetchListSuccess,

  [Types.OUTLIERS_SAVE_START]: saveStart,
  [Types.OUTLIERS_SAVE_ERROR]: saveError,
  [Types.OUTLIERS_SAVE_RESET]: saveReset,
  [Types.OUTLIERS_SAVE_SUCCESS]: saveSuccess,
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

export default reducer;
