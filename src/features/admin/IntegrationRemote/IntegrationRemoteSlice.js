import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/admin/api";

const initialState = {
  list: [],
  status: "idle",
  error: null,
};

export const fetchTemplate = createAsyncThunk(
  "integration-remote/fetch-template",
  async (params, thunkAPI) => {
    try {
      const response = await api.integration.getTemplate(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const integrationRemoteSlice = createSlice({
  name: "integrationRemote",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchTemplate.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchTemplate.fulfilled, (state, action) => {
        state.status = "succeeded";
      })
      .addCase(fetchTemplate.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { reset, setIntegration } = integrationRemoteSlice.actions;

export default integrationRemoteSlice.reducer;
