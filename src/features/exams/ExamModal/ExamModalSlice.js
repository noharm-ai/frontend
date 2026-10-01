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
  // fkexame to scroll to and highlight when the modal opens (deep link)
  highlightExamId: null,
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
        // clear list when new admissionNumber; status goes back to idle so a
        // stale "succeeded" is not read as "loaded, and empty"
        state.list = [];
        state.status = "idle";
        state.raw = rawInitialState;
      }

      state.admissionNumber = action.payload;

      if (action.payload) {
        state.lastAdmissionNumber = action.payload;
      } else {
        state.highlightExamId = null;
      }
    },
    setExamsModalHighlight(state, action) {
      state.highlightExamId = action.payload;
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

export const {
  reset,
  setExamsModalAdmissionNumber,
  setExamsModalHighlight,
  clearExamsCache,
} = examsModalSlice.actions;

export default examsModalSlice.reducer;
