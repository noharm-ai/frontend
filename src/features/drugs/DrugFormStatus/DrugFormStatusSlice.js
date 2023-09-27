import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/api";

const initialState = {
  status: "idle",
  error: null,
  list: [],
};

export const updateAllDrugForms = createAsyncThunk(
  "drugFormStatus/update-all",
  async (params, thunkAPI) => {
    const { access_token } = thunkAPI.getState().auth.identify;

    try {
      const response = await api.updatePrescriptionDrugForm(
        access_token,
        params
      );
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const drugFormStatusSlice = createSlice({
  name: "drugFormStatus",
  initialState,
  reducers: {
    setDrugFormList(state, action) {
      state.list = action.payload;
    },
    updateDrugForm(state, action) {
      state.list[action.payload.id] = action.payload.data;
    },
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(updateAllDrugForms.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(updateAllDrugForms.fulfilled, (state, action) => {
        state.status = "succeeded";
      })
      .addCase(updateAllDrugForms.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { setDrugFormList, updateDrugForm, reset } =
  drugFormStatusSlice.actions;

export default drugFormStatusSlice.reducer;
