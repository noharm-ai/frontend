import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/reports/api";
import { getUniqList, getUniqDepartments } from "utils/report";
import ReportEnum from "models/ReportEnum";
import {
  clearReportDatasource,
  loadReportDatasource,
} from "utils/reportDatasource";

const initialState = {
  status: "idle",
  error: null,
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

const getFilterOptions = (body) => {
  const options = {
    responsibles: getUniqList(body, "responsible"),
    departments: getUniqDepartments(body, "department", "segment"),
    segments: getUniqList(body, "segment"),
    originDrugs: getUniqList(body, "originDrug"),
    destinyDrugs: getUniqList(body, "destinyDrug"),
    reasons: getUniqList(body, "interventionReasonArray"),
    insurances: getUniqList(body, "insurance"),
  };

  //added in new versions
  if (body && body.length > 0) {
    const firstRecord = body[0];

    if (firstRecord.hasOwnProperty("tags")) {
      options.tags = getUniqList(body, "tags");
    }

    if (firstRecord.hasOwnProperty("originSubstance")) {
      options.originSubstances = getUniqList(body, "originSubstance");
    }

    if (firstRecord.hasOwnProperty("originSubstanceClass")) {
      options.originSubstanceClasses = getUniqList(
        body,
        "originSubstanceClass",
      );
    }

    if (firstRecord.hasOwnProperty("originSubstanceClassParent")) {
      options.originSubstanceClassParents = getUniqList(
        body,
        "originSubstanceClassParent",
      );
    }
  }

  return options;
};

export const fetchReportData = createAsyncThunk(
  "reports-economy/fetch-data",
  async (params, thunkAPI) => {
    try {
      const response = await api.getReport(ReportEnum.ECONOMY, params);
      if (!response.data.data.cached) {
        return { cached: false };
      }

      const { header, body } = await loadReportDatasource(
        ReportEnum.ECONOMY,
        response.data.data.url,
      );

      return {
        cached: true,
        header,
        availableReports: response.data.data.availableReports,
        filterOptions: getFilterOptions(body),
      };
    } catch (err) {
      console.error(err);
      clearReportDatasource(ReportEnum.ECONOMY);
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
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

        if (action.payload.cached) {
          const { header } = action.payload;

          state.updatedAt = header.updatedAt ?? header.date;
          state.version = header.version;
          state.date = header.date;
          state.dateRange = header.dateRange ?? 360;
          state.availableReports = action.payload.availableReports;
          Object.assign(state, action.payload.filterOptions);
        }
      })
      .addCase(fetchReportData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
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
