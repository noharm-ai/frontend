import { createSlice } from "@reduxjs/toolkit";

import { getUniqList } from "utils/report";
import { Types as PrescriptionTypes } from "store/ducks/prescriptions";

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
  open: false,
};

const alertListReportSlice = createSlice({
  name: "alertListReport",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setAlertsModalOpen(state, action) {
      state.open = action.payload;
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
  extraReducers(builder) {
    // loading a prescription closes the modal (it holds the previous
    // prescription's alerts)
    builder.addCase(
      PrescriptionTypes.PRESCRIPTIONS_FETCH_SINGLE_START,
      (state) => {
        state.open = false;
      },
    );
  },
});

export const {
  reset,
  setFilters,
  setFilteredResult,
  setFilteredStatus,
  setReportData,
  setInitialFilters,
  setAlertsModalOpen,
} = alertListReportSlice.actions;

export default alertListReportSlice.reducer;
