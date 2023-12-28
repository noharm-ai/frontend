import { createSlice } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";

const initialState = {
  prescription: {
    listType: "default",
  },
};

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setPrescriptionListType(state, action) {
      state.prescription.listType = action.payload;
    },
    reset() {
      return initialState;
    },
  },
});

export const { reset, setPrescriptionListType } = preferencesSlice.actions;

const persist = {
  storage,
  key: "preferences",
  stateReconciler: autoMergeLevel2,
};

export default persistReducer(persist, preferencesSlice.reducer);
