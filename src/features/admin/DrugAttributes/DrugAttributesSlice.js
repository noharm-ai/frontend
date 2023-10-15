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
      });
  },
});

export const { reset, setFilters, setCurrentPage } =
  drugAttributesSlice.actions;

export default drugAttributesSlice.reducer;
