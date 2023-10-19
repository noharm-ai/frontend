import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/api";

const initialState = {};

export const fetchDraft = createAsyncThunk(
  "memory-draft/get",
  async (type, thunkAPI) => {
    const { access_token } = thunkAPI.getState().auth.identify;

    try {
      const response = await api.getMemory(access_token, type);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const saveDraft = createAsyncThunk(
  "memory-draft/save",
  async (params, thunkAPI) => {
    const { access_token } = thunkAPI.getState().auth.identify;

    try {
      const response = await api.putMemoryUnique(access_token, params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const memoryDraftSlice = createSlice({
  name: "memory-draft",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchDraft.pending, (state, action) => {
        state[action.meta.arg] = {
          ...(state[action.meta.arg] || {
            status: "idle",
            saveStatus: "idle",
            data: {},
          }),
        };
        state[action.meta.arg].status = "loading";
      })
      .addCase(fetchDraft.fulfilled, (state, action) => {
        state[action.meta.arg].status = "succeeded";
        state[action.meta.arg].data = action.payload.data;
      })
      .addCase(fetchDraft.rejected, (state, action) => {
        state[action.meta.arg].status = "failed";
        state[action.meta.arg].error = action.error.message;
      })
      .addCase(saveDraft.pending, (state, action) => {
        if (state[action.meta.arg.type]) {
          state[action.meta.arg.type].status = "loading";
        }
      })
      .addCase(saveDraft.rejected, (state, action) => {
        if (state[action.meta.arg.type]) {
          state[action.meta.arg.type].status = "failed";
        }
      })
      .addCase(saveDraft.fulfilled, (state, action) => {
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

export const { reset } = memoryDraftSlice.actions;

export default memoryDraftSlice.reducer;
