import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/admin/api";
import { flatStatuses } from "./transformer";

const initialState = {
  list: [],
  status: "idle",
  error: null,
  template: {
    data: null,
    status: null,
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

      return response;
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
      const response = await api.integrationRemote.getQueueStatus(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const getTemplateDate = createAsyncThunk(
  "integration-remote/get-template-date",
  async (params, thunkAPI) => {
    try {
      const response = await api.integrationRemote.getTemplateDate(params);

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
        state.template.data = action.payload.data.data.template;
        const flatStatus = {};
        flatStatuses(action.payload.data.data.status, flatStatus);
        state.template.status = flatStatus;
        state.template.date = action.payload.data.data.updatedAt;
        state.queue.list = action.payload.data.data.queue;
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
        state.queue.list = [action.payload.data.data, ...state.queue.list];
      })
      .addCase(pushQueueRequest.rejected, (state, action) => {
        state.pushQueueRequest.activeAction = null;
      })
      .addCase(getQueueStatus.pending, (state, action) => {
        state.queue.status = "loading";
      })
      .addCase(getQueueStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        const result = action.payload.data.data;

        result.forEach((item) => {
          if (item.responseCode) {
            const index = state.queue.list.findIndex((i) => i.id === item.id);

            if (index !== -1) {
              state.queue.list[index] = { ...item };

              //update status
              if (
                item.responseCode === 200 &&
                state.template.status.hasOwnProperty(item.response?.id)
              ) {
                const newStatus = item.response.status?.aggregateSnapshot;
                if (newStatus) {
                  state.template.status[item.response?.id] = newStatus;

                  if (
                    state.selectedNode?.extra?.instanceIdentifier ===
                    item.response?.id
                  ) {
                    state.selectedNode.status = newStatus;
                  }
                }
              }
            }
          }
        });
      })
      .addCase(getQueueStatus.rejected, (state, action) => {
        state.status = "failed";
      });
  },
});

export const { reset, setSelectedNode, setQueueDrawer } =
  integrationRemoteSlice.actions;

export default integrationRemoteSlice.reducer;
