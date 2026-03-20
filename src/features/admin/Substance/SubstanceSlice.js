import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/admin/api";

import { upsertSubstance } from "./SubstanceFormSlice";

const initialState = {
  list: [],
  status: "idle",
  error: null,
  currentPage: 1,
  count: 0,
  filters: {},
};

export const fetchSubstances = createAsyncThunk(
  "admin-substance/fetch",
  async (params, thunkAPI) => {
    try {
      const response = await api.substance.getSubstances(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const adminSubstanceSlice = createSlice({
  name: "adminSubstance",
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
  },
  extraReducers(builder) {
    builder
      .addCase(fetchSubstances.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSubstances.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data.data.data;
        state.count = action.payload.data.data.count;
      })
      .addCase(fetchSubstances.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(upsertSubstance.fulfilled, (state, action) => {
        const subst = action.payload.data;

        const index = state.list.findIndex((i) => i.id === subst.id);
        if (index !== -1) {
          state.list[index] = subst;
        } else {
          state.list.push(subst);
        }
      });
  },
});

export const { reset, setFilters, setCurrentPage } =
  adminSubstanceSlice.actions;

export default adminSubstanceSlice.reducer;
