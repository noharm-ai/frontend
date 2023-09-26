import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/admin/api";

const initialState = {
  data: {},
  status: "idle",
  error: null,
  single: {
    data: null,
    status: "idle",
    error: null,
  },
};

export const fetchMemory = createAsyncThunk(
  "memory/fetch",
  async (params, thunkAPI) => {
    const { access_token } = thunkAPI.getState().auth.identify;

    const response = await api.getMemoryItems(access_token);
    return response.data;
  }
);

export const updateMemory = createAsyncThunk(
  "memory/update",
  async (memory, thunkAPI) => {
    const { access_token } = thunkAPI.getState().auth.identify;

    try {
      const response = await api.updateMemoryItem(access_token, memory);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const memorySlice = createSlice({
  name: "memory",
  initialState,
  reducers: {
    setMemoryValue(state, action) {
      state.data[action.payload.kind] = action.payload;
    },
    reset(state) {
      state = initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchMemory.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchMemory.fulfilled, (state, action) => {
        state.status = "succeeded";
        const obj = {};
        action.payload.data.forEach((i) => {
          obj[i.kind] = {
            key: i.key,
            kind: i.kind,
            value: i.value,
          };
        });

        state.data = obj;
      })
      .addCase(fetchMemory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(updateMemory.pending, (state, action) => {
        state.single.status = "loading";
      })
      .addCase(updateMemory.fulfilled, (state, action) => {
        state.single.status = "succeeded";
      })
      .addCase(updateMemory.rejected, (state, action) => {
        state.single.status = "failed";
        state.single.error = action.error.message;
      });
  },
});

export const { setMemoryValue, reset } = memorySlice.actions;

export default memorySlice.reducer;
