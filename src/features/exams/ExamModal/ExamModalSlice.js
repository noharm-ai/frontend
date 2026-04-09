import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/api";
import { transformExams } from "utils/transformers";

const rawInitialState = {
  status: "idle",
  error: null,
  list: [],
  filters: {},
  filtered: {
    status: "idle",
    result: { list: [] },
  },
  filterData: { types: [] },
};

const initialState = {
  status: "idle",
  error: null,
  list: [],
  admissionNumber: null,
  lastAdmissionNumber: null,
  raw: rawInitialState,
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
  },
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
        state.raw = rawInitialState;
      }

      state.admissionNumber = action.payload;

      if (action.payload) {
        state.lastAdmissionNumber = action.payload;
      }
    },
    clearExamsCache(state) {
      state.list = [];
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchExams.pending, (state) => {
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

export const { reset, setExamsModalAdmissionNumber, clearExamsCache } =
  examsModalSlice.actions;

export default examsModalSlice.reducer;
