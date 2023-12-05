import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/reports/api";
import { getUniqList } from "./transformers";

const initialState = {
  status: "idle",
  error: null,
  list: [],
  updatedAt: null,
  responsibles: [],
  departments: [],
  filtered: {
    status: "idle",
    error: null,
    result: {},
  },
  filters: {},
};

export const fetchPrescriptions = createAsyncThunk(
  "reports-general/fetch-prescriptions",
  async (params, thunkAPI) => {
    try {
      const response = await api.getGeneralPrescription(params);
      const cacheResponseStream = await fetch(response.data.data.url);

      const cacheReadableStream = cacheResponseStream.body.pipeThrough(
        new window.DecompressionStream("gzip")
      );

      const decompressedResponse = new Response(cacheReadableStream);
      const cache = await decompressedResponse.json();

      return { ...response, cacheData: cache };
    } catch (err) {
      console.error(err);
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
    setFilters(state, action) {
      state.filters = action.payload;
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
        state.list = action.payload.cacheData;
        state.updatedAt = action.payload.data.data.updatedAt;
        state.responsibles = getUniqList(
          action.payload.cacheData,
          "responsible"
        );
        state.departments = getUniqList(action.payload.cacheData, "department");
      })
      .addCase(fetchPrescriptions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        state.list = [];
      });
  },
});

export const { reset, setFilteredStatus, setFilteredResult, setFilters } =
  generalReportSlice.actions;

export default generalReportSlice.reducer;
