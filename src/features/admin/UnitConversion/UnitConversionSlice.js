import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adminApi from "services/admin/api";

const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

const initialState = {
  list: [],
  filteredList: [],
  status: "idle",
  error: null,
  filters: {
    hasConversion: null,
    idSegment: null,
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
};

export const fetchConversionList = createAsyncThunk(
  "admin-unit-conversion/fetch",
  async (params, thunkAPI) => {
    try {
      const response = await adminApi.unitConversion.getConversionList(params);

      const conversionList = response.data.data;

      const chunkSize = Math.ceil(conversionList.length / 4);
      const chunks = chunkArray(conversionList, chunkSize);

      const combinedPredictions = [];
      for (const chunk of chunks) {
        const predictionResponse =
          await adminApi.unitConversion.getConversionPredictions({
            conversionList: chunk,
          });
        combinedPredictions.push(...predictionResponse.data.data);
      }

      const conversionListWithPredictions = conversionList.map((item) => {
        const prediction = combinedPredictions.find(
          (pred) => pred.id === item.id
        );

        if (prediction) {
          item.prediction = prediction.prediction;
          item.probability = prediction.probability;
        }

        return item;
      });

      return {
        data: {
          data: conversionListWithPredictions,
        },
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const fetchConversionPrediction = createAsyncThunk(
  "admin-unit-conversion/fetch-prediction",
  async (params, thunkAPI) => {
    try {
      const response = await adminApi.unitConversion.getConversionPredictions(
        params
      );

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const saveConversions = createAsyncThunk(
  "admin-unit-conversion/save-conversions",
  async (params, thunkAPI) => {
    try {
      const response = await adminApi.unitConversion.saveConversions(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const addDefaultUnits = createAsyncThunk(
  "admin-unit-conversion/add-default-units",
  async (params, thunkAPI) => {
    try {
      const response = await adminApi.unitConversion.addDefaultUnits(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const copyConversion = createAsyncThunk(
  "admin-unit-conversion/copy-conversion",
  async (params, thunkAPI) => {
    try {
      const response = await adminApi.unitConversion.copyConversion(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const unitConversionSlice = createSlice({
  name: "unitConversionSlice",
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
    setFilteredList(state, action) {
      state.filteredList = action.payload;
    },
    updateListFactors(state, action) {
      const filteredDrugIndex = state.filteredList.findIndex(
        (d) => d.idDrug === action.payload[0].idDrug
      );

      action.payload.forEach((item) => {
        const index = state.list.findIndex(
          (uc) =>
            uc.idMeasureUnit === item.idMeasureUnit && uc.idDrug === item.idDrug
        );
        if (index !== -1) {
          state.list[index].factor = item.factor;
        } else {
          console.error("index not found", item);
        }

        if (filteredDrugIndex !== -1) {
          const filteredItemIndex = state.filteredList[
            filteredDrugIndex
          ].data.findIndex((uc) => uc.idMeasureUnit === item.idMeasureUnit);

          if (filteredItemIndex !== -1) {
            state.filteredList[filteredDrugIndex].data[
              filteredItemIndex
            ].factor = item.factor;
          } else {
            console.error("index not found (filtered)", item);
          }
        }
      });
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchConversionList.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchConversionList.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data.data;
        state.count = action.payload.data.count;
      })
      .addCase(fetchConversionList.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        state.list = [];
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
      });
  },
});

export const {
  reset,
  setFilters,
  setCurrentPage,
  updateListFactors,
  setFilteredList,
} = unitConversionSlice.actions;

export default unitConversionSlice.reducer;
