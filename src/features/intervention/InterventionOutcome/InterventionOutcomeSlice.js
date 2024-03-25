import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/api";

const initialState = {
  selectedIntervention: {
    open: false,
    idIntervention: null,
    outcome: null,
  },
  status: "idle",
  error: null,
  data: {},
  save: {
    status: "idle",
    error: null,
  },
};

export const fetchInterventionOutcomeData = createAsyncThunk(
  "intervention-outcome/get-data",
  async (params, thunkAPI) => {
    try {
      const response = await api.intervention.getOutcomeData(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const interventionOutcomeSlice = createSlice({
  name: "intervention-outcome",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setSelectedIntervention(state, action) {
      state.selectedIntervention = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchInterventionOutcomeData.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchInterventionOutcomeData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
      })
      .addCase(fetchInterventionOutcomeData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { reset, setSelectedIntervention } =
  interventionOutcomeSlice.actions;

export default interventionOutcomeSlice.reducer;
