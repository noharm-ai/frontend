import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/api";

interface IDrugGeneratePrescriptionHistorySlice {
  open: boolean;
  idDrug: number | null;
  idSegment: number | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: IDrugGeneratePrescriptionHistorySlice = {
  open: false,
  idDrug: null,
  idSegment: null,
  status: "idle",
  error: null,
};

export const addPrescriptionHistory = createAsyncThunk(
  "drugGeneratePrescriptionHistory/addHistory",
  async (params: { idDrug: number; idSegment: number }, thunkAPI) => {
    try {
      const response = await api.scoreAddHistory(params);
      return response.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

const drugGeneratePrescriptionHistorySlice = createSlice({
  name: "drugGeneratePrescriptionHistory",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setDrugGeneratePrescriptionHistoryOpen(
      state,
      action: {
        payload: {
          open: boolean;
          idDrug?: number | null;
          idSegment?: number | null;
        };
      },
    ) {
      state.open = action.payload.open;
      if (action.payload.open) {
        state.idDrug = action.payload.idDrug ?? null;
        state.idSegment = action.payload.idSegment ?? null;
      } else {
        state.status = "idle";
        state.error = null;
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(addPrescriptionHistory.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addPrescriptionHistory.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(addPrescriptionHistory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? null;
      });
  },
});

export const { reset, setDrugGeneratePrescriptionHistoryOpen } =
  drugGeneratePrescriptionHistorySlice.actions;

export default drugGeneratePrescriptionHistorySlice.reducer;
