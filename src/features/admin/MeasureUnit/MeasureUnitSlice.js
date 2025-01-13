import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/admin/api";

const initialState = {
  list: [],
  status: "idle",
  error: null,
  single: {
    data: null,
    status: "idle",
    error: null,
  },
};

export const fetchMeasureUnits = createAsyncThunk(
  "admin-measureunit/fetch",
  async (params, thunkAPI) => {
    try {
      const response = await api.measureunits.getMeasureUnits(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const updateMeasureUnit = createAsyncThunk(
  "admin-measureunit/update",
  async (params, thunkAPI) => {
    try {
      const response = await api.measureunits.updateUnit(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const measureUnitSlice = createSlice({
  name: "adminMeasureUnit",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setMeasureUnit(state, action) {
      state.single.data = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchMeasureUnits.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchMeasureUnits.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data.data;
      })
      .addCase(fetchMeasureUnits.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(updateMeasureUnit.pending, (state, action) => {
        state.single.status = "loading";
      })
      .addCase(updateMeasureUnit.fulfilled, (state, action) => {
        state.single.status = "succeeded";
        const unit = action.payload.data[0];

        const index = state.list.findIndex((i) => i.id === unit.id);
        if (index !== -1) {
          state.list[index] = unit;
        } else {
          state.list.push(unit);
        }
      })
      .addCase(updateMeasureUnit.rejected, (state, action) => {
        state.single.status = "failed";
        state.single.error = action.error.message;
      });
  },
});

export const { reset, setMeasureUnit } = measureUnitSlice.actions;

export default measureUnitSlice.reducer;
