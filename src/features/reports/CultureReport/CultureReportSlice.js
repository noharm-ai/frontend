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
    exams: [],
    examMaterials: [],
    microorganisms: [],
  },
};

export const fetchReportData = createAsyncThunk(
  "reports-culture/fetch-data",
  async (params, thunkAPI) => {
    try {
      const response = await api.live.getCultureReport(params);

      return response.data;
    } catch (err) {
      console.error(err);
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const cultureReportSlice = createSlice({
  name: "cultureReport",
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

        state.filterData.exams = getUniqList(action.payload.data, "examName");
        state.filterData.examMaterials = getUniqList(
          action.payload.data,
          "examMaterialName"
        );
        state.filterData.microorganisms = getUniqList(
          action.payload.data,
          "microorganism"
        );
      })
      .addCase(fetchReportData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        state.list = [];
      });
  },
});

export const { reset, setFilters, setFilteredResult, setFilteredStatus } =
  cultureReportSlice.actions;

export default cultureReportSlice.reducer;
