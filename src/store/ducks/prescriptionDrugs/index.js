import { createActions, createReducer } from 'reduxsauce';

export const { Types, Creators } = createActions({
  prescriptionDrugsSelect: ['item'],

  prescriptionDrugsSaveStart: [''],
  prescriptionDrugsSaveError: ['error'],
  prescriptionDrugsSaveSuccess: [''],
  prescriptionDrugsSaveReset: ['']
});

const INITIAL_STATE = {
  error: null,
  isFetching: true,
  list: [],
  single: {
    isSaving: false,
    success: false,
    error: null,
    item: {}
  }
};

const select = (state = INITIAL_STATE, { item }) => ({
  ...state,
  single: {
    ...state.single,
    item
  }
});

const saveStart = (state = INITIAL_STATE) => ({
  ...state,
  single: {
    ...state.single,
    isSaving: true
  }
});

const saveError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  single: {
    ...state.single,
    isSaving: false,
    error
  }
});

const saveSuccess = (state = INITIAL_STATE) => ({
  ...state,
  single: {
    ...state.single,
    isSaving: false,
    success: true
  }
});

const saveReset = (state = INITIAL_STATE) => ({
  ...state,
  single: {
    ...state.single,
    isSaving: false,
    success: false,
    error: null
  }
});

const HANDLERS = {
  [Types.PRESCRIPTION_DRUGS_SELECT]: select,

  [Types.PRESCRIPTION_DRUGS_SAVE_START]: saveStart,
  [Types.PRESCRIPTION_DRUGS_SAVE_ERROR]: saveError,
  [Types.PRESCRIPTION_DRUGS_SAVE_SUCCESS]: saveSuccess,
  [Types.PRESCRIPTION_DRUGS_SAVE_RESET]: saveReset
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

export default reducer;
