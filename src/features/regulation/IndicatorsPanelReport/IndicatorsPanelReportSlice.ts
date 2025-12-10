import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "services/reports/api";

interface IOrder {
  field: string;
  direction: "asc" | "desc";
}

interface IIndicatorsPanelReportSlice {
  status: string;
  error: string | null;
  list: any[];
  filters: {
    name: string | null;
    cpf: string | null;
    cns: string | null;
    health_unit: string | null;
    health_agent: string | null;
    responsible_team: string | null;
    has_indicator: null | boolean;
    indicator: string;
    age_min: number | null;
    age_max: number | null;
  };
  order: IOrder[];
  currentPage: number;
  count: number;
  summary: {
    status: string;
    open: boolean;
    data: any;
  };
}

const initialState: IIndicatorsPanelReportSlice = {
  list: [],
  status: "idle",
  error: null,
  filters: {
    name: null,
    cpf: null,
    cns: null,
    health_unit: null,
    health_agent: null,
    responsible_team: null,
    age_min: null,
    age_max: null,
    has_indicator: null,
    indicator: "HPV_VACCINE",
  },
  order: [
    {
      field: "name",
      direction: "asc",
    },
  ],
  currentPage: 1,
  count: 0,
  summary: {
    open: false,
    status: "idle",
    data: {},
  },
};

export const fetchReport = createAsyncThunk(
  "regulation-reports/fetch-indicators-panel",
  async (params: any, thunkAPI) => {
    try {
      const response = await api.regulation.getIndicatorsPanel(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const exportReport = createAsyncThunk(
  "regulation-reports/export",
  async (params: any, thunkAPI) => {
    try {
      const response = await api.regulation.getIndicatorsPanelCsv(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const fetchSummary = createAsyncThunk(
  "regulation-reports/fetch-indicators-summary",
  async (_: any, thunkAPI) => {
    try {
      const response = await api.regulation.getIndicatorsSummary();

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

const regulationIndicatorsPanelReportSlice = createSlice({
  name: "regulationIndicatorsPanelReportSlice",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setFilters(state, action) {
      state.filters = action.payload;
    },
    setCurrentPage(state, action) {
      state.currentPage = action.payload;
    },
    updateOrder(state, action) {
      state.order = action.payload;
    },
    setSummaryVisibility(state, action) {
      state.summary.open = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchReport.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchReport.fulfilled, (state, action) => {
        state.status = "succeeded";

        state.list = action.payload.data.data.data;
        state.count = action.payload.data.data.count;
      })
      .addCase(fetchReport.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message!;
        state.list = [];
        state.count = 0;
      })

      .addCase(fetchSummary.pending, (state) => {
        state.summary.status = "loading";
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.summary.status = "succeeded";

        state.summary.data = action.payload.data.data;
      })
      .addCase(fetchSummary.rejected, (state) => {
        state.summary.status = "failed";
        state.summary.data = {};
      });
  },
});

export const {
  reset,
  setFilters,
  setCurrentPage,
  updateOrder,
  setSummaryVisibility,
} = regulationIndicatorsPanelReportSlice.actions;

export default regulationIndicatorsPanelReportSlice.reducer;
