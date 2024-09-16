import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adminApi from "services/admin/api";

const initialState = {
  sctid: null,
  status: "idle",
  error: null,
  data: {},
};

export const fetchDrugReference = createAsyncThunk(
  "admin-drug-reference/fetch",
  async (params, thunkAPI) => {
    try {
      const response = await adminApi.drugs.getDrugRef(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const drugReferenceDrawerSlice = createSlice({
  name: "drugReferenceDrawerSlice",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setDrawerSctid(state, action) {
      state.sctid = action.payload;

      if (!action.payload) {
        state.data = {};
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchDrugReference.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchDrugReference.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data.data;
      })
      .addCase(fetchDrugReference.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        state.data = {};
      });
  },
});

export const { reset, setDrawerSctid } = drugReferenceDrawerSlice.actions;

export default drugReferenceDrawerSlice.reducer;
