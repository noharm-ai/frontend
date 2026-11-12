import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";

import api from "services/api";
import { PREFERENCES_TYPE } from "utils/memory";

export interface IPreferencesSlice {
  prescription: {
    listType: string;
    listOrder: string;
    drugOrder: string;
  };
  app: {
    initialPage: string;
    highContrast: boolean;
  };
}

// the part of the root state the thunk reads; `_persist` is added by
// redux-persist and must not be saved with the preferences
interface IPreferencesThunkState {
  preferences: IPreferencesSlice & { _persist?: unknown };
  user: { account: { userId: number | string } };
}

const initialState: IPreferencesSlice = {
  prescription: {
    listType: "default",
    listOrder: "asc",
    drugOrder: "DRUG_NAME",
  },
  app: {
    initialPage: "/priorizacao/pacientes/cards",
    highContrast: false,
  },
};

export const savePreferences = createAsyncThunk(
  "preferences/save",
  async (_params: void, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as IPreferencesThunkState;
      const preferences = state.preferences;
      const userId = state.user.account.userId;
      delete preferences._persist;

      const payload = {
        type: `${PREFERENCES_TYPE}-${userId}`,
        value: preferences,
      };

      const response = await api.putMemoryUnique(null, payload);

      return response.data;
    } catch (err) {
      // axios error; the backend error payload is not typed
      const { response } = err as { response: { data: unknown } };
      return thunkAPI.rejectWithValue(response.data);
    }
  },
);

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setPrescriptionListType(state, action: PayloadAction<string>) {
      state.prescription.listType = action.payload;
    },
    setPrescriptionListOrder(state, action: PayloadAction<string>) {
      state.prescription.listOrder = action.payload;
    },
    setPrescriptionDrugOrder(state, action: PayloadAction<string>) {
      state.prescription.drugOrder = action.payload;
    },
    setInitialPage(state, action: PayloadAction<string>) {
      state.app.initialPage = action.payload;
    },
    setHighContrast(state, action: PayloadAction<boolean>) {
      state.app.highContrast = action.payload;
    },
    setSavedPreferences(
      _state,
      action: PayloadAction<Partial<IPreferencesSlice> | null | undefined>,
    ) {
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

export const {
  reset,
  setSavedPreferences,
  setPrescriptionListType,
  setPrescriptionListOrder,
  setPrescriptionDrugOrder,
  setInitialPage,
  setHighContrast,
} = preferencesSlice.actions;

const persist = {
  storage,
  key: "preferences",
  stateReconciler: autoMergeLevel2,
};

export default persistReducer<IPreferencesSlice>(
  persist,
  preferencesSlice.reducer,
);
