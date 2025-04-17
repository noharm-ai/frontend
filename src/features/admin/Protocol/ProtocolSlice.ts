import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/admin/api";
import { IProtocolFormBaseFields } from "./Form/ProtocolForm";

interface IProtocolSlice {
  list: any[];
  status: string;
  error: string | null;
  single: {
    data: any | null;
    status: string;
    error: string | null;
  };
}

const initialState: IProtocolSlice = {
  list: [],
  status: "idle",
  error: null,
  single: {
    data: null,
    status: "idle",
    error: null,
  },
};

export const fetchProtocols = createAsyncThunk(
  "admin-protocol/fetch",
  async (params: any, thunkAPI) => {
    try {
      const response = await api.protocols.getProtocols(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const upsertProtocol = createAsyncThunk(
  "admin-protocol/upsert",
  async (params: IProtocolFormBaseFields, thunkAPI) => {
    try {
      const response = await api.protocols.upsertProtocol(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

const protocolSlice = createSlice({
  name: "adminProtocol",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setProtocol(state, action) {
      state.single.data = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchProtocols.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProtocols.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data.data;
      })
      .addCase(fetchProtocols.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? null;
      })
      .addCase(upsertProtocol.pending, (state) => {
        state.single.status = "loading";
      })
      .addCase(upsertProtocol.fulfilled, (state) => {
        state.single.status = "succeeded";
      })
      .addCase(upsertProtocol.rejected, (state, action) => {
        state.single.status = "failed";
        state.single.error = action.error.message!;
      });
  },
});

export const { reset, setProtocol } = protocolSlice.actions;

export default protocolSlice.reducer;
