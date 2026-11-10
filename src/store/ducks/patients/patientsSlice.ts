import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { removeStorageItem } from "utils/storage";

interface IPatientsState {
  save: {
    isSaving: boolean;
    success: boolean;
    error: unknown;
  };
}

const initialState: IPatientsState = {
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
  },
});

export const {
  patientsSaveSingleStart,
  patientsSaveSingleError,
  patientsSaveSingleSuccess,
} = patientsSlice.actions;

export const patientsReducer = patientsSlice.reducer;

/**
 * This slice used to persist a patient name cache under "persist:patients".
 * Names now live in utils/patientCache, so drop the leftover key that older
 * versions may have written.
 */
export function removeLegacyPatientsPersist(): void {
  removeStorageItem("persist:patients");
}
