import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/reports/api";
import { ReportStatusEnum } from "src/models/ReportStatusEnum";

const initialState = {
  config: {
    status: "idle",
    error: null,
    internal: [],
    external: [],
    custom: [],
  },
  selectedReport: {
    data: null,
  },
};

export const getConfig = createAsyncThunk(
  "reports/config",
  async (params, thunkAPI) => {
    try {
      const response = await api.getConfig(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const getCustomReports = createAsyncThunk(
  "reports/custom/list",
  async (params, thunkAPI) => {
    try {
      const response = await api.custom.getCustomReports(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const downloadReport = createAsyncThunk(
  "reports/custom/download",
  async (params, thunkAPI) => {
    try {
      const response = await api.custom.downloadReport(
        params.idReport,
        params.filename,
      );

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const processReport = createAsyncThunk(
  "reports/custom/process",
  async (params, thunkAPI) => {
    try {
      const response = await api.custom.processReport(params.idReport);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const getFileReport = createAsyncThunk(
  "reports/file-report",
  async (params, thunkAPI) => {
    try {
      const response = await api.getReport(params.type, {
        id_report: params.id_report,
        filename: params.filename,
      });

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    selectReport(state, action) {
      state.selectedReport.data = action.payload;
    },
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getConfig.pending, (state, action) => {
        state.config.status = "loading";
      })
      .addCase(getConfig.fulfilled, (state, action) => {
        state.config.status = "succeeded";
        state.config.internal = action.payload.data.internal;
        state.config.external = action.payload.data.external;
        state.config.custom = action.payload.data.custom;
      })
      .addCase(getConfig.rejected, (state, action) => {
        state.config.status = "failed";
      })
      .addCase(processReport.fulfilled, (state, action) => {
        if (state.selectedReport.data) {
          state.selectedReport.data.status = ReportStatusEnum.PROCESSING;
        }
      })

      .addCase(getCustomReports.fulfilled, (state, action) => {
        state.config.custom = action.payload.data;

        if (state.selectedReport.data) {
          const reportData = state.config.custom.find(
            (r) => r.id === state.selectedReport.data.id,
          );

          if (reportData) {
            state.selectedReport.data = reportData;
          }
        }
      });
  },
});

export const { reset, selectReport } = reportsSlice.actions;

export default reportsSlice.reducer;
