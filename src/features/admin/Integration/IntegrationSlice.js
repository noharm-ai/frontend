import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/admin/api";

const initialState = {
  refreshAgg: {
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
      });
  },
});

export const { reset } = integrationSlice.actions;

export default integrationSlice.reducer;
