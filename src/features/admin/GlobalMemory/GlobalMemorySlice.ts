import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/admin/api";

interface IGlobalMemorySlice {
  data: any;
  status: string;
  error: string | null;
  single: {
    data: any | null;
    status: string;
    error: string | null;
  };
}

const initialState: IGlobalMemorySlice = {
  data: {},
  status: "idle",
  error: null,
  single: {
    data: null,
    status: "idle",
    error: null,
  },
};

export const fetchGlobalMemory = createAsyncThunk(
  "admin-global-memory/fetch",
  async (params: any, thunkAPI) => {
    try {
      const response = await api.globalMemory.getGlobalMemory(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const updateGlobalMemory = createAsyncThunk(
  "admin-global-memory/update",
  async (params: any, thunkAPI) => {
    try {
      const response = await api.globalMemory.updateGlobalMemory(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

const adminGlobalMemorySlice = createSlice({
  name: "adminGlobalMemory",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchGlobalMemory.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGlobalMemory.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data.data;

        const obj: any = {};
        action.payload.data.data.forEach((i: any) => {
          obj[i.kind] = {
            key: i.key,
            kind: i.kind,
            value: i.value,
          };
        });

        state.data = obj;
      })
      .addCase(fetchGlobalMemory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? null;
      })
      .addCase(updateGlobalMemory.pending, (state) => {
        state.single.status = "loading";
      })
      .addCase(updateGlobalMemory.fulfilled, (state) => {
        state.single.status = "succeeded";
      })
      .addCase(updateGlobalMemory.rejected, (state, action) => {
        state.single.status = "failed";
        state.single.error = action.error.message!;
      });
  },
});

export const { reset } = adminGlobalMemorySlice.actions;

export default adminGlobalMemorySlice.reducer;
