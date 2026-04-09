import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/admin/api";

export interface IExamFormFields {
  idSegment?: number;
  type?: string;
  name: string;
  initials: string;
  ref: string;
  min: number;
  max: number;
  active: boolean;
  tpExamRef?: string;
  new?: boolean;
}

interface IExamFormSlice {
  single: {
    data: IExamFormFields | null;
    status: string;
    error: string | null;
  };
  examTypes: {
    list: string[];
    status: string;
    error: string | null;
  };
  globalExams: {
    list: any[];
    status: string;
    error: string | null;
  };
}

const initialState: IExamFormSlice = {
  single: {
    data: null,
    status: "idle",
    error: null,
  },
  examTypes: {
    list: [],
    status: "idle",
    error: null,
  },
  globalExams: {
    list: [],
    status: "idle",
    error: null,
  },
};

export const fetchExam = createAsyncThunk(
  "admin-exam-form/fetch",
  async (
    params: { idSegment: number; examType: string },
    thunkAPI
  ) => {
    try {
      const response = await api.exams.getExam(params);
      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const saveExam = createAsyncThunk(
  "admin-exam-form/save",
  async (params: IExamFormFields, thunkAPI) => {
    try {
      const response = await api.exams.upsertExam(params);
      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const fetchExamTypes = createAsyncThunk(
  "admin-exam-form/fetch-exam-types",
  async (_, thunkAPI) => {
    try {
      const response = await api.exams.getExamTypes({});
      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const fetchGlobalExams = createAsyncThunk(
  "admin-exam-form/fetch-global-exams",
  async (_, thunkAPI) => {
    try {
      const response = await api.exams.getGlobalExams({});
      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

const examFormSlice = createSlice({
  name: "adminExamForm",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setExam(state, action) {
      state.single.data = action.payload;
      state.single.status = "idle";
      state.single.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchExam.pending, (state) => {
        state.single.status = "loading";
      })
      .addCase(fetchExam.fulfilled, (state, action) => {
        state.single.status = "succeeded";
        state.single.data = action.payload.data.data;
      })
      .addCase(fetchExam.rejected, (state, action) => {
        state.single.status = "failed";
        state.single.error = action.error.message ?? null;
      })
      .addCase(saveExam.pending, (state) => {
        state.single.status = "loading";
      })
      .addCase(saveExam.fulfilled, (state) => {
        state.single.status = "succeeded";
      })
      .addCase(saveExam.rejected, (state, action) => {
        state.single.status = "failed";
        state.single.error = action.error.message ?? null;
      })
      .addCase(fetchExamTypes.pending, (state) => {
        state.examTypes.status = "loading";
      })
      .addCase(fetchExamTypes.fulfilled, (state, action) => {
        state.examTypes.status = "succeeded";
        state.examTypes.list = action.payload.data.data;
      })
      .addCase(fetchExamTypes.rejected, (state, action) => {
        state.examTypes.status = "failed";
        state.examTypes.error = action.error.message ?? null;
      })
      .addCase(fetchGlobalExams.pending, (state) => {
        state.globalExams.status = "loading";
      })
      .addCase(fetchGlobalExams.fulfilled, (state, action) => {
        state.globalExams.status = "succeeded";
        state.globalExams.list = action.payload.data.data;
      })
      .addCase(fetchGlobalExams.rejected, (state, action) => {
        state.globalExams.status = "failed";
        state.globalExams.error = action.error.message ?? null;
      });
  },
});

export const { reset, setExam } = examFormSlice.actions;

export default examFormSlice.reducer;
