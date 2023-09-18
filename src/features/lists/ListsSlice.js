import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/api";

const initialState = {
  status: "idle",
  error: null,
  substanceClasses: {
    list: [],
    status: "idle",
    error: null,
  },
  searchPrescriptions: {
    list: [],
    status: "idle",
    error: null,
  },
  searchDrugs: {
    list: [],
    status: "idle",
    error: null,
  },
  getMemory: {
    list: [],
    status: "idle",
    error: null,
  },
  searchSubstances: {
    list: [],
    status: "idle",
    error: null,
  },
  getExamRefs: {
    list: [],
    status: "idle",
    error: null,
  },
};

export const searchPrescriptions = createAsyncThunk(
  "lists/search-prescriptions",
  async (params, thunkAPI) => {
    const { access_token } = thunkAPI.getState().auth.identify;

    try {
      const response = await api.searchPrescriptions(access_token, params.term);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const fetchSubstanceClasses = createAsyncThunk(
  "lists/substance-classes",
  async (params, thunkAPI) => {
    const { access_token } = thunkAPI.getState().auth.identify;

    try {
      const response = await api.getSubstanceClasses(access_token, {});

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const searchSubstances = createAsyncThunk(
  "lists/search-substances",
  async (params, thunkAPI) => {
    try {
      const response = await api.findSubstances(null, params.term);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const searchDrugs = createAsyncThunk(
  "lists/search-drugs",
  async (params, thunkAPI) => {
    const { access_token } = thunkAPI.getState().auth.identify;

    try {
      const response = await api.getDrugsBySegment(
        access_token,
        params.idSegment,
        params
      );

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const getMemory = createAsyncThunk(
  "lists/get-memory",
  async (params, thunkAPI) => {
    try {
      const response = await api.getMemory(null, params.type);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const getExamRefs = createAsyncThunk(
  "lists/get-examRefs",
  async (params, thunkAPI) => {
    try {
      const response = await api.getExamRefs(null);

      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const listsSlice = createSlice({
  name: "lists",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchSubstanceClasses.pending, (state, action) => {
        state.substanceClasses.status = "loading";
      })
      .addCase(fetchSubstanceClasses.fulfilled, (state, action) => {
        state.substanceClasses.status = "succeeded";
        state.substanceClasses.list = action.payload.data;
      })
      .addCase(fetchSubstanceClasses.rejected, (state, action) => {
        state.substanceClasses.status = "failed";
        state.substanceClasses.error = action.error.message;
      })
      .addCase(searchPrescriptions.pending, (state, action) => {
        state.searchPrescriptions.status = "loading";
      })
      .addCase(searchPrescriptions.fulfilled, (state, action) => {
        state.searchPrescriptions.status = "succeeded";
        state.searchPrescriptions.list = action.payload.data;
      })
      .addCase(searchPrescriptions.rejected, (state, action) => {
        state.searchPrescriptions.status = "failed";
        state.searchPrescriptions.error = action.error.message;
      })
      .addCase(searchDrugs.pending, (state, action) => {
        state.searchDrugs.status = "loading";
      })
      .addCase(searchDrugs.fulfilled, (state, action) => {
        state.searchDrugs.status = "succeeded";
        state.searchDrugs.list = action.payload.data;
      })
      .addCase(searchDrugs.rejected, (state, action) => {
        state.searchDrugs.status = "failed";
        state.searchDrugs.error = action.error.message;
      })
      .addCase(getMemory.pending, (state, action) => {
        state.getMemory.status = "loading";
      })
      .addCase(getMemory.fulfilled, (state, action) => {
        state.getMemory.status = "succeeded";
        state.getMemory.list = action.payload.data;
      })
      .addCase(getMemory.rejected, (state, action) => {
        state.getMemory.status = "failed";
        state.getMemory.error = action.error.message;
      })
      .addCase(searchSubstances.pending, (state, action) => {
        state.searchSubstances.status = "loading";
      })
      .addCase(searchSubstances.fulfilled, (state, action) => {
        state.searchSubstances.status = "succeeded";
        state.searchSubstances.list = action.payload.data;
      })
      .addCase(searchSubstances.rejected, (state, action) => {
        state.searchSubstances.status = "failed";
        state.searchSubstances.error = action.error.message;
      })
      .addCase(getExamRefs.pending, (state, action) => {
        state.getExamRefs.status = "loading";
      })
      .addCase(getExamRefs.fulfilled, (state, action) => {
        state.getExamRefs.status = "succeeded";
        state.getExamRefs.list = action.payload.data;
      })
      .addCase(getExamRefs.rejected, (state, action) => {
        state.getExamRefs.status = "failed";
        state.getExamRefs.error = action.error.message;
      });
  },
});

export default listsSlice.reducer;
