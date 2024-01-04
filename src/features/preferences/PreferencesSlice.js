import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";

import api from "services/api";
import { PREFERENCES_TYPE } from "utils/memory";

const initialState = {
  prescription: {
    listType: "default",
  },
};

export const savePreferences = createAsyncThunk(
  "preferences/save",
  async (params, thunkAPI) => {
    try {
      const preferences = thunkAPI.getState().preferences;
      const userId = thunkAPI.getState().user.account.userId;
      delete preferences._persist;

      const payload = {
        type: `${PREFERENCES_TYPE}-${userId}`,
        value: preferences,
      };

      const response = await api.putMemoryUnique(null, payload);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setPrescriptionListType(state, action) {
      state.prescription.listType = action.payload;
    },
    setSavedPreferences(state, action) {
      return {
        ...initialState,
        ...action.payload,
      };
    },
    reset() {
      return initialState;
    },
  },
});

export const { reset, setSavedPreferences, setPrescriptionListType } =
  preferencesSlice.actions;

const persist = {
  storage,
  key: "preferences",
  stateReconciler: autoMergeLevel2,
};

export default persistReducer(persist, preferencesSlice.reducer);
