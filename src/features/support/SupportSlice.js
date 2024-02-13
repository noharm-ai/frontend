import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/api";

const initialState = {
  open: false,
  form: {
    status: "idle",
    error: null,
  },
  tickets: {
    list: [],
    status: "idle",
    error: null,
  },
};

export const createTicket = createAsyncThunk(
  "support/create-ticket",
  async (params, thunkAPI) => {
    try {
      const response = await api.support.createTicket(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const fetchTickets = createAsyncThunk(
  "support/fetch-tickets",
  async (params, thunkAPI) => {
    try {
      const response = await api.support.getTickets(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const supportSlice = createSlice({
  name: "summary",
  initialState,
  reducers: {
    setSupportOpen(state, action) {
      state.open = action.payload;
    },
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchTickets.pending, (state, action) => {
        state.tickets.status = "loading";
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.tickets.status = "succeeded";
        state.tickets.list = action.payload.data;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.tickets.status = "failed";
        state.tickets.error = action.error.message;
      })
      .addCase(createTicket.pending, (state, action) => {
        state.form.status = "loading";
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.form.status = "succeeded";
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.form.status = "failed";
        state.form.error = action.error.message;
      });
  },
});

export default supportSlice.reducer;

export const { setSupportOpen, reset } = supportSlice.actions;
