import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import api from "services/reports/api";

type Status = "idle" | "loading" | "succeeded" | "failed";

interface FilteredState {
  status: Status;
  error: string | null;
  result: any;
}

interface EconomyConsolidatedReportState {
  status: Status;
  error: string | null;
  filtered: FilteredState;
  filters: any;
  helpModal: boolean;
}

const initialState: EconomyConsolidatedReportState = {
  status: "idle",
  error: null,
  filtered: {
    status: "idle",
    error: null,
    result: {},
  },
  filters: {},
  helpModal: false,
};

export const fetchReportData = createAsyncThunk(
  "reports-economy-consolidated/fetch-data",
  async (params: any, thunkAPI) => {
    try {
      const response =
        await api.consolidated.getEconomyConsolidatedReport(params);
      return response.data;
    } catch (err: any) {
      console.error(err);
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

const economyConsolidatedReportSlice = createSlice({
  name: "economyConsolidatedReport",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setFilteredStatus(state, action: PayloadAction<Status>) {
      state.filtered.status = action.payload;
    },
    setFilteredResult(state, action: PayloadAction<any>) {
      state.filtered.result = action.payload;
    },
    setFilters(state, action: PayloadAction<any>) {
      state.filters = action.payload;
    },
    setHelpModal(state, action: PayloadAction<boolean>) {
      state.helpModal = action.payload;
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
        state.filtered.result = {};
        state.error = action.error.message || null;
      });
  },
});

export const {
  reset,
  setFilteredStatus,
  setFilteredResult,
  setFilters,
  setHelpModal,
} = economyConsolidatedReportSlice.actions;

export default economyConsolidatedReportSlice.reducer;
