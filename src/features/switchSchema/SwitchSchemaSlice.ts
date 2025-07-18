import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/api";

interface ISwitchSchemaSlice {
  status: string;
  error: string | null;
  data: any;
  switch: {
    status: string;
    error: string | null;
  };
}

const initialState: ISwitchSchemaSlice = {
  status: "idle",
  error: null,
  data: null,
  switch: {
    status: "idle",
    error: null,
  },
};

export const fetchSwitchSchemaData = createAsyncThunk(
  "switch-schema/fetch",
  async (params: any, thunkAPI) => {
    try {
      const response = await api.auth.getSwitchSchemaData(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const switchToSchema = createAsyncThunk(
  "switch-schema/switch",
  async (params: any, thunkAPI) => {
    try {
      const response = await api.auth.switchToSchema(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

const switchSchemaSlice = createSlice({
  name: "switchSchemaSlice",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchSwitchSchemaData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSwitchSchemaData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data.data;
      })
      .addCase(fetchSwitchSchemaData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message!;
        state.data = null;
      })

      .addCase(switchToSchema.pending, (state) => {
        state.switch.status = "loading";
      })
      .addCase(switchToSchema.fulfilled, (state) => {
        state.switch.status = "succeeded";
      })
      .addCase(switchToSchema.rejected, (state, action) => {
        state.switch.status = "failed";
        state.switch.error = action.error.message!;
      });
  },
});

export const { reset } = switchSchemaSlice.actions;

export default switchSchemaSlice.reducer;
