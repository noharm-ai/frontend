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
  prescribers: [],
  departments: [],
  segments: [],
  drugs: [],
  substances: [],
  substanceClasses: [],
  substanceClassParents: [],
  economyTypes: [],
  reasons: [],
  tags: [],
  filtered: {
    status: "idle",
    error: null,
    result: {},
  },
  availableReports: [],
  activeReport: "current",
  filters: {},
  helpModal: false,
  historyModal: false,
};

const getFilterOptions = (body) => {
  const options = {
    responsibles: getUniqList(body, "responsible"),
    departments: getUniqDepartments(body, "department", "segment"),
    segments: getUniqList(body, "segment"),
    prescribers: getUniqList(body, "prescriber"),
    drugs: getUniqList(body, "drug"),
    reasons: getUniqList(body, "reason"),
  };

  //added in new versions
  if (body && body.length > 0) {
    const firstRecord = body[0];

    if (firstRecord.hasOwnProperty("tags")) {
      options.tags = getUniqList(body, "tags");
    }

    if (firstRecord.hasOwnProperty("substance")) {
      options.substances = getUniqList(body, "substance");
    }

    if (firstRecord.hasOwnProperty("substanceClass")) {
      options.substanceClasses = getUniqList(body, "substanceClass");
    }

    if (firstRecord.hasOwnProperty("substanceClassParent")) {
      options.substanceClassParents = getUniqList(body, "substanceClassParent");
    }

    if (firstRecord.hasOwnProperty("economyType")) {
      options.economyTypes = getUniqList(body, "economyType");
    }
  }

  return options;
};

export const fetchReportData = createAsyncThunk(
  "reports-intervention/fetch-data",
  async (params, thunkAPI) => {
    try {
      const response = await api.getReport(ReportEnum.INTERVENTION, params);
      if (!response.data.data.cached) {
        return { cached: false };
      }

      const { header, body } = await loadReportDatasource(
        ReportEnum.INTERVENTION,
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
      clearReportDatasource(ReportEnum.INTERVENTION);
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

const interventionReportSlice = createSlice({
  name: "interventionReport",
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
          state.dateRange = header.dateRange ?? 60;
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
} = interventionReportSlice.actions;

export default interventionReportSlice.reducer;
