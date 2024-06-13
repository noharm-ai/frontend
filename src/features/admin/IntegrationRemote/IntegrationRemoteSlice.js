import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/admin/api";
import { flatStatuses } from "./transformer";

const initialState = {
  list: [],
  status: "idle",
  error: null,
  queue: [],
  template: {
    data: null,
    status: null,
    date: null,
  },
  selectedNode: null,
};

export const fetchTemplate = createAsyncThunk(
  "integration-remote/fetch-template",
  async (params, thunkAPI) => {
    try {
      const response = await api.integrationRemote.getTemplate(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const setProcessorState = createAsyncThunk(
  "integration-remote/set-state",
  async (params, thunkAPI) => {
    try {
      const response = await api.integrationRemote.setProcessorState(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const integrationRemoteSlice = createSlice({
  name: "integrationRemote",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setSelectedNode(state, action) {
      state.selectedNode = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchTemplate.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchTemplate.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.template.data = action.payload.data.data.template;
        const flatStatus = {};
        flatStatuses(action.payload.data.data.status, flatStatus);
        state.template.status = flatStatus;
        state.template.date = action.payload.data.data.updatedAt;
      })
      .addCase(fetchTemplate.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(setProcessorState.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(setProcessorState.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.queue.push(action.payload.data.data);
      })
      .addCase(setProcessorState.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { reset, setSelectedNode } = integrationRemoteSlice.actions;

export default integrationRemoteSlice.reducer;
