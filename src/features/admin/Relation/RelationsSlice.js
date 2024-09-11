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

export const fetchRelations = createAsyncThunk(
  "admin-relation/fetch",
  async (params, thunkAPI) => {
    try {
      const response = await api.relation.getRelations(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const upsertRelation = createAsyncThunk(
  "admin-relation/upsert",
  async (params, thunkAPI) => {
    try {
      const response = await api.relation.upsertRelation(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const adminRelationSlice = createSlice({
  name: "adminRelation",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setRelation(state, action) {
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
      .addCase(fetchRelations.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchRelations.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data.data.data;
        state.count = action.payload.data.data.count;
      })
      .addCase(fetchRelations.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(upsertRelation.pending, (state, action) => {
        state.single.status = "loading";
      })
      .addCase(upsertRelation.fulfilled, (state, action) => {
        state.single.status = "succeeded";
        const relation = action.payload.data;

        const index = state.list.findIndex(
          (i) =>
            i.sctida === relation.sctida &&
            i.sctidb === relation.sctidb &&
            i.kind === relation.kind
        );
        if (index !== -1) {
          state.list[index] = relation;
        } else {
          state.list.push(relation);
        }
      })
      .addCase(upsertRelation.rejected, (state, action) => {
        state.single.status = "failed";
        state.single.error = action.error.message;
      });
  },
});

export const { reset, setRelation, setFilters, setCurrentPage } =
  adminRelationSlice.actions;

export default adminRelationSlice.reducer;
