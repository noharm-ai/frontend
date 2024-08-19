import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/admin/api";

const initialState = {
  exams: {
    list: [],
    status: "idle",
    error: null,
  },
  single: {
    data: null,
    status: "idle",
    error: null,
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
  examTypes: {
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

export const upsertExam = createAsyncThunk(
  "admin-exam/upsert",
  async (params, thunkAPI) => {
    try {
      const response = await api.exams.upsertExam(params);

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

export const listExamTypes = createAsyncThunk(
  "admin-exam/list-exams-types",
  async (params, thunkAPI) => {
    try {
      const response = await api.exams.getExamTypes(params);

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
    selectExam(state, action) {
      state.single.data = action.payload;
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
        state.exams.status = "failed";
        state.exams.error = action.error.message;
      })
      .addCase(listExams.pending, (state, action) => {
        state.exams.status = "loading";
      })
      .addCase(listExams.fulfilled, (state, action) => {
        state.exams.status = "succeeded";
        state.exams.list = action.payload.data.data;
      })
      .addCase(listExams.rejected, (state, action) => {
        state.exams.status = "failed";
        state.exams.error = action.error.message;
      })
      .addCase(listExamTypes.pending, (state, action) => {
        state.examTypes.status = "loading";
      })
      .addCase(listExamTypes.fulfilled, (state, action) => {
        state.examTypes.status = "succeeded";
        state.examTypes.list = action.payload.data.data;
      })
      .addCase(listExamTypes.rejected, (state, action) => {
        state.examTypes.status = "failed";
        state.examTypes.error = action.error.message;
      })
      .addCase(upsertExam.pending, (state, action) => {
        state.single.status = "loading";
      })
      .addCase(upsertExam.fulfilled, (state, action) => {
        state.single.status = "succeeded";
        const exam = action.payload.data.data;

        const index = state.exams.list.findIndex(
          (i) => i.type === exam.type && i.idSegment === exam.idSegment
        );

        if (index !== -1) {
          state.exams.list[index] = exam;
        } else {
          state.exams.list.push(exam);
        }
      })
      .addCase(upsertExam.rejected, (state, action) => {
        state.single.status = "failed";
        state.single.error = action.error.message;
      })
      .addCase(setExamsOrder.pending, (state, action) => {
        state.setExamsOrder.status = "loading";
      })
      .addCase(setExamsOrder.fulfilled, (state, action) => {
        state.setExamsOrder.status = "succeeded";
      })
      .addCase(setExamsOrder.rejected, (state, action) => {
        state.setExamsOrder.status = "failed";
      })
      .addCase(listExamsOrder.pending, (state, action) => {
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

export const { reset, selectExam } = examsSlice.actions;

export default examsSlice.reducer;
