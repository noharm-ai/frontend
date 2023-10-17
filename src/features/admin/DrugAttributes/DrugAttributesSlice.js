import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/admin/api";

const initialState = {
  list: [],
  status: "idle",
  error: null,
  filters: {
    hasPriceConversion: null,
    hasSubstance: null,
    hasDefaultUnit: null,
    hasPrescription: true,
    term: null,
    idSegmentList: [],
  },
  currentPage: 1,
  count: 0,
  addDefaultUnits: {
    status: "idle",
    error: null,
  },
  copyConversion: {
    status: "idle",
    error: null,
  },
  updateSubstance: {
    status: "idle",
    error: null,
  },
};

export const fetchDrugAttributes = createAsyncThunk(
  "admin-drug-attributes/fetch",
  async (params, thunkAPI) => {
    try {
      const response = await api.getDrugAttributes(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const updatePriceFactor = createAsyncThunk(
  "admin-drug-attributes/update-price-factor",
  async (params, thunkAPI) => {
    try {
      const response = await api.updatePriceFactor(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const updateSubstance = createAsyncThunk(
  "admin-drug-attributes/update-substance",
  async (params, thunkAPI) => {
    try {
      const response = await api.updateSubstance(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const addDefaultUnits = createAsyncThunk(
  "admin-drug-attributes/add-default-units",
  async (params, thunkAPI) => {
    try {
      const response = await api.addDefaultUnits(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const copyConversion = createAsyncThunk(
  "admin-drug-attributes/copy-conversion",
  async (params, thunkAPI) => {
    try {
      const response = await api.copyConversion(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const drugAttributesSlice = createSlice({
  name: "drugAttributesSlice",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setFilters(state, action) {
      state.filters = action.payload;
    },
    setCurrentPage(state, action) {
      state.currentPage = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchDrugAttributes.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchDrugAttributes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data.data;
        state.count = action.payload.data.count;
      })
      .addCase(fetchDrugAttributes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        state.list = [];
      })
      .addCase(updatePriceFactor.fulfilled, (state, action) => {
        const data = action.payload.data.data;

        state.list.forEach((d) => {
          if (d.idSegment === data.idSegment && d.idDrug === data.idDrug) {
            d.measureUnitPriceFactor = data.factor;
          }
        });
      })
      .addCase(addDefaultUnits.pending, (state, action) => {
        state.addDefaultUnits.status = "loading";
      })
      .addCase(addDefaultUnits.fulfilled, (state, action) => {
        state.addDefaultUnits.status = "succeeded";
      })
      .addCase(addDefaultUnits.rejected, (state, action) => {
        state.addDefaultUnits.status = "failed";
      })
      .addCase(copyConversion.pending, (state, action) => {
        state.copyConversion.status = "loading";
      })
      .addCase(copyConversion.fulfilled, (state, action) => {
        state.copyConversion.status = "succeeded";
      })
      .addCase(copyConversion.rejected, (state, action) => {
        state.copyConversion.status = "failed";
      })
      .addCase(updateSubstance.pending, (state, action) => {
        state.updateSubstance.status = "loading";
      })
      .addCase(updateSubstance.fulfilled, (state, action) => {
        state.updateSubstance.status = "succeeded";

        const idDrug = action.payload.data.data.idDrug;
        const sctid = action.payload.data.data.sctid;

        state.list.forEach((d) => {
          if (d.idDrug === idDrug) {
            d.sctid = sctid;
          }
        });
      })
      .addCase(updateSubstance.rejected, (state, action) => {
        state.updateSubstance.status = "failed";
      });
  },
});

export const { reset, setFilters, setCurrentPage } =
  drugAttributesSlice.actions;

export default drugAttributesSlice.reducer;
