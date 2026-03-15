import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/api";

interface IDrugSubstanceState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: IDrugSubstanceState = {
  status: "idle",
  error: null,
};

export const updateDrugSubstance = createAsyncThunk(
  "drugSubstance/update",
  async (
    { idDrug, sctid }: { idDrug: number; sctid: string | null },
    thunkAPI,
  ) => {
    try {
      const response = await api.drugs.updateSubstance({ idDrug, sctid });
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

const drugSubstanceSlice = createSlice({
  name: "drugSubstance",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(updateDrugSubstance.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateDrugSubstance.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(updateDrugSubstance.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? null;
      });
  },
});

export const { reset } = drugSubstanceSlice.actions;

export default drugSubstanceSlice.reducer;
