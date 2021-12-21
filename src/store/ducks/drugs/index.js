import { createActions, createReducer } from 'reduxsauce';

export const { Types, Creators } = createActions({
  drugsFetchListStart: [''],
  drugsFetchListError: ['error'],
  drugsFetchListSuccess: ['list'],

  drugsFetchSummaryStart: [''],
  drugsFetchSummaryError: ['error'],
  drugsFetchSummarySuccess: ['data'],

  drugsSearchStart: [''],
  drugsSearchError: ['error'],
  drugsSearchSuccess: ['list'],

  drugsUnitsFetchListStart: [''],
  drugsUnitsFetchListError: ['error'],
  drugsUnitsFetchListSuccess: ['list'],

  drugsSaveSingleStart: [''],
  drugsSaveSingleSuccess: ['success'],
  drugsSaveSingleReset: [''],
  drugsSaveSingleError: ['error'],

  unitCoefficientSaveStart: [''],
  unitCoefficientSaveSuccess: ['idMeasureUnit', 'item'],
  unitCoefficientSaveReset: [''],
  unitCoefficientSaveError: ['error']
});

const INITIAL_STATE = {
  message: '',
  error: null,
  isFetching: false,
  list: [],
  save: {
    isSaving: false,
    success: false,
    error: null
  },
  units: {
    error: null,
    isFetching: false,
    list: [],
    save: {
      isSaving: false,
      success: false,
      error: null
    }
  },
  search: {
    isFetching: false,
    error: null,
    list: []
  },
  summary: {
    isFetching: false,
    error: null,
    data: null
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

const fetchSummaryStart = (state = INITIAL_STATE) => ({
  ...state,
  summary: {
    ...state.summary,
    isFetching: true
  }
});

const fetchSummaryError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  summary: {
    ...state.summary,
    isFetching: false,
    error
  }
});

const fetchSummarySuccess = (state = INITIAL_STATE, { data }) => ({
  ...state,
  summary: {
    ...state.summary,
    isFetching: false,
    error: null,
    data
  }
});

const searchStart = (state = INITIAL_STATE) => ({
  ...state,
  search: {
    ...state.search,
    isFetching: true
  }
});

const searchError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  search: {
    ...state.search,
    error,
    isFetching: false
  }
});

const searchSuccess = (state = INITIAL_STATE, { list }) => ({
  ...state,
  search: {
    ...state.search,
    list,
    error: null,
    isFetching: false
  }
});

const unitsFetchListStart = (state = INITIAL_STATE) => ({
  ...state,
  units: {
    ...state.units,
    isFetching: true
  }
});

const unitsFetchListError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  units: {
    ...state.units,
    error,
    isFetching: false
  }
});

const unitsFetchListSuccess = (state = INITIAL_STATE, { list }) => ({
  ...state,
  units: {
    ...state.units,
    list,
    error: null,
    isFetching: false
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

const saveSingleSuccess = (state = INITIAL_STATE, { success }) => ({
  ...state,
  save: {
    ...state.save,
    error: null,
    success,
    isSaving: false
  }
});

const unitCoefficientSaveStart = (state = INITIAL_STATE) => {
  return {
    ...state,
    units: {
      ...state.units,
      save: {
        ...state.units.save,
        isSaving: true
      }
    }
  };
};

const unitCoefficientSaveError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  units: {
    ...state.units,
    save: {
      ...state.units.save,
      error,
      isSaving: false
    }
  }
});

const unitCoefficientSaveReset = (state = INITIAL_STATE) => ({
  ...state,
  units: {
    ...state.units,
    save: {
      ...INITIAL_STATE.units.save
    }
  }
});

const unitCoefficientSaveSuccess = (state = INITIAL_STATE, { idMeasureUnit, item }) => {
  const list = [...state.units.list];
  const index = list.findIndex(i => i.idMeasureUnit === idMeasureUnit);

  if (index !== -1) {
    list[index] = { ...list[index], ...item };
  }

  return {
    ...state,
    units: {
      ...state.units,
      list,
      save: {
        ...state.units.save,
        error: null,
        success: true,
        isSaving: false
      }
    }
  };
};

const HANDLERS = {
  [Types.DRUGS_FETCH_LIST_START]: fetchListStart,
  [Types.DRUGS_FETCH_LIST_ERROR]: fetchListError,
  [Types.DRUGS_FETCH_LIST_SUCCESS]: fetchListSuccess,

  [Types.DRUGS_FETCH_SUMMARY_START]: fetchSummaryStart,
  [Types.DRUGS_FETCH_SUMMARY_ERROR]: fetchSummaryError,
  [Types.DRUGS_FETCH_SUMMARY_SUCCESS]: fetchSummarySuccess,

  [Types.DRUGS_SEARCH_START]: searchStart,
  [Types.DRUGS_SEARCH_ERROR]: searchError,
  [Types.DRUGS_SEARCH_SUCCESS]: searchSuccess,

  [Types.DRUGS_UNITS_FETCH_LIST_START]: unitsFetchListStart,
  [Types.DRUGS_UNITS_FETCH_LIST_ERROR]: unitsFetchListError,
  [Types.DRUGS_UNITS_FETCH_LIST_SUCCESS]: unitsFetchListSuccess,

  [Types.DRUGS_SAVE_SINGLE_START]: saveSingleStart,
  [Types.DRUGS_SAVE_SINGLE_ERROR]: saveSingleError,
  [Types.DRUGS_SAVE_SINGLE_RESET]: saveSingleReset,
  [Types.DRUGS_SAVE_SINGLE_SUCCESS]: saveSingleSuccess,

  [Types.UNIT_COEFFICIENT_SAVE_START]: unitCoefficientSaveStart,
  [Types.UNIT_COEFFICIENT_SAVE_ERROR]: unitCoefficientSaveError,
  [Types.UNIT_COEFFICIENT_SAVE_RESET]: unitCoefficientSaveReset,
  [Types.UNIT_COEFFICIENT_SAVE_SUCCESS]: unitCoefficientSaveSuccess
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

export default reducer;
