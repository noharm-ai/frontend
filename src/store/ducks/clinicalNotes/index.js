import { createActions, createReducer } from "reduxsauce";

import {
  flatClinicalNotes,
  getPositionList,
} from "utils/transformers/clinicalNotes";

export const { Types, Creators } = createActions({
  clinicalNotesFetchListStart: [""],
  clinicalNotesFetchListError: ["error"],
  clinicalNotesFetchListSuccess: ["list", "dates"],

  clinicalNotesFetchListExtraStart: ["date"],
  clinicalNotesFetchListExtraSuccess: ["list"],

  clinicalNotesSelect: ["clinicalNote"],
  clinicalNotesUpdate: ["clinicalNote"],

  clinicalNotesSaveStart: [""],
  clinicalNotesSaveSuccess: [""],
  clinicalNotesSaveReset: [""],
  clinicalNotesSaveError: ["error"],
});

const INITIAL_STATE = {
  error: null,
  isFetching: true,
  isFetchingExtra: false,
  list: [],
  dates: {},
  positionList: [],
  single: null,
  save: {
    isSaving: false,
    success: false,
    error: null,
  },
};

const fetchListStart = (state = INITIAL_STATE) => ({
  ...state,
  isFetching: true,
});

const fetchListError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  error,
  isFetching: false,
});

const fetchListSuccess = (state = INITIAL_STATE, { list, dates }) => {
  return {
    ...state,
    list,
    dates,
    positionList: getPositionList(flatClinicalNotes(list)),
    error: null,
    isFetching: false,
  };
};

const fetchListExtraStart = (state = INITIAL_STATE, { date }) => ({
  ...state,
  isFetchingExtra: date,
});

const fetchListExtraSuccess = (state = INITIAL_STATE, { list }) => {
  const newList = { ...state.list };

  list.forEach((n) => {
    newList[n.date.substr(0, 10)].push(n);
  });

  return {
    ...state,
    list: newList,
    positionList: getPositionList(flatClinicalNotes(newList)),
    error: null,
    isFetchingExtra: false,
  };
};

const select = (state = INITIAL_STATE, { clinicalNote }) => ({
  ...state,
  single: clinicalNote,
});

const update = (state = INITIAL_STATE, { clinicalNote }) => {
  const list = flatClinicalNotes({ ...state.list });

  const index = list.findIndex((item) => item.id === clinicalNote.id);
  if (index !== -1) {
    list[index] = { ...list[index], ...clinicalNote };
  }

  const groups = {};
  Object.keys(state.dates).forEach((k) => {
    groups[k] = [];
  });

  list.forEach((n) => {
    groups[n.date.substr(0, 10)].push(n);
  });

  return {
    ...state,
    list: groups,
    single: {
      ...state.single,
      ...clinicalNote,
    },
  };
};

const saveStart = (state = INITIAL_STATE) => ({
  ...state,
  save: {
    ...state.save,
    isSaving: true,
  },
});

const saveError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  save: {
    ...state.save,
    error,
    isSaving: false,
  },
});

const saveReset = (state = INITIAL_STATE) => ({
  ...state,
  save: {
    ...INITIAL_STATE.save,
  },
});

const saveSuccess = (state = INITIAL_STATE) => ({
  ...state,
  save: {
    ...state.save,
    error: null,
    success: true,
    isSaving: false,
  },
});

const HANDLERS = {
  [Types.CLINICAL_NOTES_FETCH_LIST_START]: fetchListStart,
  [Types.CLINICAL_NOTES_FETCH_LIST_ERROR]: fetchListError,
  [Types.CLINICAL_NOTES_FETCH_LIST_SUCCESS]: fetchListSuccess,
  [Types.CLINICAL_NOTES_FETCH_LIST_EXTRA_START]: fetchListExtraStart,
  [Types.CLINICAL_NOTES_FETCH_LIST_EXTRA_SUCCESS]: fetchListExtraSuccess,

  [Types.CLINICAL_NOTES_SELECT]: select,
  [Types.CLINICAL_NOTES_UPDATE]: update,

  [Types.CLINICAL_NOTES_SAVE_START]: saveStart,
  [Types.CLINICAL_NOTES_SAVE_SUCCESS]: saveSuccess,
  [Types.CLINICAL_NOTES_SAVE_RESET]: saveReset,
  [Types.CLINICAL_NOTES_SAVE_ERROR]: saveError,
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

export default reducer;
