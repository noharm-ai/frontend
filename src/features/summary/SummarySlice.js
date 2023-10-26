import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/api";
import hospital from "services/hospital";

const initialState = {
  data: {},
  blocks: {
    patient: {
      text: null,
      original: null,
      ai: false,
      like: "idle",
    },
    admission: {
      text: null,
      original: null,
      ai: false,
      like: "idle",
    },
    reason: {
      text: null,
      original: null,
      ai: true,
      aiStatus: "paused",
      like: "idle",
    },
    diagnosis: {
      text: null,
      original: null,
      ai: true,
      aiStatus: "paused",
      like: "idle",
    },
    allergies: {
      text: null,
      original: null,
      ai: false,
      like: "idle",
    },
    previousDrugs: {
      text: null,
      original: null,
      ai: true,
      aiStatus: "paused",
      like: "idle",
    },
    clinicalSummary: {
      text: null,
      original: null,
      ai: true,
      aiStatus: "paused",
      like: "idle",
    },
    labExams: {
      text: null,
      original: null,
      ai: false,
      like: "idle",
    },
    textExams: {
      text: null,
      original: null,
      ai: true,
      aiStatus: "paused",
      like: "idle",
    },
    procedures: {
      text: null,
      original: null,
      ai: true,
      aiStatus: "paused",
      like: "idle",
    },
    drugsUsed: {
      text: null,
      original: null,
      ai: false,
      like: "idle",
    },
    drugsSuspended: {
      text: null,
      original: null,
      ai: false,
      like: "idle",
    },
    dischargeCondition: {
      text: null,
      original: null,
      ai: true,
      aiStatus: "paused",
      like: "idle",
    },
    dischargeStats: {
      text: null,
      original: null,
      ai: false,
      like: "idle",
    },
    dischargePlan: {
      text: null,
      original: null,
      ai: true,
      aiStatus: "paused",
      like: "idle",
    },
    recipe: {
      text: null,
      original: null,
      ai: false,
      like: "idle",
    },
  },
  status: "idle",
  saveStatus: "pending",
  error: null,
};

export const fetchSummary = createAsyncThunk(
  "summary/fetch",
  async (params, thunkAPI) => {
    const { access_token } = thunkAPI.getState().auth.identify;

    const { data } = await api.getSummary(
      access_token,
      params.admissionNumber,
      params.mock
    );

    const requestConfig = {
      listToRequest: [{ idPatient: data.data.patient.idPatient }],
      listToEscape: [],
      nameUrl: thunkAPI.getState().app.config.nameUrl,
      proxy: thunkAPI.getState().app.config.proxy,
      nameHeaders: thunkAPI.getState().app.config.nameHeaders,
      useCache: false,
      userRoles: thunkAPI.getState().user.account.roles,
    };

    const patientsList = await hospital.getPatients(
      access_token,
      requestConfig
    );

    data.data.patient.name = patientsList[data.data.patient.idPatient].name;

    return data;
  }
);

export const setLike = createAsyncThunk(
  "summary/setLike",
  async (params, thunkAPI) => {
    const { access_token } = thunkAPI.getState().auth.identify;

    const { data } = await api.putMemory(access_token, params);

    return data;
  }
);

const summarySlice = createSlice({
  name: "summary",
  initialState,
  reducers: {
    setBlock(state, action) {
      state.blocks[action.payload.id].text = action.payload.data;
      if (action.payload.original) {
        state.blocks[action.payload.id].original = action.payload.original;
      }

      state.saveStatus = "pending";
    },
    startBlock(state, action) {
      state.blocks[action.payload.id].aiStatus = "started";
    },
    setSaveStatus(state, action) {
      state.saveStatus = action.payload.saveStatus;
    },
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchSummary.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data;
      })
      .addCase(fetchSummary.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(setLike.pending, (state, action) => {
        state.blocks[action.meta.arg.block].like = "loading";
      })
      .addCase(setLike.fulfilled, (state, action) => {
        state.blocks[action.meta.arg.block].like = action.meta.arg.status;
      });
  },
});

export default summarySlice.reducer;

export const { setBlock, startBlock, reset, setSaveStatus } =
  summarySlice.actions;
