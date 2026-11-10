import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";

interface IPatientCacheItem {
  idPatient?: number | string;
  cache?: boolean;
  [key: string]: unknown;
}

interface IPatientsState {
  message: string;
  error: unknown;
  isFetching: boolean;
  list: Record<string, IPatientCacheItem>;
  save: {
    isSaving: boolean;
    success: boolean;
    error: unknown;
  };
}

const initialState: IPatientsState = {
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

const patientsSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {
    patientsFetchListStart(state) {
      state.isFetching = true;
    },
    patientsFetchListError(state, action: PayloadAction<unknown>) {
      state.error = action.payload;
      state.isFetching = false;
    },
    patientsFetchListSuccess(
      state,
      action: PayloadAction<Record<string, IPatientCacheItem>>,
    ) {
      const list = action.payload;
      const cachedList: Record<string, IPatientCacheItem> = {};
      Object.keys(list).forEach((i) => {
        if (list[i].cache) {
          cachedList[i] = list[i];
        }
      });

      state.list = cachedList;
      state.error = null;
      state.isFetching = false;
    },
    patientsSetName(
      state,
      action: PayloadAction<IPatientCacheItem & { idPatient: number | string }>,
    ) {
      state.list[action.payload.idPatient] = { ...action.payload };
      state.error = null;
      state.isFetching = false;
    },
    patientsCleanCache(state) {
      state.list = {};
    },
    patientsSaveSingleStart(state) {
      state.save.isSaving = true;
    },
    patientsSaveSingleError(state, action: PayloadAction<unknown>) {
      state.save.error = action.payload;
      state.save.isSaving = false;
    },
    patientsSaveSingleSuccess(state) {
      state.save.error = null;
      state.save.success = true;
      state.save.isSaving = false;
    },
    patientsSaveSingleReset(state) {
      state.save = { ...initialState.save };
    },
  },
});

export const {
  patientsFetchListStart,
  patientsFetchListError,
  patientsFetchListSuccess,
  patientsSetName,
  patientsCleanCache,
  patientsSaveSingleStart,
  patientsSaveSingleError,
  patientsSaveSingleSuccess,
  patientsSaveSingleReset,
} = patientsSlice.actions;

const persist = {
  key: "patients",
  storage,
  blacklist: ["message", "error", "isFetching", "save"],
  stateReconciler: autoMergeLevel2,
};

export const patientsReducer = persistReducer<IPatientsState>(
  persist,
  patientsSlice.reducer,
);
