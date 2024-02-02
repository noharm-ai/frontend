import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adminApi from "services/admin/api";
import api from "services/api";

const initialState = {
  list: [],
  filteredList: [],
  status: "idle",
  error: null,
  filters: {
    hasConversion: null,
  },
  currentPage: 1,
  count: 0,
  addDefaultUnits: {
    status: "idle",
    error: null,
  },
  fetchDrugAttributes: {
    status: "idle",
    error: null,
    data: {},
    selected: null,
  },
};

export const fetchConversionList = createAsyncThunk(
  "admin-unit-conversion/fetch",
  async (params, thunkAPI) => {
    try {
      const response = await adminApi.unitConversion.getConversionList(params);

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

export const fetchDrugAttributes = createAsyncThunk(
  "admin-unit-conversion//fetch-drug-attributes",
  async (params, thunkAPI) => {
    try {
      const response = await api.drugs.getDrugAttributes(
        params.idSegment,
        params.idDrug
      );

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

// export const addDefaultUnits = createAsyncThunk(
//   "admin-unit-conversion/add-default-units",
//   async (params, thunkAPI) => {
//     try {
//       const response = await adminApi.addDefaultUnits(params);

//       return response;
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.response.data);
//     }
//   }
// );

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
    selectDrugRef(state, action) {
      state.fetchDrugAttributes.selected = action.payload;
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
      .addCase(fetchDrugAttributes.pending, (state, action) => {
        state.fetchDrugAttributes.status = "loading";
      })
      .addCase(fetchDrugAttributes.fulfilled, (state, action) => {
        state.fetchDrugAttributes.status = "succeeded";
        state.fetchDrugAttributes.data = action.payload.data.data;
      })
      .addCase(fetchDrugAttributes.rejected, (state, action) => {
        state.fetchDrugAttributes.status = "failed";
        state.fetchDrugAttributes.error = action.error.message;
        state.fetchDrugAttributes.data = {};
      });
  },
});

export const {
  reset,
  setFilters,
  setCurrentPage,
  updateListFactors,
  setFilteredList,
  selectDrugRef,
} = unitConversionSlice.actions;

export default unitConversionSlice.reducer;
