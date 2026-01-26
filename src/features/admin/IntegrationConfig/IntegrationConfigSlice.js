import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/admin/api";

const initialState = {
  list: [],
  status: "idle",
  error: null,
  single: {
    data: null,
    status: "idle",
    error: null,
  },
  createSchema: {
    status: "idle",
    error: null,
  },
  cloudConfig: {
    schema: null,
    status: "idle",
    data: null,
    error: null,
  },
  templateList: {
    data: {},
    status: "idle",
    error: null,
  },
};

export const fetchIntegrations = createAsyncThunk(
  "integration-config/fetch",
  async (params, thunkAPI) => {
    try {
      const response = await api.integration.getList(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const fetchTemplates = createAsyncThunk(
  "integration-config/fetch-templates",
  async (params, thunkAPI) => {
    try {
      const response = await api.integration.getTemplateList(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const updateIntegration = createAsyncThunk(
  "integration-config/update",
  async (params, thunkAPI) => {
    try {
      const response = await api.integration.update(params);
      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const createSchema = createAsyncThunk(
  "integration-config/create-schema",
  async (params, thunkAPI) => {
    try {
      const response = await api.integration.createSchema(params);
      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const fetchCloudConfig = createAsyncThunk(
  "integration-config/fetch-cloud-config",
  async (params, thunkAPI) => {
    try {
      const response = await api.integration.fetchCloudConfig(params);
      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const upsertGetname = createAsyncThunk(
  "integration-config/upsert-getname",
  async (params, thunkAPI) => {
    try {
      const response = await api.integration.upsertGetname(params);
      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

export const upsertSecurityGroup = createAsyncThunk(
  "integration-config/upsert-security-group",
  async (params, thunkAPI) => {
    try {
      const response = await api.integration.upsertSecurityGroup(params);
      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  },
);

const integrationConfigSlice = createSlice({
  name: "integrationConfig",
  initialState,
  reducers: {
    setIntegration(state, action) {
      state.single.data = action.payload;
    },
    setCloudConfigSchema(state, action) {
      state.cloudConfig.schema = action.payload;
    },
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchIntegrations.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchIntegrations.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload.data.data;
      })
      .addCase(fetchIntegrations.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      .addCase(fetchTemplates.pending, (state, action) => {
        state.templateList.status = "loading";
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.templateList.status = "succeeded";
        state.templateList.data = action.payload.data.data;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.templateList.status = "failed";
        state.templateList.error = action.error.message;
      })

      .addCase(fetchCloudConfig.pending, (state, action) => {
        state.cloudConfig.status = "loading";
      })
      .addCase(fetchCloudConfig.fulfilled, (state, action) => {
        state.cloudConfig.status = "succeeded";
        state.cloudConfig.data = action.payload.data.data;
      })
      .addCase(fetchCloudConfig.rejected, (state, action) => {
        state.cloudConfig.status = "failed";
        state.cloudConfig.error = action.error.message;
      })

      .addCase(createSchema.pending, (state, action) => {
        state.createSchema.status = "loading";
      })
      .addCase(createSchema.fulfilled, (state, action) => {
        state.createSchema.status = "succeeded";
      })
      .addCase(createSchema.rejected, (state, action) => {
        state.createSchema.status = "failed";
        state.createSchema.error = action.error.message;
      })
      .addCase(updateIntegration.pending, (state, action) => {
        state.single.status = "loading";
      })
      .addCase(updateIntegration.fulfilled, (state, action) => {
        state.single.status = "succeeded";

        const item = action.payload.data.data;

        const index = state.list.findIndex((i) => i.schema === item.schema);
        if (index !== -1) {
          state.list[index] = item;
        }
      })
      .addCase(updateIntegration.rejected, (state, action) => {
        state.single.status = "failed";
        state.single.error = action.error.message;
      });
  },
});

export const { reset, setIntegration, setCloudConfigSchema } =
  integrationConfigSlice.actions;

export default integrationConfigSlice.reducer;
