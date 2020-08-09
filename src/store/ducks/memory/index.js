import { createActions, createReducer } from 'reduxsauce';

export const { Types, Creators } = createActions({
  memoryFetchReasonTextStart: [''],
  memoryFetchReasonTextError: ['error'],
  memoryFetchReasonTextSuccess: ['list'],

  memorySaveReasonTextStart: [''],
  memorySaveReasonTextError: ['error'],
  memorySaveReasonTextSuccess: ['item'],
  memorySaveReasonTextReset: ['']
});

const INITIAL_STATE = {
  reasonText: {
    isFetching: false,
    error: null,
    list: [],
    save: {
      isSaving: false,
      success: false,
      error: null
    }
  }
};

const fetchReasonTextStart = (state = INITIAL_STATE) => ({
  ...state,
  reasonText: {
    ...state.reasonText,
    isFetching: true
  }
});

const fetchReasonTextError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  reasonText: {
    ...state.reasonText,
    isFetching: false,
    error
  }
});

const fetchReasonTextSuccess = (state = INITIAL_STATE, { list }) => ({
  ...state,
  reasonText: {
    ...state.reasonText,
    isFetching: false,
    error: null,
    list
  }
});

const saveReasonTextStart = (state = INITIAL_STATE) => ({
  ...state,
  reasonText: {
    ...state.reasonText,
    save: {
      ...state.reasonText.save,
      isSaving: true
    }
  }
});

const saveReasonTextError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  reasonText: {
    ...state.reasonText,
    save: {
      ...state.reasonText.save,
      isSaving: false,
      error
    }
  }
});

const saveReasonTextSuccess = (state = INITIAL_STATE, { item }) => ({
  ...state,
  reasonText: {
    ...state.reasonText,
    list: [item],
    save: {
      ...state.reasonText.save,
      isSaving: false,
      error: null,
      success: true
    }
  }
});

const saveReasonTextReset = (state = INITIAL_STATE) => ({
  ...state,
  reasonText: {
    ...state.reasonText,
    save: {
      ...INITIAL_STATE.reasonText.save
    }
  }
});

const HANDLERS = {
  [Types.MEMORY_FETCH_REASON_TEXT_START]: fetchReasonTextStart,
  [Types.MEMORY_FETCH_REASON_TEXT_ERROR]: fetchReasonTextError,
  [Types.MEMORY_FETCH_REASON_TEXT_SUCCESS]: fetchReasonTextSuccess,

  [Types.MEMORY_SAVE_REASON_TEXT_START]: saveReasonTextStart,
  [Types.MEMORY_SAVE_REASON_TEXT_ERROR]: saveReasonTextError,
  [Types.MEMORY_SAVE_REASON_TEXT_SUCCESS]: saveReasonTextSuccess,
  [Types.MEMORY_SAVE_REASON_TEXT_RESET]: saveReasonTextReset
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

export default reducer;
