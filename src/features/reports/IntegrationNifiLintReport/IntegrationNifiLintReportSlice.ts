import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/reports/api";
import { getUniqList } from "utils/report";

interface IIntegrationNifiLintReportSlice {
  status: string;
  error: string | null;
  list: Blob | null;
  filters: Record<string, any>;
  filtered: {
    status: string;
    error: string | null;
    result: {
      list: any[];
    };
  };
  errorKeys: any;
  date: string | null;
  filterData: {
    levels: any[];
    keys: any[];
    schemas: any[];
  };
}

const initialState: IIntegrationNifiLintReportSlice = {
  status: "idle",
  error: null,
  list: null,
  filters: {},
  filtered: {
    status: "idle",
    error: null,
    result: {
      list: [],
    },
  },
  errorKeys: {},
  date: null,
  filterData: {
    levels: [],
    keys: [],
    schemas: [],
  },
};

export const fetchReportData = createAsyncThunk(
  "reports-integration-checklist/fetch-data",
  async (_, thunkAPI) => {
    try {
      const response = await api.live.getIntegrationNifiLintReport();

      const cacheResponseStream = await fetch(response.data.data.url);

      const gzipped = await cacheResponseStream.clone().blob();

      const cacheReadableStream = cacheResponseStream.body?.pipeThrough(
        new window.DecompressionStream("gzip")
      );

      const decompressedResponse = new Response(cacheReadableStream);
      const cache = await decompressedResponse.json();

      return {
        ...response,
        cacheData: cache,
        gzipped,
        availableReports: response.data.data.availableReports,
      };
    } catch (err) {
      console.error(err);
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

const integrationNifiLintReportSlice = createSlice({
  name: "integrationNifiLintReport",
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
      .addCase(fetchReportData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchReportData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.gzipped;
        state.date = action.payload.cacheData.header.date;
        state.errorKeys = action.payload.cacheData.header.errorKeys;

        state.filterData.levels = getUniqList(
          action.payload.cacheData.body,
          "level"
        );
        state.filterData.keys = getUniqList(
          action.payload.cacheData.body,
          "key"
        );
        state.filterData.schemas = getUniqList(
          action.payload.cacheData.body,
          "schema"
        );
      })
      .addCase(fetchReportData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message!;
        state.list = null;
      });
  },
});

export const { reset, setFilters, setFilteredResult, setFilteredStatus } =
  integrationNifiLintReportSlice.actions;

export default integrationNifiLintReportSlice.reducer;
