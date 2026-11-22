import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import api from "services/reports/api";
import { getUniqList } from "utils/report";
import type {
  ExamsRawSearchFilters,
  ExamsRawSearchReportData,
  RawExam,
} from "./transformers";

type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

interface ExamsRawSearchReportState {
  status: LoadStatus;
  error: string | null;
  list: RawExam[];
  // empty until the first search
  filters: Partial<ExamsRawSearchFilters>;
  filtered: {
    status: LoadStatus;
    error: string | null;
    result: ExamsRawSearchReportData;
  };
  filterData: {
    types: string[];
  };
}

interface FetchReportDataParams {
  idPatient: number;
}

interface FetchReportDataResponse {
  data: RawExam[];
}

const initialState: ExamsRawSearchReportState = {
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
    types: [],
  },
};

export const fetchReportData = createAsyncThunk<
  FetchReportDataResponse,
  FetchReportDataParams,
  { rejectValue: unknown }
>("reports-exams-search/fetch-data", async (params, thunkAPI) => {
  try {
    const response = await api.live.getExamsRawSearchReport(params);

    return response.data;
  } catch (err) {
    console.error(err);
    const { response } = err as { response?: { data?: unknown } };
    return thunkAPI.rejectWithValue(response?.data);
  }
});

const examsRawSearchReportSlice = createSlice({
  name: "examsRawSearchReport",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setFilters(state, action: PayloadAction<ExamsRawSearchFilters>) {
      state.filters = action.payload;
    },
    setFilteredStatus(state, action: PayloadAction<LoadStatus>) {
      state.filtered.status = action.payload;
    },
    setFilteredResult(state, action: PayloadAction<ExamsRawSearchReportData>) {
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
        state.filterData.types = getUniqList(action.payload.data, "typeExam");
      })
      .addCase(fetchReportData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? null;
        state.list = [];
      });
  },
});

export const { reset, setFilters, setFilteredResult, setFilteredStatus } =
  examsRawSearchReportSlice.actions;

export const examsRawSearchReportReducer = examsRawSearchReportSlice.reducer;
