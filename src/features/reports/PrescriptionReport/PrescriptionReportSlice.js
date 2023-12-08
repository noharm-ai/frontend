import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/reports/api";
import { getUniqList } from "utils/report";

const initialState = {
  status: "idle",
  error: null,
  list: [],
  updatedAt: null,
  responsibles: [],
  departments: [],
  segments: [],
  filtered: {
    status: "idle",
    error: null,
    result: {},
  },
  filters: {},
};

export const fetchReportData = createAsyncThunk(
  "reports-prescription/fetch-data",
  async (params, thunkAPI) => {
    try {
      const response = await api.getPrescription(params);
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

const prescriptionReportSlice = createSlice({
  name: "prescriptionReport",
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
      .addCase(fetchReportData.pending, (state, action) => {
        state.status = "loading";
        state.filtered.status = "loading";
      })
      .addCase(fetchReportData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.cacheData;
        state.updatedAt = action.payload.data.data.updatedAt;
        state.responsibles = getUniqList(
          action.payload.cacheData,
          "responsible"
        );
        state.departments = getUniqList(action.payload.cacheData, "department");
        state.segments = getUniqList(action.payload.cacheData, "segment");
      })
      .addCase(fetchReportData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        state.list = [];
      });
  },
});

export const { reset, setFilteredStatus, setFilteredResult, setFilters } =
  prescriptionReportSlice.actions;

export default prescriptionReportSlice.reducer;
