import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/api";
import adminAPI from "services/admin/api";

const initialState = {
  putMemory: {
    status: "idle",
    error: null,
  },
  shouldUpdatePrescription: {
    status: "idle",
    error: null,
  },
};

export const shouldUpdatePrescription = createAsyncThunk(
  "serverActions/should-update-presc",
  async (params, thunkAPI) => {
    try {
      const response = await api.shouldUpdatePrescription(
        null,
        params.idPrescription
      );

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const putMemory = createAsyncThunk(
  "serverActions/put-memory",
  async (params, thunkAPI) => {
    try {
      const response = await api.putMemory(null, params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const getUserResetToken = createAsyncThunk(
  "serverActions/user-reset-token",
  async (params, thunkAPI) => {
    try {
      const response = await adminAPI.user.getResetToken(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const getUserLastClinicalNotes = createAsyncThunk(
  "serverActions/get-last-clinical-notes",
  async (params, thunkAPI) => {
    try {
      const response = await api.clinicalNotes.getUserLast(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const serverActionsSlice = createSlice({
  name: "serverActions",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(putMemory.pending, (state, action) => {
        state.putMemory.status = "loading";
      })
      .addCase(putMemory.fulfilled, (state, action) => {
        state.putMemory.status = "succeeded";
      })
      .addCase(putMemory.rejected, (state, action) => {
        state.putMemory.status = "failed";
      })
      .addCase(shouldUpdatePrescription.pending, (state, action) => {
        state.shouldUpdatePrescription.status = "loading";
      })
      .addCase(shouldUpdatePrescription.fulfilled, (state, action) => {
        state.shouldUpdatePrescription.status = "succeeded";
      })
      .addCase(shouldUpdatePrescription.rejected, (state, action) => {
        state.shouldUpdatePrescription.status = "failed";
      });
  },
});

export const { reset } = serverActionsSlice.actions;

export default serverActionsSlice.reducer;
