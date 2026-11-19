import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { getUniqList } from "utils/report";
import type {
  AlertListFilters,
  AlertListItem,
  AlertListReportData,
} from "./transformers";

type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

interface AlertListReportState {
  status: LoadStatus;
  error: string | null;
  list: AlertListItem[];
  // empty until the first search
  filters: Partial<AlertListFilters>;
  filtered: {
    status: LoadStatus;
    error: string | null;
    result: AlertListReportData;
  };
  filterData: {
    drugs: string[];
  };
  // the filters of the alerts card cell that opened the report
  initialFilters: Partial<AlertListFilters>;
}

const initialState: AlertListReportState = {
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
    setInitialFilters(state, action: PayloadAction<Partial<AlertListFilters>>) {
      state.initialFilters = action.payload;
    },
    setFilters(state, action: PayloadAction<AlertListFilters>) {
      state.filters = action.payload;
    },
    setFilteredStatus(state, action: PayloadAction<LoadStatus>) {
      state.filtered.status = action.payload;
    },
    setFilteredResult(state, action: PayloadAction<AlertListReportData>) {
      state.filtered.result = action.payload;
    },
    setReportData(state, action: PayloadAction<AlertListItem[]>) {
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

export const alertListReportReducer = alertListReportSlice.reducer;
