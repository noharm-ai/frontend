import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/regulation/api";

const initialState = {
  data: {},
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
      });
  },
});

export const { reset, setActionModal } = regulationSlice.actions;

export default regulationSlice.reducer;
