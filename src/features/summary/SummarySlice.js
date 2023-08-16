import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/api";
import hospital from "services/hospital";

const initialState = {
  data: {},
  blocks: {
    patient: {
      text: null,
      ai: false,
    },
    admission: {
      text: null,
      ai: false,
    },
    reason: {
      text: null,
      ai: true,
      aiStatus: "paused",
    },
    diagnosis: {
      text: null,
      ai: true,
      aiStatus: "paused",
    },
    allergies: {
      text: null,
      ai: false,
    },
    previousDrugs: {
      text: null,
      ai: true,
      aiStatus: "paused",
    },
    clinicalSummary: {
      text: null,
      ai: true,
      aiStatus: "paused",
    },
    labExams: {
      text: null,
      ai: false,
    },
    textExams: {
      text: null,
      ai: true,
      aiStatus: "paused",
    },
    procedures: {
      text: null,
      ai: true,
      aiStatus: "paused",
    },
    drugsUsed: {
      text: null,
      ai: false,
    },
    drugsSuspended: {
      text: null,
      ai: false,
    },
    dischargeCondition: {
      text: null,
      ai: true,
      aiStatus: "paused",
    },
    dischargeStats: {
      text: null,
      ai: false,
    },
    dischargePlan: {
      text: null,
      ai: true,
      aiStatus: "paused",
    },
    recipe: {
      text: null,
      ai: false,
    },
  },
  status: "idle",
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

const summarySlice = createSlice({
  name: "summary",
  initialState,
  reducers: {
    setBlock(state, action) {
      state.blocks[action.payload.id].text = action.payload.data;
    },
    startBlock(state, action) {
      state.blocks[action.payload.id].aiStatus = "started";
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
      });
  },
});

export default summarySlice.reducer;

export const { setBlock, startBlock } = summarySlice.actions;
