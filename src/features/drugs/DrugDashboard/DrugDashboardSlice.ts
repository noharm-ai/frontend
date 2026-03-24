import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/api";

interface IDrugDashboardSlice {
  idSegment: number | null;
  idDrug: string | null;
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

export const updateOutlierManualScore = createAsyncThunk(
  "drugDashboard/updateOutlierManualScore",
  async (
    {
      idOutlier,
      manualScore,
    }: { idOutlier: number; manualScore: number | null },
    thunkAPI,
  ) => {
    try {
      await api.drugs.updateOutlier(idOutlier, { manualScore });
      return { idOutlier, manualScore };
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

export const updateOutlierObs = createAsyncThunk(
  "drugDashboard/updateOutlierObs",
  async (
    { idOutlier, obs }: { idOutlier: number; obs: string },
    thunkAPI,
  ) => {
    try {
      await api.drugs.updateOutlier(idOutlier, { obs });
      return { idOutlier, obs };
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

export const fetchDrugDashboard = createAsyncThunk(
  "drugDashboard/fetch",
  async (
    { idSegment, idDrug }: { idSegment: number; idDrug: string },
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
    setIdDrug(state, action: { payload: string | null }) {
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
      })
      .addCase(updateOutlierManualScore.fulfilled, (state, action) => {
        if (state.data?.outliers) {
          const idx = state.data.outliers.findIndex(
            (o: any) => o.idOutlier === action.payload.idOutlier,
          );
          if (idx !== -1) {
            state.data.outliers[idx].manualScore = action.payload.manualScore;
          }
        }
      })
      .addCase(updateOutlierObs.fulfilled, (state, action) => {
        if (state.data?.outliers) {
          const idx = state.data.outliers.findIndex(
            (o: any) => o.idOutlier === action.payload.idOutlier,
          );
          if (idx !== -1) {
            state.data.outliers[idx].obs = action.payload.obs;
          }
        }
      });
  },
});

export const { reset, setIdSegment, setIdDrug } = drugDashboardSlice.actions;

export default drugDashboardSlice.reducer;
