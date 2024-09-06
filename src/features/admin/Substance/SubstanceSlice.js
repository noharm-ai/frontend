import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/admin/api";

const initialState = {
  list: [],
  status: "idle",
  error: null,
  currentPage: 1,
  count: 0,
  single: {
    data: null,
    status: "idle",
    error: null,
  },
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

export const upsertSubstance = createAsyncThunk(
  "admin-substance/upsert",
  async (params, thunkAPI) => {
    try {
      const response = await api.substance.upsertSubstance(params);

      return response.data;
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
    setSubstance(state, action) {
      state.single.data = action.payload;
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
      .addCase(fetchSubstances.pending, (state, action) => {
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
      .addCase(upsertSubstance.pending, (state, action) => {
        state.single.status = "loading";
      })
      .addCase(upsertSubstance.fulfilled, (state, action) => {
        state.single.status = "succeeded";
        const freq = action.payload.data[0];

        const index = state.list.findIndex((i) => i.id === freq.id);
        if (index !== -1) {
          state.list[index] = freq;
        } else {
          state.list.push(freq);
        }
      })
      .addCase(upsertSubstance.rejected, (state, action) => {
        state.single.status = "failed";
        state.single.error = action.error.message;
      });
  },
});

export const { reset, setSubstance, setFilters, setCurrentPage } =
  adminSubstanceSlice.actions;

export default adminSubstanceSlice.reducer;
