import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/admin/api";
import { IProtocolFormBaseFields } from "./Form/types";

interface IProtocolSlice {
  list: any[];
  status: string;
  error: string | null;
  /** Protocol being edited, loaded by id. */
  record: {
    data: any | null;
    status: string;
    error: string | null;
  };
  /** Save operation. */
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
  record: {
    data: null,
    status: "idle",
    error: null,
  },
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

export const fetchProtocol = createAsyncThunk(
  "admin-protocol/fetch-one",
  async (
    { id, allSchemas }: { id: string | number; allSchemas?: boolean },
    thunkAPI
  ) => {
    try {
      const response = await api.protocols.getProtocol(
        id,
        allSchemas ? { allSchemas: true } : {}
      );

      return response.data.data;
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
      .addCase(fetchProtocol.pending, (state) => {
        state.record.status = "loading";
      })
      .addCase(fetchProtocol.fulfilled, (state, action) => {
        state.record.status = "succeeded";
        state.record.data = action.payload;
      })
      .addCase(fetchProtocol.rejected, (state, action) => {
        state.record.status = "failed";
        state.record.data = null;
        state.record.error = action.error.message ?? null;
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
