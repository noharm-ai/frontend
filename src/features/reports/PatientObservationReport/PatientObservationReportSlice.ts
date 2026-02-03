import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import api from "services/reports/api";
import { getUniqList } from "utils/report";

interface ObservationData {
  id: string;
  text: string;
  createdBy: string;
  createdAt: string;
}

interface FilteredResult {
  list: ObservationData[];
}

interface PatientObservationState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  list: ObservationData[];
  filters: Record<string, any>;
  filtered: {
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
    result: FilteredResult;
  };
  filterData: {
    createdBy: string[];
  };
}

interface FetchReportDataParams {
  admissionNumber: string;
}

interface ApiResponse {
  data: ObservationData[];
}

const initialState: PatientObservationState = {
  status: "idle",
  error: null,
  list: [],
  filters: {},
  filtered: {
    status: "idle",
    error: null,
    result: {
      list: [],
    },
  },
  filterData: {
    createdBy: [],
  },
};

export const fetchReportData = createAsyncThunk<
  ApiResponse,
  FetchReportDataParams,
  { rejectValue: any }
>("reports-patient-observation/fetch-data", async (params, thunkAPI) => {
  try {
    const response = await api.live.getPatientObservationHistoryReport(params);

    return response.data;
  } catch (err: any) {
    console.error(err);
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});

const patientObservationReportSlice = createSlice({
  name: "patientObservationReport",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setFilters(state, action: PayloadAction<Record<string, any>>) {
      state.filters = action.payload;
    },
    setFilteredStatus(
      state,
      action: PayloadAction<"idle" | "loading" | "succeeded" | "failed">,
    ) {
      state.filtered.status = action.payload;
    },
    setFilteredResult(state, action: PayloadAction<FilteredResult>) {
      state.filtered.result = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchReportData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchReportData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data;
        state.filterData.createdBy = getUniqList(
          action.payload.data,
          "createdBy",
        );
      })
      .addCase(fetchReportData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "An error occurred";
        state.list = [];
      });
  },
});

export const { reset, setFilters, setFilteredResult, setFilteredStatus } =
  patientObservationReportSlice.actions;

export default patientObservationReportSlice.reducer;
