import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import api from "services/reports/api";
import { getUniqList } from "utils/report";
import type {
  CultureReportItem,
  CultureReportFilters,
  CultureReportData,
} from "./transformers";

type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

interface CultureReportState {
  status: LoadStatus;
  error: string | null;
  list: CultureReportItem[];
  // empty until the first search
  filters: Partial<CultureReportFilters>;
  filtered: {
    status: LoadStatus;
    error: string | null;
    result: CultureReportData;
  };
  filterData: {
    exams: string[];
    examMaterials: string[];
    microorganisms: string[];
  };
}

interface FetchReportDataParams {
  idPatient: number | string;
}

interface FetchReportDataResponse {
  data: CultureReportItem[];
}

const initialState: CultureReportState = {
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
    exams: [],
    examMaterials: [],
    microorganisms: [],
  },
};

export const fetchReportData = createAsyncThunk<
  FetchReportDataResponse,
  FetchReportDataParams,
  { rejectValue: unknown }
>("reports-culture/fetch-data", async (params, thunkAPI) => {
  try {
    const response = await api.live.getCultureReport(params);

    return response.data;
  } catch (err) {
    console.error(err);
    const { response } = err as { response?: { data?: unknown } };
    return thunkAPI.rejectWithValue(response?.data);
  }
});

const cultureReportSlice = createSlice({
  name: "cultureReport",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setFilters(state, action: PayloadAction<CultureReportFilters>) {
      state.filters = action.payload;
    },
    setFilteredStatus(state, action: PayloadAction<LoadStatus>) {
      state.filtered.status = action.payload;
    },
    setFilteredResult(state, action: PayloadAction<CultureReportData>) {
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

        state.filterData.exams = getUniqList(action.payload.data, "examName");
        state.filterData.examMaterials = getUniqList(
          action.payload.data,
          "examMaterialName",
        );
        state.filterData.microorganisms = getUniqList(
          action.payload.data,
          "microorganism",
        );
      })
      .addCase(fetchReportData.rejected, (state, action) => {
        state.status = "failed";
        // rejectWithValue leaves error.message as "Rejected": prefer the
        // backend's message
        const payload = action.payload as { message?: unknown } | undefined;
        state.error =
          typeof payload?.message === "string"
            ? payload.message
            : (action.error.message ?? null);
        state.list = [];
      });
  },
});

export const { reset, setFilters, setFilteredResult, setFilteredStatus } =
  cultureReportSlice.actions;

export const cultureReportReducer = cultureReportSlice.reducer;
