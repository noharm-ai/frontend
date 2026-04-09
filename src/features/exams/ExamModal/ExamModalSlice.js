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
  }
);

export const fetchExamsRaw = createAsyncThunk(
  "exams-modal/fetch-raw",
  async ({ admissionNumber, idSegment }, thunkAPI) => {
    try {
      const response = await api.exams.getExamsRaw(admissionNumber, {
        idSegment,
      });

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
    resetRaw(state) {
      state.raw = rawInitialState;
    },
    setRawFilters(state, action) {
      state.raw.filters = action.payload;
    },
    setRawFilteredStatus(state, action) {
      state.raw.filtered.status = action.payload;
    },
    setRawFilteredResult(state, action) {
      state.raw.filtered.result = action.payload;
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
      })
      .addCase(fetchExamsRaw.pending, (state) => {
        state.raw.status = "loading";
      })
      .addCase(fetchExamsRaw.fulfilled, (state, action) => {
        state.raw.status = "succeeded";
        const data = action.payload.data.data;
        state.raw.list = data;
        state.raw.filterData.types = [
          ...new Set(data.map((item) => item.typeExam).filter(Boolean)),
        ];
      })
      .addCase(fetchExamsRaw.rejected, (state, action) => {
        state.raw.status = "failed";
        state.raw.error = action.error.message;
        state.raw.list = [];
      });
  },
});

export const {
  reset,
  setExamsModalAdmissionNumber,
  clearExamsCache,
  resetRaw,
  setRawFilters,
  setRawFilteredStatus,
  setRawFilteredResult,
} = examsModalSlice.actions;

export default examsModalSlice.reducer;
