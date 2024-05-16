import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/reports/api";
import { getUniqList } from "utils/report";

const initialState = {
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
  },
};

export const fetchReportData = createAsyncThunk(
  "reports-antimicro-history/fetch-data",
  async (params, thunkAPI) => {
    try {
      const response = await api.live.getAntimicrobialHistoryReport(params);

      return response.data;
    } catch (err) {
      console.error(err);
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const antimicrobialHistoryReportSlice = createSlice({
  name: "antimicrobialHistoryReport",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setFilters(state, action) {
      state.filters = action.payload;
    },
    setFilteredStatus(state, action) {
      state.filtered.status = action.payload;
    },
    setFilteredResult(state, action) {
      state.filtered.result = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchReportData.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchReportData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data;

        state.filterData.drugs = getUniqList(action.payload.data, "drug");
      })
      .addCase(fetchReportData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        state.list = [];
      });
  },
});

export const { reset, setFilters, setFilteredResult, setFilteredStatus } =
  antimicrobialHistoryReportSlice.actions;

export default antimicrobialHistoryReportSlice.reducer;
