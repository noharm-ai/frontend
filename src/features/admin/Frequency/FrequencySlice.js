import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/admin/api";

const initialState = {
  list: [],
  status: "idle",
  error: null,
};

export const fetchFrequencies = createAsyncThunk(
  "admin-frequency/fetch",
  async (params, thunkAPI) => {
    try {
      const response = await api.getFrequencyList(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const updateDailyFrequency = createAsyncThunk(
  "serverActions/update-daily-freq",
  async (params, thunkAPI) => {
    try {
      const response = await api.updateDailyFrequency(
        null,
        params.id,
        params.value
      );

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const frequencySlice = createSlice({
  name: "adminFrequency",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchFrequencies.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchFrequencies.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data.data;
      })
      .addCase(fetchFrequencies.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { reset } = frequencySlice.actions;

export default frequencySlice.reducer;
