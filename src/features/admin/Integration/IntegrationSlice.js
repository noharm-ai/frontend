import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/admin/api";

const initialState = {
  refreshPrescription: {
    status: "idle",
    error: null,
  },
  updateUserSecurityGroup: {
    status: "idle",
    error: null,
  },
};

export const refreshPrescription = createAsyncThunk(
  "admin-integration/refresh-prescription",
  async (params, thunkAPI) => {
    try {
      const response = await api.refreshPrescription(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const updateUserSecurityGroup = createAsyncThunk(
  "admin-integration/user-user-security-group",
  async (params, thunkAPI) => {
    try {
      const response = await api.integration.updateUserSecurityGroup(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const integrationSlice = createSlice({
  name: "integration",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(refreshPrescription.pending, (state, action) => {
        state.refreshPrescription.status = "loading";
      })
      .addCase(refreshPrescription.fulfilled, (state, action) => {
        state.refreshPrescription.status = "succeeded";
      })
      .addCase(refreshPrescription.rejected, (state, action) => {
        state.refreshPrescription.status = "failed";
      })
      .addCase(updateUserSecurityGroup.pending, (state, action) => {
        state.updateUserSecurityGroup.status = "loading";
      })
      .addCase(updateUserSecurityGroup.fulfilled, (state, action) => {
        state.updateUserSecurityGroup.status = "succeeded";
      })
      .addCase(updateUserSecurityGroup.rejected, (state, action) => {
        state.updateUserSecurityGroup.status = "failed";
      });
  },
});

export const { reset } = integrationSlice.actions;

export default integrationSlice.reducer;
