import { createActions, createReducer } from "reduxsauce";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";

export const { Types, Creators } = createActions({
  segmentsFetchListStart: [""],
  segmentsFetchListError: ["error"],
  segmentsFetchListSuccess: ["list"],

  segmentsFetchSingleStart: [""],
  segmentsFetchSingleError: ["error"],
  segmentsFetchSingleSuccess: ["content", "firstFilter"],
  segmentsFetchSingleReset: [""],
});

const INITIAL_STATE = {
  error: null,
  isFetching: false,
  list: [],
  firstFilter: {
    idSegment: undefined,
  },
  single: {
    error: null,
    isFetching: false,
    content: {},
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

const fetchListSuccess = (state = INITIAL_STATE, { list }) => ({
  ...state,
  list,
  error: null,
  isFetching: false,
});

const HANDLERS = {
  [Types.SEGMENTS_FETCH_LIST_START]: fetchListStart,
  [Types.SEGMENTS_FETCH_LIST_ERROR]: fetchListError,
  [Types.SEGMENTS_FETCH_LIST_SUCCESS]: fetchListSuccess,
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

const persist = {
  key: "segments",
  storage,
  whitelist: ["list"],
  stateReconciler: autoMergeLevel2,
};

export default persistReducer(persist, reducer);
