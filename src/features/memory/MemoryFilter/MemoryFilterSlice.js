import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/api";

const initialState = {};

export const fetchFilter = createAsyncThunk(
  "memory-filter/get",
  async (type, thunkAPI) => {
    try {
      const response = await api.getMemory(null, type);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const saveFilter = createAsyncThunk(
  "memory-filter/save",
  async (params, thunkAPI) => {
    try {
      const response = await api.putMemoryUnique(null, params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const memoryFilterSlice = createSlice({
  name: "memory-filter",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchFilter.pending, (state, action) => {
        state[action.meta.arg] = {
          ...(state[action.meta.arg] || {
            status: "idle",
            saveStatus: "idle",
            data: {},
          }),
        };
        state[action.meta.arg].status = "loading";
      })
      .addCase(fetchFilter.fulfilled, (state, action) => {
        state[action.meta.arg].status = "succeeded";
        state[action.meta.arg].data = action.payload.data;
      })
      .addCase(fetchFilter.rejected, (state, action) => {
        state[action.meta.arg].status = "failed";
        state[action.meta.arg].error = action.error.message;
      })
      .addCase(saveFilter.pending, (state, action) => {
        if (state[action.meta.arg.type]) {
          state[action.meta.arg.type].status = "loading";
        }
      })
      .addCase(saveFilter.rejected, (state, action) => {
        if (state[action.meta.arg.type]) {
          state[action.meta.arg.type].status = "failed";
        }
      })
      .addCase(saveFilter.fulfilled, (state, action) => {
        if (state[action.meta.arg.type]) {
          state[action.meta.arg.type].status = "succeeded";

          state[action.meta.arg.type].data = [
            {
              value: action.meta.arg.value,
            },
          ];
        }
      });
  },
});

export const { reset } = memoryFilterSlice.actions;

export default memoryFilterSlice.reducer;
