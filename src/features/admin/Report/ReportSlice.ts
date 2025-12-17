import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/admin/api";
import { IReportFormBaseFields } from "./Form/ReportForm";

interface IReportSlice {
  list: any[];
  saved_queries: any[];
  status: string;
  error: string | null;
  single: {
    data: any | null;
    status: string;
    error: string | null;
  };
}

const initialState: IReportSlice = {
  list: [],
  saved_queries: [],
  status: "idle",
  error: null,
  single: {
    data: null,
    status: "idle",
    error: null,
  },
};

export const fetchReports = createAsyncThunk(
  "admin-report/fetch",
  async (params: any, thunkAPI) => {
    try {
      const response = await api.reports.getReports(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const upsertReport = createAsyncThunk(
  "admin-report/upsert",
  async (params: IReportFormBaseFields, thunkAPI) => {
    try {
      const response = await api.reports.upsertReport(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

const reportSlice = createSlice({
  name: "adminReport",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setReport(state, action) {
      state.single.data = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data.data.custom_reports;
        state.saved_queries = action.payload.data.data.saved_queries;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? null;
      })
      .addCase(upsertReport.pending, (state) => {
        state.single.status = "loading";
      })
      .addCase(upsertReport.fulfilled, (state) => {
        state.single.status = "succeeded";
      })
      .addCase(upsertReport.rejected, (state, action) => {
        state.single.status = "failed";
        state.single.error = action.error.message!;
      });
  },
});

export const { reset, setReport } = reportSlice.actions;

export default reportSlice.reducer;
