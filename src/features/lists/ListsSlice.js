import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/api";

const initialState = {
  status: "idle",
  error: null,
  substanceClasses: {
    list: [],
    status: "idle",
    error: null,
  },
};

export const fetchSubstanceClasses = createAsyncThunk(
  "lists/substance-classes",
  async (params, thunkAPI) => {
    const { access_token } = thunkAPI.getState().auth.identify;

    try {
      const response = await api.getSubstanceClasses(access_token, {});

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const listsSlice = createSlice({
  name: "lists",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchSubstanceClasses.pending, (state, action) => {
        state.substanceClasses.status = "loading";
      })
      .addCase(fetchSubstanceClasses.fulfilled, (state, action) => {
        state.substanceClasses.status = "succeeded";
        state.substanceClasses.list = action.payload.data;
      })
      .addCase(fetchSubstanceClasses.rejected, (state, action) => {
        state.substanceClasses.status = "failed";
        state.substanceClasses.error = action.error.message;
      });
  },
});

export default listsSlice.reducer;
