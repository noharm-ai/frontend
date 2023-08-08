import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/api";

const initialState = {
  data: {},
  blocks: [],
  status: "idle",
  error: null,
};

export const fetchSummary = createAsyncThunk(
  "summary/fetch",
  async (params, thunkAPI) => {
    const { access_token } = thunkAPI.getState().auth.identify;

    const response = await api.getSummary(
      access_token,
      params.admissionNumber,
      params.mock
    );
    return response.data;
  }
);

const summarySlice = createSlice({
  name: "summary",
  initialState,
  reducers: {
    setBlock(state, action) {
      state.blocks[action.payload.id] = action.payload.data;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchSummary.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
      })
      .addCase(fetchSummary.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default summarySlice.reducer;

export const { setBlock } = summarySlice.actions;
