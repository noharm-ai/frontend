import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/admin/api";

const initialState = {
  copyExams: {
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
      });
  },
});

export const { reset } = examsSlice.actions;

export default examsSlice.reducer;
