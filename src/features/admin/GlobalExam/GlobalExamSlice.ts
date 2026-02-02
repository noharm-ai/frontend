import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/admin/api";

export interface IGlobalExamFormBaseFields {
  tp_exam?: string;
  name: string;
  initials: string;
  measureunit: string;
  active: boolean;
  min_adult: number;
  max_adult: number;
  ref_adult: string;
  min_pediatric: number;
  max_pediatric: number;
  ref_pediatric: string;
  newGlobalExam?: boolean;
}

interface IGlobalExamSlice {
  list: any[];
  status: string;
  error: string | null;
  single: {
    data: IGlobalExamFormBaseFields | null;
    status: string;
    error: string | null;
  };
}

const initialState: IGlobalExamSlice = {
  list: [],
  status: "idle",
  error: null,
  single: {
    data: null,
    status: "idle",
    error: null,
  },
};

export const fetchGlobalExams = createAsyncThunk(
  "admin-global-exam/fetch",
  async (params: { active?: boolean; term?: string }, thunkAPI) => {
    try {
      const response = await api.globalExam.getGlobalExams(params);
      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const upsertGlobalExam = createAsyncThunk(
  "admin-global-exam/upsert",
  async (params: IGlobalExamFormBaseFields, thunkAPI) => {
    try {
      const response = await api.globalExam.upsertGlobalExam(params);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

const globalExamSlice = createSlice({
  name: "adminGlobalExam",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setGlobalExam(state, action) {
      state.single.data = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchGlobalExams.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGlobalExams.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data.data;
      })
      .addCase(fetchGlobalExams.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? null;
      })
      .addCase(upsertGlobalExam.pending, (state) => {
        state.single.status = "loading";
      })
      .addCase(upsertGlobalExam.fulfilled, (state) => {
        state.single.status = "succeeded";
      })
      .addCase(upsertGlobalExam.rejected, (state, action) => {
        state.single.status = "failed";
        state.single.error = action.error.message!;
      });
  },
});

export const { reset, setGlobalExam } = globalExamSlice.actions;

export default globalExamSlice.reducer;
