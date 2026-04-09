import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/admin/api";

const initialState = {
  exams: {
    list: [],
    status: "idle",
    error: null,
    lastParams: null,
  },
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
  setExamsOrder: {
    status: "idle",
    error: null,
    list: [],
  },
};

export const listExams = createAsyncThunk(
  "admin-exam/list-exams",
  async (params, thunkAPI) => {
    try {
      const response = await api.exams.listExams(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const listExamsOrder = createAsyncThunk(
  "admin-exam/list-exams-order",
  async (params, thunkAPI) => {
    try {
      const response = await api.exams.listExams(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const setExamsOrder = createAsyncThunk(
  "admin-exam/order",
  async (params, thunkAPI) => {
    try {
      const response = await api.exams.setExamsOrder(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const copyExams = createAsyncThunk(
  "admin-exam/copy-exams",
  async (params, thunkAPI) => {
    try {
      const response = await api.exams.copyExams(params);

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
      const response = await api.exams.addMostFrequentExams(params);

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
      const response = await api.exams.getMostFrequentExams(params);

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
      .addCase(copyExams.pending, (state) => {
        state.copyExams.status = "loading";
      })
      .addCase(copyExams.fulfilled, (state) => {
        state.copyExams.status = "succeeded";
      })
      .addCase(copyExams.rejected, (state) => {
        state.copyExams.status = "failed";
      })
      .addCase(addMostFrequent.pending, (state) => {
        state.addMostFrequent.status = "loading";
      })
      .addCase(addMostFrequent.fulfilled, (state) => {
        state.addMostFrequent.status = "succeeded";
      })
      .addCase(addMostFrequent.rejected, (state) => {
        state.addMostFrequent.status = "failed";
      })
      .addCase(fetchMostFrequent.pending, (state) => {
        state.fetchMostFrequent.status = "loading";
      })
      .addCase(fetchMostFrequent.fulfilled, (state, action) => {
        state.fetchMostFrequent.status = "succeeded";
        state.fetchMostFrequent.list = action.payload.data.data;
      })
      .addCase(fetchMostFrequent.rejected, (state, action) => {
        state.exams.status = "failed";
        state.exams.error = action.error.message;
      })
      .addCase(listExams.pending, (state, action) => {
        state.exams.status = "loading";
        state.exams.lastParams = action.meta.arg;
      })
      .addCase(listExams.fulfilled, (state, action) => {
        state.exams.status = "succeeded";
        state.exams.list = action.payload.data.data;
      })
      .addCase(listExams.rejected, (state, action) => {
        state.exams.status = "failed";
        state.exams.error = action.error.message;
      })
      .addCase(setExamsOrder.pending, (state) => {
        state.setExamsOrder.status = "loading";
      })
      .addCase(setExamsOrder.fulfilled, (state) => {
        state.setExamsOrder.status = "succeeded";
      })
      .addCase(setExamsOrder.rejected, (state) => {
        state.setExamsOrder.status = "failed";
      })
      .addCase(listExamsOrder.pending, (state) => {
        state.setExamsOrder.status = "loading";
      })
      .addCase(listExamsOrder.fulfilled, (state, action) => {
        state.setExamsOrder.status = "succeeded";
        state.setExamsOrder.list = action.payload.data.data;
      })
      .addCase(listExamsOrder.rejected, (state, action) => {
        state.setExamsOrder.status = "failed";
        state.setExamsOrder.error = action.error.message;
      });
  },
});

export const { reset } = examsSlice.actions;

export default examsSlice.reducer;
