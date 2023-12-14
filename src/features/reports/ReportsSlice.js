import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/reports/api";

const initialState = {
  config: {
    status: "idle",
    error: null,
    internal: [],
    external: [],
  },
};

export const getConfig = createAsyncThunk(
  "reports/config",
  async (params, thunkAPI) => {
    try {
      const response = await api.getConfig(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getConfig.pending, (state, action) => {
        state.config.status = "loading";
      })
      .addCase(getConfig.fulfilled, (state, action) => {
        console.log("reports", action.payload);
        state.config.status = "succeeded";
        state.config.internal = action.payload.data.internal;
        state.config.external = action.payload.data.external;
      })
      .addCase(getConfig.rejected, (state, action) => {
        state.config.status = "failed";
      });
  },
});

export const { reset } = reportsSlice.actions;

export default reportsSlice.reducer;
