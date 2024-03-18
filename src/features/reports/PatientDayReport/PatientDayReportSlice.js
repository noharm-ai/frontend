import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/reports/api";
import { getUniqList } from "utils/report";

const initialState = {
  status: "idle",
  error: null,
  list: [],
  updatedAt: null,
  version: null,
  responsibles: [],
  departments: [],
  segments: [],
  filtered: {
    status: "idle",
    error: null,
    result: {},
  },
  filters: {},
  helpModal: false,
};

export const fetchReportData = createAsyncThunk(
  "reports-patient-day/fetch-data",
  async (params, thunkAPI) => {
    try {
      const response = await api.getPatientDay(params);
      const cacheResponseStream = await fetch(response.data.data.url);

      const gzipped = await cacheResponseStream.clone().blob();

      const cacheReadableStream = cacheResponseStream.body.pipeThrough(
        new window.DecompressionStream("gzip")
      );

      const decompressedResponse = new Response(cacheReadableStream);
      const cache = await decompressedResponse.json();

      return { ...response, cacheData: cache, gzipped };
    } catch (err) {
      console.error(err);
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const patientDayReportSlice = createSlice({
  name: "patientDayReport",
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
    setHelpModal(state, action) {
      state.helpModal = action.payload;
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
        state.list = action.payload.gzipped;
        state.updatedAt = action.payload.cacheData.header.date;
        state.version = action.payload.cacheData.header.version;
        state.responsibles = getUniqList(
          action.payload.cacheData.body,
          "responsible"
        );
        state.departments = getUniqList(
          action.payload.cacheData.body,
          "department"
        );
        state.segments = getUniqList(action.payload.cacheData.body, "segment");
      })
      .addCase(fetchReportData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        state.list = [];
      });
  },
});

export const {
  reset,
  setFilteredStatus,
  setFilteredResult,
  setFilters,
  setHelpModal,
} = patientDayReportSlice.actions;

export default patientDayReportSlice.reducer;
