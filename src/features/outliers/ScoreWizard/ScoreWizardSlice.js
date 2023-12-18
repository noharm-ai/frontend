import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/api";

const initialState = {
  prepareGeneration: {
    status: "idle",
    error: null,
  },
  generateSingle: {
    status: "idle",
    error: null,
  },
  configDrug: {
    status: "idle",
    error: null,
  },
  addHistory: {
    status: "idle",
    error: null,
  },
  removeOutlier: {
    status: "idle",
    error: null,
  },
};

export const addHistory = createAsyncThunk(
  "score-wizard-slice/add-presc-history",
  async (params, thunkAPI) => {
    try {
      const response = await api.scoreAddHistory(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const removeOutlier = createAsyncThunk(
  "score-wizard-slice/remove-outlier",
  async (params, thunkAPI) => {
    try {
      const response = await api.scoreRemoveOutlier(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const configDrug = createAsyncThunk(
  "score-wizard-slice/config",
  async (params, thunkAPI) => {
    try {
      const response = await api.scoreConfigDrug(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const prepareGeneration = createAsyncThunk(
  "score-wizard-slice/prepare",
  async (params, thunkAPI) => {
    try {
      const response = await api.scorePrepareGeneration(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const generateSingle = createAsyncThunk(
  "score-wizard-slice/generate-single",
  async (params, thunkAPI) => {
    try {
      const response = await api.scoreGenerateSingle(params);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const scoreWizardSlice = createSlice({
  name: "scoreWizard",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(configDrug.pending, (state, action) => {
        state.configDrug.status = "loading";
      })
      .addCase(configDrug.fulfilled, (state, action) => {
        state.configDrug.status = "succeeded";
      })
      .addCase(configDrug.rejected, (state, action) => {
        state.configDrug.status = "failed";
      })
      .addCase(prepareGeneration.pending, (state, action) => {
        state.prepareGeneration.status = "loading";
      })
      .addCase(prepareGeneration.fulfilled, (state, action) => {
        state.prepareGeneration.status = "succeeded";
      })
      .addCase(prepareGeneration.rejected, (state, action) => {
        state.prepareGeneration.status = "failed";
      })
      .addCase(generateSingle.pending, (state, action) => {
        state.generateSingle.status = "loading";
      })
      .addCase(generateSingle.fulfilled, (state, action) => {
        state.generateSingle.status = "succeeded";
      })
      .addCase(generateSingle.rejected, (state, action) => {
        state.generateSingle.status = "failed";
      })
      .addCase(addHistory.pending, (state, action) => {
        state.addHistory.status = "loading";
      })
      .addCase(addHistory.fulfilled, (state, action) => {
        state.addHistory.status = "succeeded";
      })
      .addCase(addHistory.rejected, (state, action) => {
        state.addHistory.status = "failed";
      })
      .addCase(removeOutlier.pending, (state, action) => {
        state.removeOutlier.status = "loading";
      })
      .addCase(removeOutlier.fulfilled, (state, action) => {
        state.removeOutlier.status = "succeeded";
      })
      .addCase(removeOutlier.rejected, (state, action) => {
        state.removeOutlier.status = "failed";
      });
  },
});

export const { reset } = scoreWizardSlice.actions;

export default scoreWizardSlice.reducer;
