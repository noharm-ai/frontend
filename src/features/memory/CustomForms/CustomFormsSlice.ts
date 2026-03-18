import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/api";

const initialState = {
  id: null as number | null,
  forms: [] as any[],
  status: "idle" as string,
  saveStatus: "idle" as string,
  error: null as string | null,
};

export const fetchCustomForms = createAsyncThunk(
  "memory-custom-forms/fetch",
  async (_, thunkAPI: any) => {
    try {
      const { access_token } = (thunkAPI.getState() as any).auth.identify;
      const response = await api.getMemory(access_token, "custom-forms");
      return response.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const saveCustomForms = createAsyncThunk(
  "memory-custom-forms/save",
  async (params: any, thunkAPI: any) => {
    try {
      const { access_token } = (thunkAPI.getState() as any).auth.identify;
      const response = await api.putMemory(access_token, params);
      return response.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

const customFormsSlice = createSlice({
  name: "memory-custom-forms",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchCustomForms.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCustomForms.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.forms = action.payload.data;

        console.log("forms", state.forms);
      })
      .addCase(fetchCustomForms.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? null;
      })
      .addCase(saveCustomForms.pending, (state) => {
        state.saveStatus = "loading";
      })
      .addCase(saveCustomForms.fulfilled, (state) => {
        state.saveStatus = "succeeded";
      })
      .addCase(saveCustomForms.rejected, (state) => {
        state.saveStatus = "failed";
      });
  },
});

export const { reset } = customFormsSlice.actions;
export default customFormsSlice.reducer;
