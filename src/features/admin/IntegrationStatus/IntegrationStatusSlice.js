import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/admin/api";

const initialState = {
  status: "idle",
  error: null,
  data: {},
};

export const fetchStatus = createAsyncThunk(
  "admin-integration-status/fetch",
  async (params, thunkAPI) => {
    try {
      const response = await api.integration.getStatus(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const integrationStatusSlice = createSlice({
  name: "integrationStatus",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchStatus.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data.data;
      })
      .addCase(fetchStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { reset } = integrationStatusSlice.actions;

export default integrationStatusSlice.reducer;
