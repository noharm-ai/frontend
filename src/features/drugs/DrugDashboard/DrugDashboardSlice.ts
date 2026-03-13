import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/api";

interface IDrugDashboardSlice {
  idSegment: number | null;
  idDrug: number | null;
  status: string;
  error: string | null;
  data: any | null;
}

const initialState: IDrugDashboardSlice = {
  idSegment: null,
  idDrug: null,
  status: "idle",
  error: null,
  data: null,
};

export const fetchDrugDashboard = createAsyncThunk(
  "drugDashboard/fetch",
  async (
    { idSegment, idDrug }: { idSegment: number; idDrug: number },
    thunkAPI,
  ) => {
    try {
      const response = await api.drugs.getDrugDashboard(idSegment, idDrug);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

const drugDashboardSlice = createSlice({
  name: "drugDashboard",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setIdSegment(state, action: { payload: number | null }) {
      state.idSegment = action.payload;
      state.idDrug = null;
      state.data = null;
      state.status = "idle";
      state.error = null;
    },
    setIdDrug(state, action: { payload: number | null }) {
      state.idDrug = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchDrugDashboard.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDrugDashboard.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
      })
      .addCase(fetchDrugDashboard.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? null;
      });
  },
});

export const { reset, setIdSegment, setIdDrug } = drugDashboardSlice.actions;

export default drugDashboardSlice.reducer;
