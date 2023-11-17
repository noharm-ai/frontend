import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/admin/api";

const initialState = {
  copyExams: {
    status: "idle",
    error: null,
  },
  addMostFrequent: {
    status: "idle",
    error: null,
  },
  fetchMostFrequent: {
    list: [],
    status: "idle",
    error: null,
  },
};

export const copyExams = createAsyncThunk(
  "admin-exam/copy-exams",
  async (params, thunkAPI) => {
    try {
      const response = await api.copyExams(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const addMostFrequent = createAsyncThunk(
  "admin-exam/add-most-frequent",
  async (params, thunkAPI) => {
    try {
      const response = await api.addMostFrequentExams(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const fetchMostFrequent = createAsyncThunk(
  "admin-exam/most-frequent",
  async (params, thunkAPI) => {
    try {
      const response = await api.getMostFrequentExams(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const examsSlice = createSlice({
  name: "adminExam",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(copyExams.pending, (state, action) => {
        state.copyExams.status = "loading";
      })
      .addCase(copyExams.fulfilled, (state, action) => {
        state.copyExams.status = "succeeded";
      })
      .addCase(copyExams.rejected, (state, action) => {
        state.copyExams.status = "failed";
      })
      .addCase(addMostFrequent.pending, (state, action) => {
        state.addMostFrequent.status = "loading";
      })
      .addCase(addMostFrequent.fulfilled, (state, action) => {
        state.addMostFrequent.status = "succeeded";
      })
      .addCase(addMostFrequent.rejected, (state, action) => {
        state.addMostFrequent.status = "failed";
      })
      .addCase(fetchMostFrequent.pending, (state, action) => {
        state.fetchMostFrequent.status = "loading";
      })
      .addCase(fetchMostFrequent.fulfilled, (state, action) => {
        state.fetchMostFrequent.status = "succeeded";
        state.fetchMostFrequent.list = action.payload.data.data;
      })
      .addCase(fetchMostFrequent.rejected, (state, action) => {
        state.fetchMostFrequent.status = "failed";
        state.fetchMostFrequent.error = action.error.message;
      });
  },
});

export const { reset } = examsSlice.actions;

export default examsSlice.reducer;
