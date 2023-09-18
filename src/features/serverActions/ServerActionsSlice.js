import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

//import api from "services/api";
import adminApi from "services/admin/api";

const initialState = {
  updateDailyFrequency: {
    status: "idle",
    error: null,
  },
};

export const updateDailyFrequency = createAsyncThunk(
  "serverActions/update-daily-freq",
  async (params, thunkAPI) => {
    try {
      const response = await adminApi.updateDailyFrequency(
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

const serverActionsSlice = createSlice({
  name: "serverActions",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(updateDailyFrequency.pending, (state, action) => {
        state.updateDailyFrequency.status = "loading";
      })
      .addCase(updateDailyFrequency.fulfilled, (state, action) => {
        state.updateDailyFrequency.status = "succeeded";
      })
      .addCase(updateDailyFrequency.rejected, (state, action) => {
        state.updateDailyFrequency.status = "failed";
      });
  },
});

export default serverActionsSlice.reducer;
