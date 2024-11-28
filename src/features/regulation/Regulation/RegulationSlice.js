import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/regulation/api";

const initialState = {
  data: {
    patient: {},
    extra: {},
    movements: [],
  },
  status: "loading",
  error: null,
  action: {
    open: false,
    status: "idle",
    error: null,
  },
};

export const fetchRegulation = createAsyncThunk(
  "regulation/fetch",
  async (params, thunkAPI) => {
    try {
      const response = await api.fetchRegulation(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const moveRegulation = createAsyncThunk(
  "regulation/move",
  async (params, thunkAPI) => {
    try {
      const response = await api.moveRegulation(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const regulationSlice = createSlice({
  name: "regulationSlice",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setActionModal(state, action) {
      state.action.open = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchRegulation.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchRegulation.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data.data;
      })
      .addCase(fetchRegulation.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        state.list = [];
      })
      .addCase(moveRegulation.pending, (state, action) => {
        state.action.status = "loading";
      })
      .addCase(moveRegulation.fulfilled, (state, action) => {
        state.action.status = "succeeded";
        state.data.movements = action.payload.data.data.movements;
        state.data.stage = action.payload.data.data.stage;
        state.data.extra = action.payload.data.data.extra;
      })
      .addCase(moveRegulation.rejected, (state, action) => {
        state.action.status = "failed";
        state.action.error = action.error.message;
      });
  },
});

export const { reset, setActionModal } = regulationSlice.actions;

export default regulationSlice.reducer;
