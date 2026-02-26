import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import api from "services/reports/api";
import { getUniqList } from "utils/report";

interface CheckedIndexData {
  doseconv: number;
  frequenciadia: number;
  idPrescription: string;
  createdAt: string;
  createdBy: string;
}

interface FilteredResult {
  list: CheckedIndexData[];
}

interface CheckedIndexState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  list: CheckedIndexData[];
  auditData: {
    createdAt: string;
    config: any;
  };
  current: any;
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
  idPrescriptionDrug: string;
}

interface ApiResponse {
  data: CheckedIndexData[];
}

const initialState: CheckedIndexState = {
  status: "idle",
  error: null,
  list: [],
  auditData: {
    createdAt: "",
    config: {},
  },
  current: {},
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
>("reports-checked-index/fetch-data", async (params, thunkAPI) => {
  try {
    const response = await api.live.getCheckedIndexReport(params);

    return response.data;
  } catch (err: any) {
    console.error(err);
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});

const checkedIndexReportSlice = createSlice({
  name: "checkedIndexReport",
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
        state.auditData = (action.payload.data as any).audit;
        state.current = (action.payload.data as any).current;
        state.list = (action.payload.data as any).records;
        state.filterData.createdBy = getUniqList(
          (action.payload.data as any).records,
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
  checkedIndexReportSlice.actions;

export default checkedIndexReportSlice.reducer;
