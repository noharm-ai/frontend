import { createActions, createReducer } from "reduxsauce";

export const { Types, Creators } = createActions({
  interventionFetchListStart: [""],
  interventionFetchListError: ["error"],
  interventionFetchListSuccess: ["list"],

  interventionFetchReasonsListStart: [""],
  interventionFetchReasonsListError: ["error"],
  interventionFetchReasonsListSuccess: ["list"],

  interventionSetSaveStart: [""],
  interventionSetSaveError: ["error"],
  interventionSetSaveSuccess: [""],
  interventionClearSavedStatus: [""],

  interventionSetSelectedItem: ["item"],
  interventionUpdateSelectedItemIntervention: ["intervention"],

  interventionUpdateList: ["intervention"],
  interventionUpdateListStatus: ["idIntervention", "status"],

  interventionFetchFuturePrescriptionStart: [""],
  interventionFetchFuturePrescriptionError: ["error"],
  interventionFetchFuturePrescriptionSuccess: ["id", "data"],

  interventionReset: [],
});

const INITIAL_STATE = {
  error: null,
  isFetching: true,
  list: [],
  maybeCreateOrUpdate: {
    isSaving: false,
    wasSaved: false,
    error: null,
    item: {},
  },
  reasons: {
    error: null,
    isFetching: true,
    list: [],
  },
  futurePrescription: {
    error: null,
    isFetching: false,
  },
};

const reset = () => INITIAL_STATE;

const setSaveStart = (state = INITIAL_STATE) => ({
  ...state,
  maybeCreateOrUpdate: {
    ...state.maybeCreateOrUpdate,
    wasSaved: false,
    isSaving: true,
  },
});

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

const fetchReasonsListStart = (state = INITIAL_STATE) => ({
  ...state,
  reasons: {
    ...state.reasons,
    isFetching: true,
  },
});

const fetchReasonsListError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  reasons: {
    ...state.reasons,
    error,
    isFetching: false,
  },
});

const fetchReasonsListSuccess = (state = INITIAL_STATE, { list }) => ({
  ...state,
  reasons: {
    ...state.reasons,
    list,
    error: null,
    isFetching: false,
  },
});

const setSaveError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  maybeCreateOrUpdate: {
    ...state.maybeCreateOrUpdate,
    error,
    wasSaved: false,
    isSaving: false,
  },
});

const setSaveSuccess = (state = INITIAL_STATE) => ({
  ...state,
  maybeCreateOrUpdate: {
    ...state.maybeCreateOrUpdate,
    error: null,
    isSaving: false,
    wasSaved: true,
  },
});

const clearSavedStatus = (state = INITIAL_STATE) => ({
  ...state,
  maybeCreateOrUpdate: {
    ...state.maybeCreateOrUpdate,
    error: null,
    isSaving: false,
    wasSaved: false,
  },
});

const setSelectedItem = (state = INITIAL_STATE, { item }) => ({
  ...state,
  maybeCreateOrUpdate: {
    ...state.maybeCreateOrUpdate,
    item,
  },
});

const updateSelectedItemIntervention = (
  state = INITIAL_STATE,
  { intervention }
) => ({
  ...state,
  maybeCreateOrUpdate: {
    ...state.maybeCreateOrUpdate,
    item: {
      ...state.maybeCreateOrUpdate.item,
      intervention: {
        ...state.maybeCreateOrUpdate.item.intervention,
        ...intervention,
      },
    },
  },
});

const updateList = (state = INITIAL_STATE, { intervention }) => {
  const list = [...state.list];

  const index = list.findIndex(
    (item) => item.idIntervention === intervention.idIntervention
  );
  list[index] = intervention;

  return {
    ...state,
    list,
  };
};

const updateListStatus = (
  state = INITIAL_STATE,
  { idIntervention, status }
) => {
  const list = [...state.list];

  const index = list.findIndex(
    (item) => `${item.idIntervention}` === `${idIntervention}`
  );
  if (index !== -1) {
    list[index].status = status;
  }

  return {
    ...state,
    list,
  };
};

const fetchFuturePrescriptionStart = (state = INITIAL_STATE) => ({
  ...state,
  futurePrescription: {
    ...state.futurePrescription,
    isFetching: true,
  },
});

const fetchFuturePrescriptionError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  futurePrescription: {
    ...state.futurePrescription,
    isFetching: false,
    error,
  },
});

const fetchFuturePrescriptionSuccess = (
  state = INITIAL_STATE,
  { id, data }
) => {
  const list = [...state.list];
  const index = list.findIndex((item) => item.id === id);
  list[index].future = data;

  return {
    ...state,
    list,
    futurePrescription: {
      error: null,
      isFetching: false,
    },
  };
};

const HANDLERS = {
  [Types.INTERVENTION_FETCH_LIST_START]: fetchListStart,
  [Types.INTERVENTION_FETCH_LIST_ERROR]: fetchListError,
  [Types.INTERVENTION_FETCH_LIST_SUCCESS]: fetchListSuccess,

  [Types.INTERVENTION_FETCH_REASONS_LIST_START]: fetchReasonsListStart,
  [Types.INTERVENTION_FETCH_REASONS_LIST_ERROR]: fetchReasonsListError,
  [Types.INTERVENTION_FETCH_REASONS_LIST_SUCCESS]: fetchReasonsListSuccess,

  [Types.INTERVENTION_SET_SAVE_START]: setSaveStart,
  [Types.INTERVENTION_SET_SAVE_ERROR]: setSaveError,
  [Types.INTERVENTION_SET_SAVE_SUCCESS]: setSaveSuccess,
  [Types.INTERVENTION_CLEAR_SAVED_STATUS]: clearSavedStatus,

  [Types.INTERVENTION_SET_SELECTED_ITEM]: setSelectedItem,
  [Types.INTERVENTION_UPDATE_SELECTED_ITEM_INTERVENTION]:
    updateSelectedItemIntervention,

  [Types.INTERVENTION_UPDATE_LIST]: updateList,
  [Types.INTERVENTION_UPDATE_LIST_STATUS]: updateListStatus,

  [Types.INTERVENTION_FETCH_FUTURE_PRESCRIPTION_START]:
    fetchFuturePrescriptionStart,
  [Types.INTERVENTION_FETCH_FUTURE_PRESCRIPTION_ERROR]:
    fetchFuturePrescriptionError,
  [Types.INTERVENTION_FETCH_FUTURE_PRESCRIPTION_SUCCESS]:
    fetchFuturePrescriptionSuccess,

  [Types.INTERVENTION_RESET]: reset,
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

export default reducer;
