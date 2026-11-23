import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import api from "services/reports/api";
import { getUniqList } from "utils/report";
import type {
  PrescriptionHistoryEvent,
  PrescriptionHistoryFilters,
  PrescriptionHistoryReportData,
} from "./transformers";

type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

interface PrescriptionHistoryReportState {
  status: LoadStatus;
  error: string | null;
  list: PrescriptionHistoryEvent[];
  // empty until the first search
  filters: Partial<PrescriptionHistoryFilters>;
  filtered: {
    status: LoadStatus;
    error: string | null;
    result: PrescriptionHistoryReportData;
  };
  filterData: {
    responsibles: string[];
  };
}

interface FetchReportDataParams {
  idPrescription: number | string;
}

interface FetchReportDataResponse {
  data: PrescriptionHistoryEvent[];
}

const initialState: PrescriptionHistoryReportState = {
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
    responsibles: [],
  },
};

export const fetchReportData = createAsyncThunk<
  FetchReportDataResponse,
  FetchReportDataParams,
  { rejectValue: unknown }
>("reports-prescription-history/fetch-data", async (params, thunkAPI) => {
  try {
    const response = await api.live.getPrescriptionHistoryReport(params);

    return response.data;
  } catch (err) {
    console.error(err);
    const { response } = err as { response?: { data?: unknown } };
    return thunkAPI.rejectWithValue(response?.data);
  }
});

const prescriptionHistoryReportSlice = createSlice({
  name: "prescriptionHistoryReport",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setFilters(state, action: PayloadAction<PrescriptionHistoryFilters>) {
      state.filters = action.payload;
    },
    setFilteredStatus(state, action: PayloadAction<LoadStatus>) {
      state.filtered.status = action.payload;
    },
    setFilteredResult(
      state,
      action: PayloadAction<PrescriptionHistoryReportData>,
    ) {
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

        state.filterData.responsibles = getUniqList(
          action.payload.data,
          "responsible",
        );
      })
      .addCase(fetchReportData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? null;
        state.list = [];
      });
  },
});

export const { reset, setFilters, setFilteredResult, setFilteredStatus } =
  prescriptionHistoryReportSlice.actions;

export const prescriptionHistoryReportReducer =
  prescriptionHistoryReportSlice.reducer;
