import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/api";

const initialState = {
  status: "idle",
  error: null,
  units: {
    data: {},
    status: "idle",
  },
};

export const fetchUnits = createAsyncThunk(
  "drug-measure-unit/fetch-units",
  async (params, thunkAPI) => {
    const { access_token } = thunkAPI.getState().auth.identify;

    try {
      const idHospital = 1;
      const response = await api.getDrugResources(
        access_token,
        params.idDrug,
        params.idSegment,
        idHospital
      );

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const upsertDrugMeasureUnit = createAsyncThunk(
  "drug-measure-unit/upsert",
  async (params, thunkAPI) => {
    const { access_token } = thunkAPI.getState().auth.identify;

    try {
      const response = await api.updateDrugUnits(
        access_token,
        params.idSegment,
        params.idDrug,
        {
          idMeasureUnit: params.idMeasureUnit,
          factor: params.factor,
        }
      );
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const drugMeasureUnitsSlice = createSlice({
  name: "drugMeasureUnits",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchUnits.pending, (state, action) => {
        state.units.status = "loading";
      })
      .addCase(fetchUnits.fulfilled, (state, action) => {
        state.units.status = "succeeded";
        state.units.data = action.payload.data;
      })
      .addCase(fetchUnits.rejected, (state, action) => {
        state.status = "failed";
        state.units.error = action.error.message;
      })
      .addCase(upsertDrugMeasureUnit.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(upsertDrugMeasureUnit.fulfilled, (state, action) => {
        state.status = "succeeded";
      })
      .addCase(upsertDrugMeasureUnit.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default drugMeasureUnitsSlice.reducer;
