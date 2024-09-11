import { createActions, createReducer } from "reduxsauce";

export const { Types, Creators } = createActions({
  patientCentralFetchListStart: [""],
  patientCentralFetchListError: ["error"],
  patientCentralFetchListSuccess: ["list"],

  patientCentralUpdateNames: ["names"],

  patientCentralReset: [],
});

const INITIAL_STATE = {
  error: null,
  isFetching: true,
  list: [],
  single: null,
};

const reset = () => INITIAL_STATE;

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

const updateNames = (state = INITIAL_STATE, { names }) => {
  const list = [];

  state.list.forEach((item) => {
    if (names[item.idPatient]) {
      list.push({
        ...item,
        namePatient: names[item.idPatient].name,
        loadingName: false,
      });
    } else {
      list.push({ ...item });
    }
  });

  return {
    ...state,
    list,
  };
};

const HANDLERS = {
  [Types.PATIENT_CENTRAL_FETCH_LIST_START]: fetchListStart,
  [Types.PATIENT_CENTRAL_FETCH_LIST_ERROR]: fetchListError,
  [Types.PATIENT_CENTRAL_FETCH_LIST_SUCCESS]: fetchListSuccess,

  [Types.PATIENT_CENTRAL_UPDATE_NAMES]: updateNames,

  [Types.PATIENT_CENTRAL_RESET]: reset,
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

export default reducer;
