import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import api from "services/reports/api";

type Status = "idle" | "loading" | "succeeded" | "failed";

interface FilteredState {
  status: Status;
  error: string | null;
  result: any;
}

interface InterventionConsolidatedReportState {
  status: Status;
  error: string | null;
  filtered: FilteredState;
  helpModal: boolean;
}

const initialState: InterventionConsolidatedReportState = {
  status: "idle",
  error: null,
  filtered: {
    status: "idle",
    error: null,
    result: {},
  },
  helpModal: false,
};

export const fetchReportData = createAsyncThunk(
  "reports-intervention-consolidated/fetch-data",
  async (params: any, thunkAPI) => {
    try {
      const response =
        await api.consolidated.getInterventionConsolidatedReport(params);
      return response.data;
    } catch (err: any) {
      console.error(err);
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

const interventionConsolidatedReportSlice = createSlice({
  name: "interventionConsolidatedReport",
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

export const { reset, setHelpModal } =
  interventionConsolidatedReportSlice.actions;

export const interventionConsolidatedReportReducer =
  interventionConsolidatedReportSlice.reducer;
