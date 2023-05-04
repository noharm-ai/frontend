import { createActions, createReducer } from "reduxsauce";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";

export const { Types, Creators } = createActions({
  patientsFetchListStart: [""],
  patientsFetchListError: ["error"],
  patientsFetchListSuccess: ["list"],

  patientsSetName: ["data"],

  patientsCleanCache: [""],

  patientsSaveSingleStart: [""],
  patientsSaveSingleError: ["error"],
  patientsSaveSingleSuccess: [""],
  patientsSaveSingleReset: [""],
});

const INITIAL_STATE = {
  message: "",
  error: null,
  isFetching: false,
  list: {},
  save: {
    isSaving: false,
    success: false,
    error: null,
  },
};

const cleanCache = (state = INITIAL_STATE) => ({
  ...state,
  list: {},
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

const fetchListSuccess = (state = INITIAL_STATE, { list }) => {
  const cachedList = {};
  Object.keys(list).map((i) => {
    if (list[i].cache) {
      cachedList[i] = list[i];
    }
    return false;
  });

  return {
    ...state,
    list: cachedList,
    error: null,
    isFetching: false,
  };
};

const setName = (state = INITIAL_STATE, { data }) => {
  const cachedList = { ...state.list };

  cachedList[data.idPatient] = {
    ...data,
  };

  return {
    ...state,
    list: cachedList,
    error: null,
    isFetching: false,
  };
};

const saveSingleStart = (state = INITIAL_STATE) => ({
  ...state,
  save: {
    ...state.save,
    isSaving: true,
  },
});

const saveSingleError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  save: {
    ...state.save,
    error,
    isSaving: false,
  },
});

const saveSingleSuccess = (state = INITIAL_STATE) => ({
  ...state,
  save: {
    ...state.save,
    error: null,
    success: true,
    isSaving: false,
  },
});

const saveSingleReset = (state = INITIAL_STATE) => ({
  ...state,
  save: {
    ...INITIAL_STATE.save,
  },
});

const HANDLERS = {
  [Types.PATIENTS_FETCH_LIST_START]: fetchListStart,
  [Types.PATIENTS_FETCH_LIST_ERROR]: fetchListError,
  [Types.PATIENTS_FETCH_LIST_SUCCESS]: fetchListSuccess,

  [Types.PATIENTS_SET_NAME]: setName,
  [Types.PATIENTS_CLEAN_CACHE]: cleanCache,

  [Types.PATIENTS_SAVE_SINGLE_START]: saveSingleStart,
  [Types.PATIENTS_SAVE_SINGLE_ERROR]: saveSingleError,
  [Types.PATIENTS_SAVE_SINGLE_SUCCESS]: saveSingleSuccess,
  [Types.PATIENTS_SAVE_SINGLE_RESET]: saveSingleReset,
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

const persist = {
  key: "patients",
  storage,
  blacklist: ["message", "error", "isFetching", "save"],
  stateReconciler: autoMergeLevel2,
};

export default persistReducer(persist, reducer);
