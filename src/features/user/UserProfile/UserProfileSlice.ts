import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/api";

interface UserProfileState {
  changePassword: {
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
  };
  signature: {
    fetchStatus: "idle" | "loading" | "succeeded" | "failed";
    saveStatus: "idle" | "loading" | "succeeded" | "failed";
    data: { key: string; value: string } | null;
    error: string | null;
  };
}

const initialState: UserProfileState = {
  changePassword: {
    status: "idle",
    error: null,
  },
  signature: {
    fetchStatus: "idle",
    saveStatus: "idle",
    data: null,
    error: null,
  },
};

export const updatePassword = createAsyncThunk(
  "userProfile/updatePassword",
  async (
    params: { password: string; newpassword: string; confirmPassword: string },
    thunkAPI: any,
  ) => {
    try {
      const { access_token } = thunkAPI.getState().auth.identify;
      const response = await api.updatePassword(access_token, params);

      return response.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message ?? "Erro ao alterar senha",
      );
    }
  },
);

export const fetchSignature = createAsyncThunk(
  "userProfile/fetchSignature",
  async (memoryType: string, thunkAPI: any) => {
    try {
      const { access_token } = thunkAPI.getState().auth.identify;
      const response = await api.getMemory(access_token, memoryType);
      return response.data?.data ?? [];
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message ?? "Erro ao buscar assinatura",
      );
    }
  },
);

export const saveSignature = createAsyncThunk(
  "userProfile/saveSignature",
  async (
    params: { id: string; type: string; value: string },
    thunkAPI: any,
  ) => {
    try {
      const { access_token } = thunkAPI.getState().auth.identify;
      const response = await api.putMemory(access_token, params);
      return { ...params, key: response.data?.data };
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message ?? "Erro ao salvar assinatura",
      );
    }
  },
);

const userProfileSlice = createSlice({
  name: "userProfile",
  initialState,
  reducers: {
    resetChangePassword(state) {
      state.changePassword = initialState.changePassword;
    },
    resetSignatureSave(state) {
      state.signature.saveStatus = "idle";
      state.signature.error = null;
    },
  },
  extraReducers(builder) {
    builder
      // updatePassword
      .addCase(updatePassword.pending, (state) => {
        state.changePassword.status = "loading";
        state.changePassword.error = null;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.changePassword.status = "succeeded";
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.changePassword.status = "failed";
        state.changePassword.error = (action.payload as string) ?? null;
      })
      // fetchSignature
      .addCase(fetchSignature.pending, (state) => {
        state.signature.fetchStatus = "loading";
      })
      .addCase(fetchSignature.fulfilled, (state, action) => {
        state.signature.fetchStatus = "succeeded";
        state.signature.data = action.payload[0] ?? null;
      })
      .addCase(fetchSignature.rejected, (state, action) => {
        state.signature.fetchStatus = "failed";
        state.signature.error = (action.payload as string) ?? null;
      })
      // saveSignature
      .addCase(saveSignature.pending, (state) => {
        state.signature.saveStatus = "loading";
        state.signature.error = null;
      })
      .addCase(saveSignature.fulfilled, (state, action) => {
        state.signature.saveStatus = "succeeded";
        state.signature.data = action.payload as { key: string; value: string };
      })
      .addCase(saveSignature.rejected, (state, action) => {
        state.signature.saveStatus = "failed";
        state.signature.error = (action.payload as string) ?? null;
      });
  },
});

export const { resetChangePassword, resetSignatureSave } =
  userProfileSlice.actions;
export const userProfileReducer = userProfileSlice.reducer;
