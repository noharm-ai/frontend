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
  tags: [],
  insurances: [],
  hasAge: false,
  hasCheckedAt: false,
  hasOriginCreatedAt: false,
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
  };

  //added in new versions
  if (body && body.length > 0) {
    const firstRecord = body[0];

    options.tags = firstRecord.hasOwnProperty("tags")
      ? getUniqList(body, "tags")
      : [];
    options.insurances = firstRecord.hasOwnProperty("insurance")
      ? getUniqList(body, "insurance")
      : [];

    options.hasAge = body.some((r) => r.age != null);
    options.hasCheckedAt = body.some((r) => r.checkedAt != null);
    options.hasOriginCreatedAt = body.some((r) => r.originCreatedAt != null);
  }

  return options;
};

export const fetchReportData = createAsyncThunk(
  "reports-prescription/fetch-data",
  async (params, thunkAPI) => {
    try {
      const response = await api.getReport(ReportEnum.PRESCRIPTION, params);
      if (!response.data.data.cached) {
        return { cached: false };
      }

      const { header, body } = await loadReportDatasource(
        ReportEnum.PRESCRIPTION,
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
      clearReportDatasource(ReportEnum.PRESCRIPTION);
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
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
} = prescriptionReportSlice.actions;

export default prescriptionReportSlice.reducer;
