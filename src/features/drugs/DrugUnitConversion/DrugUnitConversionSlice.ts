import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/api";

export interface IConversionItem {
  drugMeasureUnitNh: string | null;
  factor: number | null;
  id: string;
  idMeasureUnit: string;
  measureUnit: string | null;
  default: boolean;
}

export interface IConversionData {
  conversionList: IConversionItem[];
  idDrug: string;
  name: string;
  substanceMeasureUnit: string | null;
}

interface IDrugUnitConversionSlice {
  open: boolean;
  idDrug: string | null;
  status: string;
  savingStatus: string;
  error: string | null;
  data: IConversionData | null;
}

const initialState: IDrugUnitConversionSlice = {
  open: false,
  idDrug: null,
  status: "idle",
  savingStatus: "idle",
  error: null,
  data: null,
};

export const saveUnitConversion = createAsyncThunk(
  "drugUnitConversion/save",
  async (
    payload: {
      idDrug: string;
      conversion_list: { id_measure_unit: string; factor: number | null }[];
    },
    thunkAPI,
  ) => {
    try {
      const response = await api.drugs.saveUnitConversion(payload.idDrug, {
        conversion_list: payload.conversion_list,
      });
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

export const fetchDrugUnitConversion = createAsyncThunk(
  "drugUnitConversion/fetch",
  async (idDrug: string, thunkAPI) => {
    try {
      const response = await api.drugs.getDrugUnitConversion(idDrug);
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

const drugUnitConversionSlice = createSlice({
  name: "drugUnitConversion",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setDrugUnitConversionOpen(
      state,
      action: { payload: { open: boolean; idDrug?: string | null } },
    ) {
      state.open = action.payload.open;
      if (action.payload.idDrug !== undefined) {
        state.idDrug = action.payload.idDrug;
      }
      if (!action.payload.open) {
        state.status = "idle";
        state.data = null;
        state.error = null;
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchDrugUnitConversion.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDrugUnitConversion.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
      })
      .addCase(fetchDrugUnitConversion.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? null;
      })
      .addCase(saveUnitConversion.pending, (state) => {
        state.savingStatus = "loading";
      })
      .addCase(saveUnitConversion.fulfilled, (state) => {
        state.savingStatus = "succeeded";
      })
      .addCase(saveUnitConversion.rejected, (state) => {
        state.savingStatus = "failed";
      });
  },
});

export const { reset, setDrugUnitConversionOpen } =
  drugUnitConversionSlice.actions;

export default drugUnitConversionSlice.reducer;
