import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import api from "services/api";

export interface IDigitalSignatureNote {
  id: number | string;
}

export interface IDigitalSignatureParams {
  id: number | string;
  signerName: string;
  signerEmail: string;
}

export interface IDigitalSignatureResult {
  idSignRequest: number | null;
  link: string | null;
  signerName: string | null;
  signerEmail: string | null;
}

interface IDigitalSignatureSlice {
  note: IDigitalSignatureNote | null;
  request: {
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
    result: IDigitalSignatureResult | null;
  };
}

const initialState: IDigitalSignatureSlice = {
  note: null,
  request: {
    status: "idle",
    error: null,
    result: null,
  },
};

export const requestDigitalSignature = createAsyncThunk(
  "digitalSignature/request",
  async (params: IDigitalSignatureParams, thunkAPI) => {
    try {
      const response = await api.clinicalNotes.requestDigitalSignature({
        id: params.id,
        signer_name: params.signerName,
        signer_email: params.signerEmail,
      });
      return response.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.response?.data);
    }
  },
);

const digitalSignatureSlice = createSlice({
  name: "digitalSignature",
  initialState,
  reducers: {
    openDigitalSignature(state, action: PayloadAction<IDigitalSignatureNote>) {
      state.note = action.payload;
      state.request = { ...initialState.request };
    },
    closeDigitalSignature(state) {
      state.note = null;
      state.request = { ...initialState.request };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(requestDigitalSignature.pending, (state) => {
        state.request.status = "loading";
        state.request.error = null;
      })
      .addCase(requestDigitalSignature.fulfilled, (state, action) => {
        state.request.status = "succeeded";
        state.request.result = action.payload?.data ?? null;
      })
      .addCase(requestDigitalSignature.rejected, (state, action: any) => {
        state.request.status = "failed";
        state.request.error = action.payload?.message ?? null;
      });
  },
});

export const { openDigitalSignature, closeDigitalSignature } =
  digitalSignatureSlice.actions;

export const digitalSignatureReducer = digitalSignatureSlice.reducer;
