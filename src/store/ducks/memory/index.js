import { createActions, createReducer } from 'reduxsauce';

export const { Types, Creators } = createActions({
  memoryFetchStart: ['storeId'],
  memoryFetchError: ['storeId', 'error'],
  memoryFetchSuccess: ['storeId', 'list'],

  memorySaveStart: ['storeId'],
  memorySaveError: ['storeId', 'error'],
  memorySaveSuccess: ['storeId', 'item'],
  memorySaveReset: ['storeId'],

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
  },
  signature: {
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

const fetchStart = (state = INITIAL_STATE, { storeId }) => ({
  ...state,
  [storeId]: {
    ...state[storeId],
    isFetching: true
  }
});

const fetchError = (state = INITIAL_STATE, { storeId, error }) => ({
  ...state,
  [storeId]: {
    ...state[storeId],
    isFetching: false,
    error
  }
});

const fetchSuccess = (state = INITIAL_STATE, { storeId, list }) => ({
  ...state,
  [storeId]: {
    ...state[storeId],
    isFetching: false,
    error: null,
    list
  }
});

const saveStart = (state = INITIAL_STATE, { storeId }) => ({
  ...state,
  [storeId]: {
    ...state[storeId],
    save: {
      ...state[storeId].save,
      isSaving: true
    }
  }
});

const saveError = (state = INITIAL_STATE, { storeId, error }) => ({
  ...state,
  [storeId]: {
    ...state[storeId],
    save: {
      ...state[storeId].save,
      isSaving: false,
      error
    }
  }
});

const saveSuccess = (state = INITIAL_STATE, { storeId, item }) => ({
  ...state,
  [storeId]: {
    ...state[storeId],
    list: [item],
    save: {
      ...state[storeId].save,
      isSaving: false,
      error: null,
      success: true
    }
  }
});

const saveReset = (state = INITIAL_STATE) => ({
  ...state,
  reasonText: {
    ...state.reasonText,
    save: {
      ...INITIAL_STATE.reasonText.save
    }
  }
});

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
  [Types.MEMORY_FETCH_START]: fetchStart,
  [Types.MEMORY_FETCH_ERROR]: fetchError,
  [Types.MEMORY_FETCH_SUCCESS]: fetchSuccess,

  [Types.MEMORY_SAVE_START]: saveStart,
  [Types.MEMORY_SAVE_ERROR]: saveError,
  [Types.MEMORY_SAVE_SUCCESS]: saveSuccess,
  [Types.MEMORY_SAVE_RESET]: saveReset,

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
