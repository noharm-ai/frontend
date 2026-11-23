import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import api from "services/reports/api";
import { getUniqList } from "utils/report";
import type {
  DrugHistoryItem,
  DrugHistoryFilters,
  DrugHistoryReportData,
} from "./transformers";

type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

interface DrugHistoryReportState {
  status: LoadStatus;
  error: string | null;
  list: DrugHistoryItem[];
  // empty until the first search
  filters: Partial<DrugHistoryFilters>;
  filtered: {
    status: LoadStatus;
    error: string | null;
    result: DrugHistoryReportData;
  };
  filterData: {
    drugs: string[];
    substances: string[];
  };
}

interface FetchReportDataParams {
  admissionNumber: number | string;
  // antimicro, mav, controlled, chemo...
  attribute: string;
}

interface FetchReportDataResponse {
  data: DrugHistoryItem[];
}

const initialState: DrugHistoryReportState = {
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
    drugs: [],
    substances: [],
  },
};

export const fetchReportData = createAsyncThunk<
  FetchReportDataResponse,
  FetchReportDataParams,
  { rejectValue: unknown }
>("reports-drug-history/fetch-data", async (params, thunkAPI) => {
  try {
    const response = await api.live.getDrugAttributeHistoryReport(params);

    return response.data;
  } catch (err) {
    console.error(err);
    const { response } = err as { response?: { data?: unknown } };
    return thunkAPI.rejectWithValue(response?.data);
  }
});

const drugHistoryReportSlice = createSlice({
  name: "drugHistoryReport",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setFilters(state, action: PayloadAction<DrugHistoryFilters>) {
      state.filters = action.payload;
    },
    setFilteredStatus(state, action: PayloadAction<LoadStatus>) {
      state.filtered.status = action.payload;
    },
    setFilteredResult(state, action: PayloadAction<DrugHistoryReportData>) {
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

        state.filterData.drugs = getUniqList(action.payload.data, "drug");
        state.filterData.substances = getUniqList(
          action.payload.data,
          "substance",
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
  drugHistoryReportSlice.actions;

export const drugHistoryReportReducer = drugHistoryReportSlice.reducer;
