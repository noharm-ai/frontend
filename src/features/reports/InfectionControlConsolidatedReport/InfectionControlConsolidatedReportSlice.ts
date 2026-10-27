import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";

import api from "services/reports/api";

import { IReportParams, IReportResult } from "./infectionControlReportTypes";

type Status = "idle" | "loading" | "succeeded" | "failed";

interface ResultState {
  status: Status;
  error: string | null;
  result: IReportResult;
}

interface InfectionControlConsolidatedReportState {
  // indicators of the period
  filtered: ResultState;
  // the view of one day (antimicrobials running on it and their records)
  day: ResultState;
  helpModal: boolean;
}

const initialState: InfectionControlConsolidatedReportState = {
  filtered: {
    status: "idle",
    error: null,
    result: {},
  },
  day: {
    status: "idle",
    error: null,
    result: {},
  },
  helpModal: false,
};

export const fetchReportData = createAsyncThunk(
  "reports-infection-control-consolidated/fetch-data",
  async (params: IReportParams, thunkAPI) => {
    try {
      const response =
        await api.consolidated.getInfectionControlConsolidatedReport(params);
      return response.data;
    } catch (err) {
      console.error(err);
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

export const fetchDayData = createAsyncThunk(
  "reports-infection-control-consolidated/fetch-day",
  async (params: IReportParams, thunkAPI) => {
    try {
      const response =
        await api.consolidated.getInfectionControlConsolidatedReport(params);
      return response.data;
    } catch (err) {
      console.error(err);
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

const infectionControlConsolidatedReportSlice = createSlice({
  name: "infectionControlConsolidatedReport",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setHelpModal(state, action: PayloadAction<boolean>) {
      state.helpModal = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchReportData.pending, (state) => {
        state.filtered.status = "loading";
      })
      .addCase(fetchReportData.fulfilled, (state, action) => {
        state.filtered.status = "succeeded";
        state.filtered.result = action.payload.data || {};
      })
      .addCase(fetchReportData.rejected, (state, action) => {
        state.filtered.status = "failed";
        state.filtered.result = {};
        state.filtered.error =
          (action.payload as { message?: string })?.message ||
          action.error.message ||
          null;
      })
      .addCase(fetchDayData.pending, (state) => {
        state.day.status = "loading";
      })
      .addCase(fetchDayData.fulfilled, (state, action) => {
        state.day.status = "succeeded";
        state.day.result = action.payload.data || {};
      })
      .addCase(fetchDayData.rejected, (state, action) => {
        state.day.status = "failed";
        state.day.result = {};
        state.day.error =
          (action.payload as { message?: string })?.message ||
          action.error.message ||
          null;
      });
  },
});

export const { reset, setHelpModal } =
  infectionControlConsolidatedReportSlice.actions;

export const infectionControlConsolidatedReportReducer =
  infectionControlConsolidatedReportSlice.reducer;
