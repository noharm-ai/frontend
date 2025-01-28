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
    bulletin: null,
    bulletinDate: null,
    date: null,
    diagnostics: null,
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
  modal: {
    bulletin: false,
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
      const bulletinUrl = response.data.data.bulletin;

      const template = await axiosBasic.get(templateUrl);
      const status = await axiosBasic.get(statusUrl);
      const diagnostics = await axiosBasic.get(diagnosticsUrl);
      const bulletin = await axiosBasic.get(bulletinUrl);

      return {
        response,
        template: template.data,
        status: status.data,
        diagnostics: diagnostics.data,
        bulletin: bulletin.data,
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
      const lastBulletinUpdate =
        thunkAPI.getState().admin.integrationRemote.template.bulletinDate;
      const response = await api.integrationRemote.getQueueStatus(params);
      const statusUpdatedAt = response.data.data.statusUpdatedAt;
      const bulletinUpdatedAt = response.data.data.bulletinUpdatedAt;
      let status = null;
      let bulletin = null;

      if (statusUpdatedAt > lastStatusUpdate) {
        status = await axiosBasic.get(response.data.data.statusUrl);
      }

      if (bulletinUpdatedAt > lastBulletinUpdate) {
        bulletin = await axiosBasic.get(response.data.data.bulletinUrl);
      }

      return { response, status, statusUpdatedAt, bulletin, bulletinUpdatedAt };
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
    setBulletinModal(state, action) {
      state.modal.bulletin = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchTemplate.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchTemplate.fulfilled, (state, action) => {
        state.status = "succeeded";
        // template
        state.template.data = action.payload.template;
        state.template.date = action.payload.response.data.data.updatedAt;

        // status
        const flatStatus = {};
        const groups = Object.values(
          state.template.data.flowContents.processGroups
        );
        flatStatuses(action.payload.status, flatStatus, groups);
        state.template.status = flatStatus;
        state.template.statusDate =
          action.payload.response.data.data.statusUpdatedAt;

        // bulletin
        state.template.bulletin = action.payload.bulletin;
        state.template.bulletinDate =
          action.payload.response.data.data.bulletinUpdatedAt;

        //diagnostics
        state.template.diagnostics =
          action.payload.diagnostics?.systemDiagnostics?.aggregateSnapshot;

        // queue
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
                  item.body?.component?.config?.properties
                );
              }
            }
          }
        });

        if (action.payload.status) {
          const flatStatus = {};
          const groups = Object.values(
            state.template.data.flowContents.processGroups
          );
          flatStatuses(action.payload.status, flatStatus, groups);
          state.template.status = flatStatus;
          state.template.statusDate = action.payload.statusUpdatedAt;
        }

        if (action.payload.bulletin) {
          state.template.bulletin = action.payload.bulletin.data;
          state.template.bulletinDate = action.payload.bulletinUpdatedAt;
        }
      });
  },
});

export const { reset, setSelectedNode, setQueueDrawer, setBulletinModal } =
  integrationRemoteSlice.actions;

export default integrationRemoteSlice.reducer;
