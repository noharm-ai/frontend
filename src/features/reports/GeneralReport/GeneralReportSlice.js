import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/reports/api";
import { getUniqList } from "./transformers";

const initialState = {
  status: "idle",
  error: null,
  list: [],
  responsibles: [],
  departments: [],
  filtered: {
    status: "idle",
    error: null,
    result: {},
  },
};

export const fetchPrescriptions = createAsyncThunk(
  "reports-general/fetch-prescriptions",
  async (params, thunkAPI) => {
    try {
      const response = await api.getGeneralPrescription(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const generalReportSlice = createSlice({
  name: "generalReport",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setFilteredStatus(state, action) {
      state.filtered.status = action.payload;
    },
    setFilteredResult(state, action) {
      state.filtered.result = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchPrescriptions.pending, (state, action) => {
        state.status = "loading";
        state.filtered.status = "loading";
      })
      .addCase(fetchPrescriptions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data.data;
        state.responsibles = getUniqList(
          action.payload.data.data,
          "responsible"
        );
        state.departments = getUniqList(action.payload.data.data, "department");
      })
      .addCase(fetchPrescriptions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        state.list = [];
      });
  },
});

export const { reset, setFilteredStatus, setFilteredResult } =
  generalReportSlice.actions;

export default generalReportSlice.reducer;
