import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adminApi from "services/admin/api";
import api from "services/api";

const initialState = {
  list: [],
  status: "idle",
  error: null,
  filters: {
    hasPriceConversion: null,
    hasSubstance: null,
    hasDefaultUnit: null,
    hasPriceUnit: null,
    hasPrescription: true,
    term: null,
    idSegmentList: [],
  },
  currentPage: 1,
  count: 0,
  drugRef: {
    sctid: null,
    data: {},
  },
  drugForm: {
    data: null,
  },
  addDefaultUnits: {
    status: "idle",
    error: null,
  },
  copyConversion: {
    status: "idle",
    error: null,
  },
  copyAttributes: {
    status: "idle",
    error: null,
  },
  updateSubstance: {
    status: "idle",
    error: null,
  },
  addNewOutlier: {
    status: "idle",
    error: null,
  },
  calculateDosemax: {
    status: "idle",
    error: null,
  },
  updateSubstanceUnitFactor: {
    status: "idle",
    error: null,
  },
};

export const fetchDrugAttributes = createAsyncThunk(
  "admin-drug-attributes/fetch",
  async (params, thunkAPI) => {
    try {
      const response = await adminApi.getDrugAttributes(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const updatePriceFactor = createAsyncThunk(
  "admin-drug-attributes/update-price-factor",
  async (params, thunkAPI) => {
    try {
      const response = await adminApi.updatePriceFactor(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const updateSubstanceUnitFactor = createAsyncThunk(
  "admin-drug-attributes/update-substance-unit-factor",
  async (params, thunkAPI) => {
    try {
      const response =
        await adminApi.unitConversion.updateSubstanceUnitFactor(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const updateSubstance = createAsyncThunk(
  "admin-drug-attributes/update-substance",
  async (params, thunkAPI) => {
    try {
      const response = await api.drugs.updateSubstance(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const addDefaultUnits = createAsyncThunk(
  "admin-drug-attributes/add-default-units",
  async (params, thunkAPI) => {
    try {
      const response = await adminApi.unitConversion.addDefaultUnits(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const addNewOutlier = createAsyncThunk(
  "admin-drug-attributes/add-new-outlier",
  async (params, thunkAPI) => {
    try {
      const response = await adminApi.drugs.addNewOutlier(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const calculateDosemax = createAsyncThunk(
  "admin-drug-attributes/calculate-dosemax",
  async (params, thunkAPI) => {
    try {
      const response = await adminApi.drugs.calculateDosemax(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const copyConversion = createAsyncThunk(
  "admin-drug-attributes/copy-conversion",
  async (params, thunkAPI) => {
    try {
      const response = await adminApi.unitConversion.copyConversion(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const copyAttributes = createAsyncThunk(
  "admin-drug-attributes/copy-attributes",
  async (params, thunkAPI) => {
    try {
      const response = await adminApi.copyDrugAttributes(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const getDrugsMissingSubstance = createAsyncThunk(
  "admin-drug-attributes/get-missing-substance",
  async (params, thunkAPI) => {
    try {
      const response = await adminApi.drugs.getDrugsMissingSubstance(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const predictSubstance = createAsyncThunk(
  "admin-drug-attributes/predict-substance",
  async (params, thunkAPI) => {
    try {
      const response = await adminApi.drugs.predictSubstance(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
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
    setDrugRef(state, action) {
      state.drugRef.data = action.payload;
    },
    setDrugForm(state, action) {
      state.drugForm.data = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchDrugAttributes.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchDrugAttributes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data.data.list;
        state.count = action.payload.data.data.count;
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
      .addCase(addNewOutlier.pending, (state, action) => {
        state.addNewOutlier.status = "loading";
      })
      .addCase(addNewOutlier.fulfilled, (state, action) => {
        state.addNewOutlier.status = "succeeded";
      })
      .addCase(addNewOutlier.rejected, (state, action) => {
        state.addNewOutlier.status = "failed";
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
      .addCase(copyAttributes.pending, (state, action) => {
        state.copyAttributes.status = "loading";
      })
      .addCase(copyAttributes.fulfilled, (state, action) => {
        state.copyAttributes.status = "succeeded";
      })
      .addCase(copyAttributes.rejected, (state, action) => {
        state.copyAttributes.status = "failed";
      })
      .addCase(calculateDosemax.pending, (state, action) => {
        state.calculateDosemax.status = "loading";
      })
      .addCase(calculateDosemax.fulfilled, (state, action) => {
        state.calculateDosemax.status = "succeeded";
      })
      .addCase(calculateDosemax.rejected, (state, action) => {
        state.calculateDosemax.status = "failed";
      })
      .addCase(updateSubstanceUnitFactor.pending, (state, action) => {
        state.updateSubstanceUnitFactor.status = "loading";
      })
      .addCase(updateSubstanceUnitFactor.fulfilled, (state, action) => {
        state.updateSubstanceUnitFactor.status = "succeeded";

        const idDrug = action.payload.data.data.idDrug;
        const idSegment = action.payload.data.data.idSegment;
        const refMaxDose = action.payload.data.data.refMaxDose;
        const refMaxDoseWeight = action.payload.data.data.refMaxDoseWeight;

        state.list.forEach((d) => {
          if (d.idDrug === idDrug && d.idSegment === idSegment) {
            d.refMaxDose = refMaxDose;
            d.refMaxDoseWeight = refMaxDoseWeight;
          }
        });
      })
      .addCase(updateSubstanceUnitFactor.rejected, (state, action) => {
        state.updateSubstanceUnitFactor.status = "failed";
      })
      .addCase(updateSubstance.pending, (state, action) => {
        state.updateSubstance.status = "loading";
      })
      .addCase(updateSubstance.fulfilled, (state, action) => {
        state.updateSubstance.status = "succeeded";
        const updateList = action.payload.data.data.list;

        state.list.forEach((d, index) => {
          const updateIndex = updateList.findIndex(
            (item) =>
              item.idDrug === d.idDrug && item.idSegment === d.idSegment,
          );

          if (updateIndex !== -1) {
            state.list[index] = { ...d, ...updateList[updateIndex] };
          }
        });
      })
      .addCase(updateSubstance.rejected, (state, action) => {
        state.updateSubstance.status = "failed";
      });
  },
});

export const { reset, setFilters, setCurrentPage, setDrugRef, setDrugForm } =
  drugAttributesSlice.actions;

export default drugAttributesSlice.reducer;
