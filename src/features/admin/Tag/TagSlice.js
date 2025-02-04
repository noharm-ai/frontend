import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/admin/api";

const initialState = {
  list: [],
  status: "idle",
  error: null,
  single: {
    data: null,
    status: "idle",
    error: null,
  },
};

export const fetchTags = createAsyncThunk(
  "admin-tag/fetch",
  async (params, thunkAPI) => {
    try {
      const response = await api.tag.getTags(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const upsertTag = createAsyncThunk(
  "admin-tag/upsert",
  async (params, thunkAPI) => {
    try {
      const response = await api.tag.upsertTag(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const tagSlice = createSlice({
  name: "adminTag",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setTag(state, action) {
      state.single.data = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchTags.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data.data;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(upsertTag.pending, (state, action) => {
        state.single.status = "loading";
      })
      .addCase(upsertTag.fulfilled, (state, action) => {
        state.single.status = "succeeded";
        const record = action.payload.data;

        const index = state.list.findIndex(
          (i) => i.name === record.name && i.tagType === record.tagType
        );
        if (index !== -1) {
          state.list[index] = record;
        } else {
          state.list.push(record);
        }
      })
      .addCase(upsertTag.rejected, (state, action) => {
        state.single.status = "failed";
        state.single.error = action.error.message;
      });
  },
});

export const { reset, setTag } = tagSlice.actions;

export default tagSlice.reducer;
