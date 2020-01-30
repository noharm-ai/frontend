import { createActions, createReducer } from 'reduxsauce';

export const { Types, Creators } = createActions({
  interventionFetchReasonsListStart: [''],
  interventionFetchReasonsListError: ['error'],
  interventionFetchReasonsListSuccess: ['list'],

  interventionSetSaveStart: [''],
  interventionSetSaveError: ['error'],
  interventionSetSaveSuccess: [''],
  interventionClearSavedStatus: [''],

  interventionSetSelectedItem: ['item'],
  interventionUpdateSelectedItemIntervention: ['intervention']
});

const INITIAL_STATE = {
  maybeCreateOrUpdate: {
    isSaving: false,
    wasSaved: false,
    error: null,
    item: {}
  },
  reasons: {
    error: null,
    isFetching: true,
    list: []
  }
};

const setSaveStart = (state = INITIAL_STATE) => ({
  ...state,
  maybeCreateOrUpdate: {
    ...state.maybeCreateOrUpdate,
    wasSaved: false,
    isSaving: true
  }
});

const fetchReasonsListStart = (state = INITIAL_STATE) => ({
  ...state,
  reasons: {
    ...state.reasons,
    isFetching: true
  }
});

const fetchReasonsListError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  reasons: {
    ...state.reasons,
    error,
    isFetching: false
  }
});

const fetchReasonsListSuccess = (state = INITIAL_STATE, { list }) => ({
  ...state,
  reasons: {
    ...state.reasons,
    list,
    error: null,
    isFetching: false
  }
});

const setSaveError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  maybeCreateOrUpdate: {
    ...state.maybeCreateOrUpdate,
    error,
    wasSaved: false,
    isSaving: false
  }
});

const setSaveSuccess = (state = INITIAL_STATE) => ({
  ...state,
  maybeCreateOrUpdate: {
    ...state.maybeCreateOrUpdate,
    error: null,
    isSaving: false,
    wasSaved: true
  }
});

const clearSavedStatus = (state = INITIAL_STATE) => ({
  ...state,
  maybeCreateOrUpdate: {
    ...state.maybeCreateOrUpdate,
    error: null,
    isSaving: false,
    wasSaved: false
  }
});

const setSelectedItem = (state = INITIAL_STATE, { item }) => ({
  ...state,
  maybeCreateOrUpdate: {
    ...state.maybeCreateOrUpdate,
    item
  }
});

const updateSelectedItemIntervention = (state = INITIAL_STATE, { intervention }) => ({
  ...state,
  maybeCreateOrUpdate: {
    ...state.maybeCreateOrUpdate,
    item: {
      ...state.maybeCreateOrUpdate.item,
      intervention: {
        ...state.maybeCreateOrUpdate.item.intervention,
        ...intervention
      }
    }
  }
});

const HANDLERS = {
  [Types.INTERVENTION_FETCH_REASONS_LIST_START]: fetchReasonsListStart,
  [Types.INTERVENTION_FETCH_REASONS_LIST_ERROR]: fetchReasonsListError,
  [Types.INTERVENTION_FETCH_REASONS_LIST_SUCCESS]: fetchReasonsListSuccess,

  [Types.INTERVENTION_SET_SAVE_START]: setSaveStart,
  [Types.INTERVENTION_SET_SAVE_ERROR]: setSaveError,
  [Types.INTERVENTION_SET_SAVE_SUCCESS]: setSaveSuccess,
  [Types.INTERVENTION_CLEAR_SAVED_STATUS]: clearSavedStatus,

  [Types.INTERVENTION_SET_SELECTED_ITEM]: setSelectedItem,
  [Types.INTERVENTION_UPDATE_SELECTED_ITEM_INTERVENTION]: updateSelectedItemIntervention
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

export default reducer;
