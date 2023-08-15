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
  searchPrescriptions: {
    list: [],
    status: "idle",
    error: null,
  },
};

export const searchPrescriptions = createAsyncThunk(
  "lists/search-prescriptions",
  async (params, thunkAPI) => {
    const { access_token } = thunkAPI.getState().auth.identify;

    try {
      const response = await api.searchPrescriptions(access_token, params.term);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

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
      })
      .addCase(searchPrescriptions.pending, (state, action) => {
        state.searchPrescriptions.status = "loading";
      })
      .addCase(searchPrescriptions.fulfilled, (state, action) => {
        state.searchPrescriptions.status = "succeeded";
        state.searchPrescriptions.list = action.payload.data;
      })
      .addCase(searchPrescriptions.rejected, (state, action) => {
        state.searchPrescriptions.status = "failed";
        state.searchPrescriptions.error = action.error.message;
      });
  },
});

export default listsSlice.reducer;
