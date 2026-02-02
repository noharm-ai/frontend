import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/api";

const initialState = {
  status: "idle",
  error: null,
  data: {},
  saveDrugAttributes: {
    status: "idle",
    error: null,
  },
};

export const fetchDrugAttributes = createAsyncThunk(
  "drug-attributes-form/fetch",
  async (params, thunkAPI) => {
    try {
      const response = await api.drugs.getDrugAttributes(
        params.idSegment,
        params.idDrug,
      );

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const saveDrugAttributes = createAsyncThunk(
  "drug-attributes-form/save",
  async (params, thunkAPI) => {
    try {
      const response = await api.drugs.saveDrugAttributes(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

const drugAttributesFormSlice = createSlice({
  name: "drugAttributesForm",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchDrugAttributes.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDrugAttributes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
        state.error = null;
      })
      .addCase(fetchDrugAttributes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(saveDrugAttributes.pending, (state, action) => {
        state.saveDrugAttributes.status = "loading";
      })
      .addCase(saveDrugAttributes.fulfilled, (state, action) => {
        state.saveDrugAttributes.status = "succeeded";
      })
      .addCase(saveDrugAttributes.rejected, (state, action) => {
        state.saveDrugAttributes.status = "failed";
        state.saveDrugAttributes.error = action.error.message;
      });
  },
});

export const { reset } = drugAttributesFormSlice.actions;

export default drugAttributesFormSlice.reducer;
