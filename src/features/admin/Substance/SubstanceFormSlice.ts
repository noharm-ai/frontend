import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "services/admin/api";

interface SubstanceFormState {
  data: Record<string, any> | null;
  fetchStatus: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: SubstanceFormState = {
  data: null,
  fetchStatus: "idle",
};

export const fetchSubstance = createAsyncThunk(
  "admin-substance/fetchSingle",
  async (id: number | string, thunkAPI) => {
    try {
      const response = await api.substance.getSubstance(id);

      return response.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const substanceFormSlice = createSlice({
  name: "adminSubstanceForm",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setSubstance(state, action: PayloadAction<Record<string, any> | null>) {
      state.data = action.payload;
      state.fetchStatus = "idle";
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchSubstance.pending, (state, action) => {
        state.fetchStatus = "loading";
        state.data = { id: action.meta.arg };
      })
      .addCase(fetchSubstance.fulfilled, (state, action) => {
        state.fetchStatus = "succeeded";
        state.data = action.payload.data;
      })
      .addCase(fetchSubstance.rejected, (state) => {
        state.fetchStatus = "failed";
        state.data = null;
      });
  },
});

export const { reset, setSubstance } = substanceFormSlice.actions;

export default substanceFormSlice.reducer;
