import { createSlice } from "@reduxjs/toolkit";

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
  initialFilters: {},
};

const alertListReportSlice = createSlice({
  name: "alertListReport",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setInitialFilters(state, action) {
      state.initialFilters = action.payload;
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
    setReportData(state, action) {
      state.list = action.payload;
      state.filterData.drugs = getUniqList(action.payload, "drugName");
    },
  },
});

export const {
  reset,
  setFilters,
  setFilteredResult,
  setFilteredStatus,
  setReportData,
  setInitialFilters,
} = alertListReportSlice.actions;

export default alertListReportSlice.reducer;
