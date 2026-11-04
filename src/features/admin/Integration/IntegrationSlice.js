import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/admin/api";

const initialState = {
  updateUserSecurityGroup: {
    status: "idle",
    error: null,
  },
};

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
