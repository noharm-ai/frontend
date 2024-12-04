import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/api";
import { transformExams } from "utils/transformers";

const initialState = {
  status: "idle",
  error: null,
  list: [],
  admissionNumber: null,
  lastAdmissionNumber: null,
};

export const fetchExams = createAsyncThunk(
  "exams-modal/fetch",
  async (params, thunkAPI) => {
    try {
      const response = await api.getExams(null, params.admissionNumber, params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const examsModalSlice = createSlice({
  name: "examsModalSlice",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setExamsModalAdmissionNumber(state, action) {
      if (action.payload && action.payload !== state.lastAdmissionNumber) {
        // clear list when new admissionNumber
        state.list = [];
      }

      state.admissionNumber = action.payload;

      if (action.payload) {
        state.lastAdmissionNumber = action.payload;
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchExams.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchExams.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = transformExams(action.payload.data.data);
      })
      .addCase(fetchExams.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        state.list = [];
      });
  },
});

export const { reset, setExamsModalAdmissionNumber } = examsModalSlice.actions;

export default examsModalSlice.reducer;
