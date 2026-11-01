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

// a drill-down list, with what it was asked for: a late answer to an earlier
// click is dropped
interface DrillState extends ResultState {
  requested: number | null;
}

interface InfectionControlConsolidatedReportState {
  // indicators of the period
  filtered: ResultState;
  // the admissions of a department
  admissions: DrillState;
  // the courses of an admission
  courses: DrillState;
  helpModal: boolean;
}

const initialState: InfectionControlConsolidatedReportState = {
  filtered: {
    status: "idle",
    error: null,
    result: {},
  },
  admissions: {
    status: "idle",
    error: null,
    result: {},
    requested: null,
  },
  courses: {
    status: "idle",
    error: null,
    result: {},
    requested: null,
  },
  helpModal: false,
};

// the period and the drill-downs ask the same endpoint
const fetchReport = async (
  params: IReportParams,
  thunkAPI: { rejectWithValue: (value: unknown) => unknown },
) => {
  try {
    const response =
      await api.consolidated.getInfectionControlConsolidatedReport(params);
    return response.data;
  } catch (err) {
    console.error(err);
    return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
  }
};

export const fetchReportData = createAsyncThunk(
  "reports-infection-control-consolidated/fetch-data",
  fetchReport,
);

export const fetchDepartmentAdmissions = createAsyncThunk(
  "reports-infection-control-consolidated/fetch-admissions",
  fetchReport,
);

export const fetchAdmissionCourses = createAsyncThunk(
  "reports-infection-control-consolidated/fetch-courses",
  fetchReport,
);

const errorOf = (action: { payload?: unknown; error: { message?: string } }) =>
  (action.payload as { message?: string })?.message ||
  action.error.message ||
  null;

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
        state.filtered.error = errorOf(action);
      });

    for (const [thunk, slot, key] of [
      [fetchDepartmentAdmissions, "admissions", "admissions_of"],
      [fetchAdmissionCourses, "courses", "courses_of"],
    ] as const) {
      builder
        .addCase(thunk.pending, (state, action) => {
          state[slot].status = "loading";
          state[slot].error = null;
          state[slot].result = {};
          state[slot].requested = action.meta.arg[key] ?? null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          if (state[slot].requested !== action.meta.arg[key]) return;
          state[slot].status = "succeeded";
          state[slot].result = action.payload.data || {};
        })
        .addCase(thunk.rejected, (state, action) => {
          if (state[slot].requested !== action.meta.arg[key]) return;
          state[slot].status = "failed";
          state[slot].error = errorOf(action);
        });
    }
  },
});

export const { reset, setHelpModal } =
  infectionControlConsolidatedReportSlice.actions;

export const infectionControlConsolidatedReportReducer =
  infectionControlConsolidatedReportSlice.reducer;
