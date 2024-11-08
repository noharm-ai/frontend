import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/regulation/api";

const initialState = {
  list: [],
  status: "idle",
  error: null,
  filters: {
    typeList: [],
  },
  order: [
    {
      field: "date",
      direction: "asc",
    },
  ],
  currentPage: 1,
  count: 0,
};

export const fetchRegulationList = createAsyncThunk(
  "regulation-prioritization/fetch",
  async (params, thunkAPI) => {
    try {
      const response = await api.fetchRegulationList(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const regulationPrioritizationSlice = createSlice({
  name: "regulationPrioritizationSlice",
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
  },
  extraReducers(builder) {
    builder
      .addCase(fetchRegulationList.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchRegulationList.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data.data.list;
        state.count = action.payload.data.data.count;
      })
      .addCase(fetchRegulationList.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        state.list = [];
      });
  },
});

export const { reset, setFilters, setCurrentPage, updateOrder } =
  regulationPrioritizationSlice.actions;

export default regulationPrioritizationSlice.reducer;
