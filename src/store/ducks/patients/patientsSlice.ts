import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "services/api";
import { errorHandler } from "utils/index";
import { removeStorageItem } from "utils/storage";

interface IPatientsState {
  save: {
    isSaving: boolean;
    success: boolean;
    error: unknown;
  };
}

interface ISavePatientParams {
  admissionNumber: string | number;
  [key: string]: unknown;
}

const initialState: IPatientsState = {
  save: {
    isSaving: false,
    success: false,
    error: null,
  },
};

export const savePatientThunk = createAsyncThunk<
  unknown,
  ISavePatientParams,
  {
    state: { auth: { identify: { access_token?: string } } };
    rejectValue: unknown;
  }
>("patients/save", async ({ admissionNumber, ...params }, thunkAPI) => {
  const { access_token } = thunkAPI.getState().auth.identify;

  // errorHandler (JS) resolves to { status, error } on failure
  const { status, data, error } = (await api
    .updatePatient(access_token, admissionNumber, params)
    .catch(errorHandler)) as {
    status?: number;
    data?: unknown;
    error?: unknown;
  };

  if (status !== 200) {
    return thunkAPI.rejectWithValue(error);
  }

  return data;
});

const patientsSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(savePatientThunk.pending, (state) => {
        state.save.isSaving = true;
      })
      .addCase(savePatientThunk.fulfilled, (state) => {
        state.save.error = null;
        state.save.success = true;
        state.save.isSaving = false;
      })
      .addCase(savePatientThunk.rejected, (state, action) => {
        state.save.error = action.payload;
        state.save.isSaving = false;
      });
  },
});

export const patientsReducer = patientsSlice.reducer;

/**
 * This slice used to persist a patient name cache under "persist:patients".
 * Names now live in utils/patientCache, so drop the leftover key that older
 * versions may have written.
 */
export function removeLegacyPatientsPersist(): void {
  removeStorageItem("persist:patients");
}
