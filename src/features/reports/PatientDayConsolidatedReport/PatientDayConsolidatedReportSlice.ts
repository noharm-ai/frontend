import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import api from "services/reports/api";

interface FilteredState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  result: any;
}

interface PatientDayConsolidatedReportState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  list: any[];
  filtered: FilteredState;
  filters: any;
}

const initialState: PatientDayConsolidatedReportState = {
  status: "idle",
  error: null,
  list: [],
  filtered: {
    status: "idle",
    error: null,
    result: {},
  },
  filters: {},
};

export const fetchReportData = createAsyncThunk(
  "reports-patient-day-consolidated/fetch-data",
  async (params: any, thunkAPI) => {
    try {
      const response =
        await api.consolidated.getPatientDayConsolidatedReport(params);
      return response.data;
    } catch (err: any) {
      console.error(err);
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

const patientDayConsolidatedReportSlice = createSlice({
  name: "patientDayConsolidatedReport",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setFilteredStatus(
      state,
      action: PayloadAction<"idle" | "loading" | "succeeded" | "failed">,
    ) {
      state.filtered.status = action.payload;
    },
    setFilteredResult(state, action: PayloadAction<any>) {
      state.filtered.result = action.payload;
    },
    setFilters(state, action: PayloadAction<any>) {
      state.filters = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchReportData.pending, (state) => {
        state.status = "loading";
        state.filtered.status = "loading";
      })
      .addCase(fetchReportData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.filtered.status = "succeeded";
        state.filtered.result = action.payload.data;
      })
      .addCase(fetchReportData.rejected, (state, action) => {
        state.status = "failed";
        state.filtered.status = "failed";
        state.error = action.error.message || null;
      });
  },
});

export const { reset, setFilteredStatus, setFilteredResult, setFilters } =
  patientDayConsolidatedReportSlice.actions;

export default patientDayConsolidatedReportSlice.reducer;
