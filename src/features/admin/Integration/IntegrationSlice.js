import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/admin/api";

const initialState = {
  refreshAgg: {
    status: "idle",
    error: null,
  },
  refreshPrescription: {
    status: "idle",
    error: null,
  },
  prescalc: {
    status: "idle",
    error: null,
  },
};

export const refreshAgg = createAsyncThunk(
  "admin-integration/refresh-agg",
  async (params, thunkAPI) => {
    try {
      const response = await api.refreshAggPrescription(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const refreshPrescription = createAsyncThunk(
  "admin-integration/refresh-prescription",
  async (params, thunkAPI) => {
    try {
      const response = await api.refreshPrescription(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const prescalc = createAsyncThunk(
  "admin-integration/prescalc",
  async (params, thunkAPI) => {
    try {
      const response = await api.integration.prescalc(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const integrationSlice = createSlice({
  name: "integration",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(refreshAgg.pending, (state, action) => {
        state.refreshAgg.status = "loading";
      })
      .addCase(refreshAgg.fulfilled, (state, action) => {
        state.refreshAgg.status = "succeeded";
      })
      .addCase(refreshAgg.rejected, (state, action) => {
        state.refreshAgg.status = "failed";
      })
      .addCase(refreshPrescription.pending, (state, action) => {
        state.refreshPrescription.status = "loading";
      })
      .addCase(refreshPrescription.fulfilled, (state, action) => {
        state.refreshPrescription.status = "succeeded";
      })
      .addCase(refreshPrescription.rejected, (state, action) => {
        state.refreshPrescription.status = "failed";
      })
      .addCase(prescalc.pending, (state, action) => {
        state.prescalc.status = "loading";
      })
      .addCase(prescalc.fulfilled, (state, action) => {
        state.prescalc.status = "succeeded";
      })
      .addCase(prescalc.rejected, (state, action) => {
        state.prescalc.status = "failed";
      });
  },
});

export const { reset } = integrationSlice.actions;

export default integrationSlice.reducer;
