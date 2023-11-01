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
  initInterventionReason: {
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

export const initInterventionReason = createAsyncThunk(
  "admin-integration/init-intervention-reason",
  async (params, thunkAPI) => {
    try {
      const response = await api.initInterventionReason(params);

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
      .addCase(initInterventionReason.pending, (state, action) => {
        state.initInterventionReason.status = "loading";
      })
      .addCase(initInterventionReason.fulfilled, (state, action) => {
        state.initInterventionReason.status = "succeeded";
      })
      .addCase(initInterventionReason.rejected, (state, action) => {
        state.initInterventionReason.status = "failed";
      })
      .addCase(refreshPrescription.pending, (state, action) => {
        state.refreshPrescription.status = "loading";
      })
      .addCase(refreshPrescription.fulfilled, (state, action) => {
        state.refreshPrescription.status = "succeeded";
      })
      .addCase(refreshPrescription.rejected, (state, action) => {
        state.refreshPrescription.status = "failed";
      });
  },
});

export const { reset } = integrationSlice.actions;

export default integrationSlice.reducer;
