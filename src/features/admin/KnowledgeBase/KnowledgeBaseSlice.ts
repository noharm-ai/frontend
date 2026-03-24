import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/admin/api";
import { IKnowledgeBaseFormBaseFields } from "./Form/KnowledgeBaseForm";

interface IKnowledgeBaseSlice {
  list: any[];
  status: string;
  error: string | null;
  single: {
    data: any | null;
    status: string;
    error: string | null;
  };
}

const initialState: IKnowledgeBaseSlice = {
  list: [],
  status: "idle",
  error: null,
  single: {
    data: null,
    status: "idle",
    error: null,
  },
};

export const fetchKnowledgeBases = createAsyncThunk(
  "admin-knowledge-base/fetch",
  async (params: any, thunkAPI) => {
    try {
      const response = await api.knowledgeBase.getKnowledgeBase(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const upsertKnowledgeBase = createAsyncThunk(
  "admin-knowledge-base/upsert",
  async (params: IKnowledgeBaseFormBaseFields, thunkAPI) => {
    try {
      const response = await api.knowledgeBase.upsertKnowledgeBase(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

const knowledgeBaseSlice = createSlice({
  name: "adminKnowledgeBase",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setKnowledgeBase(state, action) {
      state.single.data = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchKnowledgeBases.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchKnowledgeBases.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data.data;
      })
      .addCase(fetchKnowledgeBases.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? null;
      })
      .addCase(upsertKnowledgeBase.pending, (state) => {
        state.single.status = "loading";
      })
      .addCase(upsertKnowledgeBase.fulfilled, (state) => {
        state.single.status = "succeeded";
      })
      .addCase(upsertKnowledgeBase.rejected, (state, action) => {
        state.single.status = "failed";
        state.single.error = action.error.message!;
      });
  },
});

export const { reset, setKnowledgeBase } = knowledgeBaseSlice.actions;

export default knowledgeBaseSlice.reducer;
