import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/reports/api";
import { getUniqList, getUniqDepartments } from "utils/report";
import ReportEnum from "models/ReportEnum";

const initialState = {
  status: "idle",
  error: null,
  list: [],
  updatedAt: null,
  version: null,
  date: null,
  dateRange: null,
  responsibles: [],
  departments: [],
  segments: [],
  originDrugs: [],
  destinyDrugs: [],
  reasons: [],
  insurances: [],
  tags: [],
  originSubstances: [],
  originSubstanceClasses: [],
  originSubstanceClassParents: [],
  filtered: {
    status: "idle",
    error: null,
    result: {
      list: [],
    },
  },
  filters: {},
  helpModal: false,
  historyModal: false,
  availableReports: [],
  activeReport: "current",
};

export const fetchReportData = createAsyncThunk(
  "reports-economy/fetch-data",
  async (params, thunkAPI) => {
    try {
      const response = await api.getReport(ReportEnum.ECONOMY, params);
      if (!response.data.data.cached) {
        return { ...response, cacheData: [], gzipped: {} };
      }

      const cacheResponseStream = await fetch(response.data.data.url);

      const gzipped = await cacheResponseStream.clone().blob();

      const cacheReadableStream = cacheResponseStream.body.pipeThrough(
        new window.DecompressionStream("gzip")
      );

      const decompressedResponse = new Response(cacheReadableStream);
      const cache = await decompressedResponse.json();

      return {
        ...response,
        cacheData: cache,
        gzipped,
        availableReports: response.data.data.availableReports,
      };
    } catch (err) {
      console.error(err);
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const economyReportSlice = createSlice({
  name: "economyReport",
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
    setHistoryModal(state, action) {
      state.historyModal = action.payload;
    },
    setActiveReport(state, action) {
      state.activeReport = action.payload;
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

        if (action.payload.data.data.cached) {
          state.list = action.payload.gzipped;
          state.updatedAt =
            action.payload.cacheData.header.updatedAt ??
            action.payload.cacheData.header.date;
          state.version = action.payload.cacheData.header.version;
          state.date = action.payload.cacheData.header.date;
          state.dateRange = action.payload.cacheData.header.dateRange ?? 360;
          state.availableReports = action.payload.availableReports;
          state.responsibles = getUniqList(
            action.payload.cacheData.body,
            "responsible"
          );
          state.departments = getUniqDepartments(
            action.payload.cacheData.body,
            "department",
            "segment"
          );
          state.segments = getUniqList(
            action.payload.cacheData.body,
            "segment"
          );
          state.originDrugs = getUniqList(
            action.payload.cacheData.body,
            "originDrug"
          );
          state.destinyDrugs = getUniqList(
            action.payload.cacheData.body,
            "destinyDrug"
          );
          state.reasons = getUniqList(
            action.payload.cacheData.body,
            "interventionReasonArray"
          );
          state.insurances = getUniqList(
            action.payload.cacheData.body,
            "insurance"
          );

          //added in new versions
          if (
            action.payload.cacheData.body &&
            action.payload.cacheData.body.length > 0
          ) {
            const firstRecord = action.payload.cacheData.body[0];

            if (firstRecord.hasOwnProperty("tags")) {
              state.tags = getUniqList(action.payload.cacheData.body, "tags");
            }

            if (firstRecord.hasOwnProperty("originSubstance")) {
              state.originSubstances = getUniqList(
                action.payload.cacheData.body,
                "originSubstance"
              );
            }

            if (firstRecord.hasOwnProperty("originSubstanceClass")) {
              state.originSubstanceClasses = getUniqList(
                action.payload.cacheData.body,
                "originSubstanceClass"
              );
            }

            if (firstRecord.hasOwnProperty("originSubstanceClassParent")) {
              state.originSubstanceClassParents = getUniqList(
                action.payload.cacheData.body,
                "originSubstanceClassParent"
              );
            }
          }
        }
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
  setHistoryModal,
  setActiveReport,
} = economyReportSlice.actions;

export default economyReportSlice.reducer;
