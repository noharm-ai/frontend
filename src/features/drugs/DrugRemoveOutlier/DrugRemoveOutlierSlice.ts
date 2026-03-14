import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/api";

interface IDrugRemoveOutlierSlice {
  open: boolean;
  idSegment: number | null;
  idDrug: number | null;
  status: string;
  error: string | null;
}

const initialState: IDrugRemoveOutlierSlice = {
  open: false,
  idSegment: null,
  idDrug: null,
  status: "idle",
  error: null,
};

export const removeOutlier = createAsyncThunk(
  "drugRemoveOutlier/remove",
  async (
    params: { idSegment: number; idDrug: number },
    thunkAPI,
  ) => {
    try {
      const response = await api.scoreRemoveOutlier(params);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

const drugRemoveOutlierSlice = createSlice({
  name: "drugRemoveOutlier",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setDrugRemoveOutlierOpen(
      state,
      action: {
        payload: {
          open: boolean;
          idSegment?: number | null;
          idDrug?: number | null;
        };
      },
    ) {
      state.open = action.payload.open;
      if (action.payload.idSegment !== undefined) {
        state.idSegment = action.payload.idSegment;
      }
      if (action.payload.idDrug !== undefined) {
        state.idDrug = action.payload.idDrug;
      }
      if (!action.payload.open) {
        state.status = "idle";
        state.error = null;
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(removeOutlier.pending, (state) => {
        state.status = "loading";
      })
      .addCase(removeOutlier.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(removeOutlier.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? null;
      });
  },
});

export const { reset, setDrugRemoveOutlierOpen } =
  drugRemoveOutlierSlice.actions;

export default drugRemoveOutlierSlice.reducer;
