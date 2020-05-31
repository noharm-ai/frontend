import { createActions, createReducer } from 'reduxsauce';

export const { Types, Creators } = createActions({
  outliersGenerateStart: ['segment'],
  outliersGenerateStop: ['status'],
  outliersResetGenerate: [''],

  outliersGenerateDrugStart: [''],
  outliersGenerateDrugError: ['error'],
  outliersGenerateDrugSuccess: [''],
  outliersGenerateDrugReset: [''],

  outliersFetchListStart: [''],
  outliersFetchListError: ['error'],
  outliersFetchListSuccess: ['list', 'firstFilter'],

  outliersSaveStart: [''],
  outliersSaveSuccess: ['idOutlier', 'params'],
  outliersSaveReset: [''],
  outliersSaveError: ['error'],

  outliersSetSelectedItem: ['item'],
  outliersUpdateSelectedItem: ['item']
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
  generateDrugOutlier: {
    isGenerating: false,
    generated: false,
    error: null
  },
  save: {
    isSaving: false,
    success: false,
    error: null
  },
  edit: {
    isSaving: false,
    error: null,
    item: {}
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

const generateDrugStart = (state = INITIAL_STATE) => ({
  ...state,
  generateDrugOutlier: {
    ...state.generateDrugOutlier,
    isGenerating: true
  }
});

const generateDrugError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  generateDrugOutlier: {
    ...state.generateDrugOutlier,
    isGenerating: false,
    error
  }
});

const generateDrugSuccess = (state = INITIAL_STATE) => ({
  ...state,
  generateDrugOutlier: {
    ...state.generateDrugOutlier,
    isGenerating: false,
    generated: true,
    error: null
  }
});

const generateDrugReset = (state = INITIAL_STATE) => ({
  ...state,
  generateDrugOutlier: {
    ...state.generateDrugOutlier,
    isGenerating: false,
    generated: false,
    error: null
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
    isSaving: false
  }
});

const saveReset = (state = INITIAL_STATE) => ({
  ...state,
  save: {
    ...INITIAL_STATE.save
  }
});

const saveSuccess = (state = INITIAL_STATE, { idOutlier, params }) => {
  const list = [...state.list];
  const outlierIndex = list.findIndex(item => item.idOutlier === idOutlier);

  if (outlierIndex !== -1) {
    list[outlierIndex] = { ...list[outlierIndex], ...params };
  }

  return {
    ...state,
    list,
    save: {
      ...state.save,
      error: null,
      success: true,
      isSaving: false
    }
  };
};

const setSelectedItem = (state = INITIAL_STATE, { item }) => ({
  ...state,
  edit: {
    ...state.edit,
    item
  }
});

const updateSelectedItem = (state = INITIAL_STATE, { item }) => ({
  ...state,
  edit: {
    ...state.edit,
    item: {
      ...state.edit.item,
      ...item
    }
  }
});

const HANDLERS = {
  [Types.OUTLIERS_GENERATE_STOP]: generateStop,
  [Types.OUTLIERS_GENERATE_START]: generateStart,
  [Types.OUTLIERS_RESET_GENERATE]: resetGenerate,

  [Types.OUTLIERS_GENERATE_DRUG_START]: generateDrugStart,
  [Types.OUTLIERS_GENERATE_DRUG_ERROR]: generateDrugError,
  [Types.OUTLIERS_GENERATE_DRUG_SUCCESS]: generateDrugSuccess,
  [Types.OUTLIERS_GENERATE_DRUG_RESET]: generateDrugReset,

  [Types.OUTLIERS_FETCH_LIST_START]: fetchListStart,
  [Types.OUTLIERS_FETCH_LIST_ERROR]: fetchListError,
  [Types.OUTLIERS_FETCH_LIST_SUCCESS]: fetchListSuccess,

  [Types.OUTLIERS_SAVE_START]: saveStart,
  [Types.OUTLIERS_SAVE_ERROR]: saveError,
  [Types.OUTLIERS_SAVE_RESET]: saveReset,
  [Types.OUTLIERS_SAVE_SUCCESS]: saveSuccess,

  [Types.OUTLIERS_SET_SELECTED_ITEM]: setSelectedItem,
  [Types.OUTLIERS_UPDATE_SELECTED_ITEM]: updateSelectedItem
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

export default reducer;
