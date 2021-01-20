import { createActions, createReducer } from 'reduxsauce';

export const { Types, Creators } = createActions({
  clinicalNotesFetchListStart: [''],
  clinicalNotesFetchListError: ['error'],
  clinicalNotesFetchListSuccess: ['list'],

  clinicalNotesSelect: ['clinicalNote']
});

const INITIAL_STATE = {
  error: null,
  isFetching: true,
  list: [],
  single: null
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

const select = (state = INITIAL_STATE, { clinicalNote }) => ({
  ...state,
  single: clinicalNote
});

const HANDLERS = {
  [Types.CLINICAL_NOTES_FETCH_LIST_START]: fetchListStart,
  [Types.CLINICAL_NOTES_FETCH_LIST_ERROR]: fetchListError,
  [Types.CLINICAL_NOTES_FETCH_LIST_SUCCESS]: fetchListSuccess,

  [Types.CLINICAL_NOTES_SELECT]: select
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

export default reducer;
