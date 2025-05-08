import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/regulation/api";
import hospital from "services/hospital";

const initialState = {
  data: {
    patient: {},
    extra: {},
    movements: [],
    id: null,
  },
  status: "loading",
  error: null,
  action: {
    open: false,
    status: "idle",
    error: null,
  },
  patient: {
    status: "idle",
    error: null,
    data: {},
  },
  modal: {
    clinicalNotes: false,
  },
};

export const fetchRegulation = createAsyncThunk(
  "regulation/fetch",
  async (params, thunkAPI) => {
    try {
      const response = await api.fetchRegulation(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const fetchPatient = createAsyncThunk(
  "regulation/fetch-patient",
  async (params, thunkAPI) => {
    try {
      const requestConfig = {
        listToRequest: [
          {
            idPatient:
              thunkAPI.getState().regulation.regulation.data.patient.id,
          },
        ],
        listToEscape: [],
        nameUrl: thunkAPI.getState().app.config.nameUrl,
        proxy: thunkAPI.getState().app.config.proxy,
        nameHeaders: thunkAPI.getState().app.config.nameHeaders,
        useCache: false,
        userRoles: thunkAPI.getState().user.account.roles,
        features: thunkAPI.getState().user.account.features,
      };

      const response = await hospital.getPatients(null, requestConfig);

      return {
        patientData:
          response[thunkAPI.getState().regulation.regulation.data.patient.id],
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const moveRegulation = createAsyncThunk(
  "regulation/move",
  async (params, thunkAPI) => {
    try {
      const response = await api.moveRegulation(params);

      return response;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const regulationSlice = createSlice({
  name: "regulationSlice",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setActionModal(state, action) {
      state.action.open = action.payload;
    },
    setClinicalNotesModal(state, action) {
      state.modal.clinicalNotes = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchRegulation.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchRegulation.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload.data.data;
      })
      .addCase(fetchRegulation.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        state.list = [];
      })
      .addCase(moveRegulation.pending, (state, action) => {
        state.action.status = "loading";
      })
      .addCase(moveRegulation.fulfilled, (state, action) => {
        state.action.status = "succeeded";
        const solicitation = action.payload.data.data[0];
        state.data.movements = solicitation.movements;
        state.data.stage = solicitation.stage;
        state.data.risk = solicitation.risk;
        state.data.extra = solicitation.extra;

        if (solicitation.extra?.regType?.type) {
          state.data.type = solicitation.extra.regType.type;
          state.data.idRegSolicitationType =
            solicitation.extra.regType.idRegSolicitationType;
        }
      })
      .addCase(moveRegulation.rejected, (state, action) => {
        state.action.status = "failed";
        state.action.error = action.error.message;
      })
      .addCase(fetchPatient.pending, (state, action) => {
        state.patient.status = "loading";
      })
      .addCase(fetchPatient.fulfilled, (state, action) => {
        state.patient.status = "succeeded";
        state.patient.data = action.payload.patientData;
      })
      .addCase(fetchPatient.rejected, (state, action) => {
        state.patient.status = "failed";
        state.patient.error = action.error.message;
      });
  },
});

export const { reset, setActionModal, setClinicalNotesModal } =
  regulationSlice.actions;

export default regulationSlice.reducer;
