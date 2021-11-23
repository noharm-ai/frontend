import { createActions, createReducer } from 'reduxsauce';

export const { Types, Creators } = createActions({
  usersFetchListStart: [''],
  usersFetchListError: ['error'],
  usersFetchListSuccess: ['list'],

  usersFetchSingleStart: [''],
  usersFetchSingleError: ['error'],
  usersFetchSingleSuccess: ['content'],
  usersFetchSingleReset: [''],

  usersSaveSingleStart: [''],
  usersSaveSingleSuccess: [''],
  usersSaveSingleReset: [''],
  usersSaveSingleError: ['error'],

  usersUserSelect: ['item'],
  usersUserAdd: ['user'],
  usersUserSuccess: ['item'],
});

const INITIAL_STATE = {
  error: null,
  isFetching: true,
  list: [],
  save: {
    isSaving: false,
    success: false,
    error: null
  },
  single: {
    error: null,
    isFetching: false,
    content: {} //usuario selecionado p/ editar
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

const fetchSingleStart = (state = INITIAL_STATE) => ({
  ...state,
  single: {
    ...state.single,
    isFetching: true
  }
});

const fetchSingleError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  single: {
    ...state.single,
    error,
    isFetching: false
  }
});

const fetchSingleSuccess = (state = INITIAL_STATE, { content }) => ({
  ...state,
  //firstFilter,
  single: {
    ...state.single,
    content,
    error: null,
    isFetching: false
  }
});

const fetchSingleReset = (state = INITIAL_STATE) => ({
  ...state,
  single: {
    ...INITIAL_STATE.single
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
  },
  single: {
    ...INITIAL_STATE.single
  }
});


const saveSingleSuccess = (state = INITIAL_STATE) => ({
  ...state,
  save: {
    ...state.save,
    error: null,
    success: true,
    isSaving: false
  }
});


const userSelect = (state = INITIAL_STATE, { item }) => ({
  ...state,
  single: {
    ...state.single,
    content: item
  }
});

const userAdd = (state = INITIAL_STATE, { user }) => ({
  ...state,
  list: [
    ...state.list,
    user
  ]
});


const userSuccess = (state = INITIAL_STATE, { item }) => {
  const list = [...state.list];
  const index = list.findIndex(e => item.id === e.id);

  if (index !== -1) {
    list[index] = { ...list[index], ...item };
  } else {
    list.push({ ...item, new: false });
  }

  return {
    ...state,
    list,
    single: {
      ...state.single,
      content: {
      }
    },
    save: {
      ...state.save,
      error: null,
      success: true,
      isSaving: false
    }
  };
};

const HANDLERS = {
  [Types.USERS_FETCH_LIST_START]: fetchListStart,
  [Types.USERS_FETCH_LIST_ERROR]: fetchListError,
  [Types.USERS_FETCH_LIST_SUCCESS]: fetchListSuccess,

  [Types.USERS_FETCH_SINGLE_START]: fetchSingleStart,
  [Types.USERS_FETCH_SINGLE_ERROR]: fetchSingleError,
  [Types.USERS_FETCH_SINGLE_SUCCESS]: fetchSingleSuccess,
  [Types.USERS_FETCH_SINGLE_RESET]: fetchSingleReset,

  [Types.USERS_SAVE_SINGLE_START]: saveSingleStart,
  [Types.USERS_SAVE_SINGLE_ERROR]: saveSingleError,
  [Types.USERS_SAVE_SINGLE_RESET]: saveSingleReset,
  [Types.USERS_SAVE_SINGLE_SUCCESS]: saveSingleSuccess,


  [Types.USERS_USER_SELECT]: userSelect,
  [Types.USERS_USER_ADD]: userAdd,
  [Types.USERS_USER_SUCCESS]: userSuccess,
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

export default reducer;
