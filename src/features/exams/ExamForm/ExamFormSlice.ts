import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/api";

interface IExamFormSlice {
  status: string;
  error: string | null;
  admissionNumber: number | null;
  idSegment: number | null;
  examTypes: {
    status: string;
    error: string | null;
    list: any[];
  };
}

interface IExamItem {
  examType: string;
  examDate: string;
  result: number;
}

interface IExamCreateRequest {
  admissionNumber: number;
  exams: IExamItem[];
}

interface IExamDeleteRequest {
  admissionNumber: number;
  idExam: number;
}

const initialState: IExamFormSlice = {
  status: "idle",
  error: null,
  admissionNumber: null,
  idSegment: null,
  examTypes: {
    status: "idle",
    error: null,
    list: [],
  },
};

export const fetchExamTypes = createAsyncThunk(
  "exams/fetch-types",
  async (params: any, thunkAPI) => {
    try {
      const response = await api.exams.getExamTypes(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const createExam = createAsyncThunk(
  "exams/create",
  async (params: IExamCreateRequest, thunkAPI) => {
    try {
      const response = await api.exams.createExam(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const deleteExam = createAsyncThunk(
  "exams/delete",
  async (params: IExamDeleteRequest, thunkAPI) => {
    try {
      const response = await api.exams.deleteExam(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

const examFormSlice = createSlice({
  name: "examFormSlice",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setExamFormModal(state, action) {
      state.admissionNumber = action.payload.admissionNumber;
      state.idSegment = action.payload.idSegment;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchExamTypes.pending, (state) => {
        state.examTypes.status = "loading";
      })
      .addCase(fetchExamTypes.fulfilled, (state, action) => {
        state.examTypes.status = "succeeded";
        state.examTypes.list = action.payload.data.data;
      })
      .addCase(fetchExamTypes.rejected, (state, action) => {
        state.examTypes.status = "failed";
        state.examTypes.error = action.error.message!;
        state.examTypes.list = [];
      })
      .addCase(createExam.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createExam.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(createExam.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message!;
      });
  },
});

export const { reset, setExamFormModal } = examFormSlice.actions;

export default examFormSlice.reducer;
