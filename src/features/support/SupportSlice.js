import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/api";

const initialState = {
  open: false,
  form: {
    status: "idle",
    error: null,
  },
  tickets: {
    myTickets: [],
    following: [],
    organization: [],
    status: "idle",
    error: null,
  },
  pendingTickets: {
    list: [],
    status: "idle",
    error: null,
  },
  aiform: {
    currentStep: ["question"],
    status: "idle",
    error: null,
    question: "",
    response: "",
    askn0: {
      status: "idle",
      error: null,
      data: null,
    },
    n0form: {
      status: "idle",
      error: null,
      data: null,
    },
  },
};

export const createTicket = createAsyncThunk(
  "support/create-ticket",
  async (params, thunkAPI) => {
    try {
      const response = await api.support.createTicket(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue({
        ...err.response.data,
        statusCode: err.response.status,
      });
    }
  }
);

export const createClosedTicket = createAsyncThunk(
  "support/create-closed-ticket",
  async (params, thunkAPI) => {
    try {
      const response = await api.support.createClosedTicket(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue({
        ...err.response.data,
        statusCode: err.response.status,
      });
    }
  }
);

export const addAttachment = createAsyncThunk(
  "support/add-attachment",
  async (params, thunkAPI) => {
    try {
      const response = await api.support.addAttachment(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue({
        ...err.response.data,
        statusCode: err.response.status,
      });
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

export const fetchPendingActionTickets = createAsyncThunk(
  "support/fetch-pending-action-tickets",
  async (params, thunkAPI) => {
    try {
      const response = await api.support.getPendingActionTickets(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const fetchN0Response = createAsyncThunk(
  "support/fetch-n0-response",
  async (params, thunkAPI) => {
    try {
      const response = await api.support.fetchN0Response(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const fetchN0Form = createAsyncThunk(
  "support/fetch-n0-form",
  async (params, thunkAPI) => {
    try {
      const response = await api.support.fetchN0Form(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const supportSlice = createSlice({
  name: "supportSlice",
  initialState,
  reducers: {
    setSupportOpen(state, action) {
      state.open = action.payload;
    },
    setPendingTickets(state, action) {
      state.pendingTickets.list = action.payload;
    },
    setAIFormStep(state, action) {
      state.aiform.currentStep = action.payload;
    },
    setAIFormQuestion(state, action) {
      state.aiform.question = action.payload;
    },
    setAIFormResponse(state, action) {
      state.aiform.response = action.payload;
    },
    resetAIForm(state) {
      state.aiform = {
        ...initialState.aiform,
      };
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
        state.tickets.myTickets = action.payload.data.myTickets;
        state.tickets.following = action.payload.data.following;
        state.tickets.organization = action.payload.data.organization;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.tickets.status = "failed";
        state.tickets.error = action.error.message;
      })
      .addCase(fetchPendingActionTickets.pending, (state, action) => {
        state.pendingTickets.status = "loading";
      })
      .addCase(fetchPendingActionTickets.fulfilled, (state, action) => {
        state.pendingTickets.status = "succeeded";
        state.pendingTickets.list = action.payload.data;
      })
      .addCase(fetchPendingActionTickets.rejected, (state, action) => {
        state.pendingTickets.status = "failed";
        state.pendingTickets.error = action.error.message;
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
      })

      .addCase(fetchN0Response.pending, (state, action) => {
        state.aiform.askn0.status = "loading";
      })
      .addCase(fetchN0Response.fulfilled, (state, action) => {
        state.aiform.askn0.status = "succeeded";
        state.aiform.askn0.data = action.payload.data;
      })
      .addCase(fetchN0Response.rejected, (state, action) => {
        state.aiform.askn0.status = "failed";
        state.aiform.askn0.error = action.error.message;
        state.aiform.askn0.data = null;
      })

      .addCase(fetchN0Form.pending, (state, action) => {
        state.aiform.n0form.status = "loading";
      })
      .addCase(fetchN0Form.fulfilled, (state, action) => {
        state.aiform.n0form.status = "succeeded";
        state.aiform.n0form.data = action.payload.data.agent;

        if (state.aiform.n0form.data.extra_fields) {
          state.aiform.n0form.data.extra_fields.push({
            label: "Mais alguma informação relevante?",
            type: "textarea",
          });
          state.aiform.n0form.data.extra_fields.push({
            label: "Anexos",
            type: "archive",
          });
        }
      })
      .addCase(fetchN0Form.rejected, (state, action) => {
        state.aiform.n0form.status = "failed";
        state.aiform.n0form.error = action.error.message;
        state.aiform.n0form.data = null;
      });
  },
});

export default supportSlice.reducer;

export const {
  setSupportOpen,
  reset,
  resetAIForm,
  setPendingTickets,
  setAIFormStep,
  setAIFormQuestion,
  setAIFormResponse,
} = supportSlice.actions;
