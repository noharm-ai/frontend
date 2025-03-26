import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api, { IAttributeCreate } from "services/regulation/api";

interface IRegulationAttributeSlice {
  attachments: {
    status: string;
    error: string | null;
    list: any[];
  };
}

const initialState: IRegulationAttributeSlice = {
  attachments: {
    status: "idle",
    error: null,
    list: [],
  },
};

export const listAttachments = createAsyncThunk(
  "reg-attributes/list-attachments",
  async (
    params: { idRegSolicitation: number; tpAttribute: number },
    thunkAPI
  ) => {
    try {
      const response = await api.fetchSolicitationAttributes(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const createAttribute = createAsyncThunk(
  "reg-attributes/create",
  async (params: IAttributeCreate, thunkAPI) => {
    try {
      const response = await api.createSolicitationAttribute(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

export const removeAttribute = createAsyncThunk(
  "reg-attributes/remove",
  async (params: { id: number }, thunkAPI) => {
    try {
      const response = await api.removeSolicitationAttribute(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  }
);

const regulationAttributeSlice = createSlice({
  name: "regulationAttributeSlice",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(listAttachments.pending, (state) => {
        state.attachments.status = "loading";
        state.attachments.list = [];
      })
      .addCase(listAttachments.fulfilled, (state, action) => {
        state.attachments.status = "succeeded";
        state.attachments.list = action.payload.data.data;
      })
      .addCase(listAttachments.rejected, (state) => {
        state.attachments.status = "failed";
      });
  },
});

export const { reset } = regulationAttributeSlice.actions;

export default regulationAttributeSlice.reducer;
