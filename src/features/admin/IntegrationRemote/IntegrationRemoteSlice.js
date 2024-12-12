import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/admin/api";
import { axiosBasic } from "services/api";
import { flatStatuses, optimisticUpdateProperties } from "./transformer";

const initialState = {
  list: [],
  status: "idle",
  error: null,
  template: {
    data: null,
    status: null,
    statusDate: null,
    date: null,
  },
  selectedNode: null,
  queue: {
    list: [],
    status: "idle",
    drawer: false,
  },
  pushQueueRequest: {
    activeAction: null,
  },
};

export const fetchTemplate = createAsyncThunk(
  "integration-remote/fetch-template",
  async (params, thunkAPI) => {
    try {
      const response = await api.integrationRemote.getTemplate(params);

      const templateUrl = response.data.data.template;
      const statusUrl = response.data.data.status;
      const diagnosticsUrl = response.data.data.diagnostics;

      const template = await axiosBasic.get(templateUrl);
      const status = await axiosBasic.get(statusUrl);
      const diagnostics = await axiosBasic.get(diagnosticsUrl);

      return {
        response,
        template: template.data,
        status: status.data,
        diagnostics: diagnostics.data,
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const pushQueueRequest = createAsyncThunk(
  "integration-remote/push-queue-request",
  async (params, thunkAPI) => {
    try {
      const response = await api.integrationRemote.pushQueueRequest(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const getQueueStatus = createAsyncThunk(
  "integration-remote/get-queue-stats",
  async (params, thunkAPI) => {
    try {
      const lastStatusUpdate =
        thunkAPI.getState().admin.integrationRemote.template.statusDate;
      const response = await api.integrationRemote.getQueueStatus(params);
      const statusUpdatedAt = response.data.data.statusUpdatedAt;
      let status = null;

      if (statusUpdatedAt > lastStatusUpdate) {
        status = await axiosBasic.get(response.data.data.statusUrl);
      }

      return { response, status, statusUpdatedAt };
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
    setQueueDrawer(state, action) {
      state.queue.drawer = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchTemplate.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchTemplate.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.template.data = action.payload.template;
        const flatStatus = {};
        flatStatuses(action.payload.status, flatStatus);
        state.template.status = flatStatus;
        state.template.statusDate =
          action.payload.response.data.data.statusUpdatedAt;
        state.template.date = action.payload.response.data.data.updatedAt;
        state.queue.list = action.payload.response.data.data.queue;
      })
      .addCase(fetchTemplate.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(pushQueueRequest.pending, (state, action) => {
        state.pushQueueRequest.activeAction = action.meta.arg.actionType;
      })
      .addCase(pushQueueRequest.fulfilled, (state, action) => {
        state.pushQueueRequest.activeAction = null;
        const queue = action.payload.data.data;
        state.queue.list = [queue, ...state.queue.list];
      })
      .addCase(pushQueueRequest.rejected, (state, action) => {
        state.pushQueueRequest.activeAction = null;
      })
      .addCase(getQueueStatus.pending, (state, action) => {
        state.queue.status = "loading";
      })
      .addCase(getQueueStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        const result = action.payload.response.data.data.queue;

        result.forEach((item) => {
          if (item.responseCode) {
            const index = state.queue.list.findIndex((i) => i.id === item.id);

            if (index !== -1) {
              state.queue.list[index] = { ...item };

              if (item.extra.type === "UPDATE_PROPERTY") {
                state.template.data = optimisticUpdateProperties(
                  state.template.data,
                  item.extra.idEntity,
                  item.body?.config?.properties
                );
              }
            }
          }
        });

        if (action.payload.status) {
          const flatStatus = {};
          flatStatuses(action.payload.status, flatStatus);
          state.template.status = flatStatus;
          state.template.statusDate = action.payload.statusUpdatedAt;
        }
      })
      .addCase(getQueueStatus.rejected, (state, action) => {
        //state.status = "failed";
      });
  },
});

export const { reset, setSelectedNode, setQueueDrawer } =
  integrationRemoteSlice.actions;

export default integrationRemoteSlice.reducer;
