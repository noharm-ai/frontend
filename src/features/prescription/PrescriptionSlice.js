import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/api";

const initialState = {
  evaluation: {
    status: "idle",
    error: null,
    data: {},
    active: false,
  },
  checkSummary: {
    prescription: null,
  },
  singleClinicalNotes: {
    status: "idle",
    error: null,
    data: {},
    id: null,
  },
  filters: [],
  perspective: "default",
  selectedRows: {
    active: false,
    list: [],
  },
};

export const getSingleClinicalNotes = createAsyncThunk(
  "prescription/single-clinical-notes",
  async (params, thunkAPI) => {
    try {
      const response = await api.clinicalNotes.getSingle(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const startEvaluation = createAsyncThunk(
  "prescription/start-evaluation",
  async (params, thunkAPI) => {
    try {
      const response = await api.prescription.startEvaluation(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const prescriptionSlice = createSlice({
  name: "prescription",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setPrescriptionFilters(state, action) {
      state.filters = action.payload;
    },
    setPrescriptionPerspective(state, action) {
      state.perspective = action.payload;
    },
    setCheckSummary(state, action) {
      state.checkSummary.prescription = action.payload;
    },
    setSelectedRowsActive(state, action) {
      state.selectedRows.active = action.payload;
      if (!action.payload) {
        state.selectedRows.list = [];
      }
    },
    setSelectedRows(state, action) {
      state.selectedRows.list = action.payload;
    },
    toggleSelectedRows(state, action) {
      const index = state.selectedRows.list.indexOf(action.payload);
      if (index !== -1) {
        state.selectedRows.list.splice(index, 1);
      } else {
        state.selectedRows.list.push(action.payload);
      }
    },
    selectSingleClinicalNotes(state, action) {
      state.singleClinicalNotes.id = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(startEvaluation.pending, (state, action) => {
        state.evaluation.status = "loading";
      })
      .addCase(startEvaluation.fulfilled, (state, action) => {
        state.evaluation.status = "succeeded";
        state.evaluation.data = action.payload.data;
      })
      .addCase(startEvaluation.rejected, (state, action) => {
        state.evaluation.status = "failed";
      })
      .addCase(getSingleClinicalNotes.pending, (state, action) => {
        state.singleClinicalNotes.status = "loading";
      })
      .addCase(getSingleClinicalNotes.fulfilled, (state, action) => {
        state.singleClinicalNotes.status = "succeeded";
        state.singleClinicalNotes.data = action.payload.data;
      })
      .addCase(getSingleClinicalNotes.rejected, (state, action) => {
        state.singleClinicalNotes.status = "failed";
      });
  },
});

export const {
  reset,
  setPrescriptionFilters,
  setCheckSummary,
  setPrescriptionPerspective,
  setSelectedRowsActive,
  toggleSelectedRows,
  setSelectedRows,
  selectSingleClinicalNotes,
} = prescriptionSlice.actions;

export default prescriptionSlice.reducer;
