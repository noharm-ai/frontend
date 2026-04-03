import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/api";

const initialState = {
  records: [] as any[],
  currentRecord: null as any,
  status: "idle" as string,
  saveStatus: "idle" as string,
  error: null as string | null,
};

export const fetchEditableMemories = createAsyncThunk(
  "memory-list/fetch",
  async (_, thunkAPI: any) => {
    try {
      const response = await api.memoryRecords.getEditableMemories();
      return response.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const fetchMemoryRecord = createAsyncThunk(
  "memory-list/fetchOne",
  async (id: number | string, thunkAPI: any) => {
    try {
      const response = await api.memoryRecords.getMemoryRecord(id);
      return response.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const saveMemoryRecord = createAsyncThunk(
  "memory-list/save",
  async (params: any, thunkAPI: any) => {
    try {
      const response = await api.memoryRecords.putRecord(params);
      return response.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

const memoryListSlice = createSlice({
  name: "memory-list",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchEditableMemories.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchEditableMemories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.records = action.payload.data;
      })
      .addCase(fetchEditableMemories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? null;
      })
      .addCase(fetchMemoryRecord.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMemoryRecord.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentRecord = action.payload.data;
      })
      .addCase(fetchMemoryRecord.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? null;
      })
      .addCase(saveMemoryRecord.pending, (state) => {
        state.saveStatus = "loading";
      })
      .addCase(saveMemoryRecord.fulfilled, (state) => {
        state.saveStatus = "succeeded";
      })
      .addCase(saveMemoryRecord.rejected, (state) => {
        state.saveStatus = "failed";
      });
  },
});

export const { reset } = memoryListSlice.actions;
export default memoryListSlice.reducer;
