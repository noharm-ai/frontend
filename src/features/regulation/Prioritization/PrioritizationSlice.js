import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "services/regulation/api";
import hospital from "services/hospital";

import { updateNames } from "store/ducks/patients/thunk";

const initialState = {
  list: [],
  status: "idle",
  error: null,
  filters: {
    typeList: [],
  },
  order: [
    {
      field: "date",
      direction: "asc",
    },
  ],
  currentPage: 1,
  count: 0,
  patients: {
    status: "idle",
  },
};

export const fetchRegulationList = createAsyncThunk(
  "regulation-prioritization/fetch",
  async (params, thunkAPI) => {
    try {
      const response = await api.fetchRegulationList(params);

      return { response, patients: thunkAPI.getState().patients.list };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

export const fetchPatients = createAsyncThunk(
  "regulation-prioritization/fetch-patients",
  async (params, thunkAPI) => {
    try {
      const requestConfig = {
        listToRequest: thunkAPI
          .getState()
          .regulation.prioritization.list.map((r) => ({
            idPatient: r.idPatient,
            birthdate: r.birthdate,
          })),
        listToEscape: thunkAPI.getState().patients.list,
        nameUrl: thunkAPI.getState().app.config.nameUrl,
        multipleNameUrl: thunkAPI.getState().app.config.multipleNameUrl,
        proxy: thunkAPI.getState().app.config.proxy,
        nameHeaders: thunkAPI.getState().app.config.nameHeaders,
        useCache: true,
        userRoles: thunkAPI.getState().user.account.roles,
        features: thunkAPI.getState().user.account.features,
      };

      const response = await hospital.getPatients(null, requestConfig);

      thunkAPI.dispatch(updateNames(response));

      return {
        patientData: response,
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response.data);
    }
  }
);

const regulationPrioritizationSlice = createSlice({
  name: "regulationPrioritizationSlice",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setFilters(state, action) {
      state.filters = action.payload;
    },
    setCurrentPage(state, action) {
      state.currentPage = action.payload;
    },
    updateOrder(state, action) {
      state.order = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchRegulationList.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchRegulationList.fulfilled, (state, action) => {
        state.status = "succeeded";
        const patients = action.payload.patients;
        const list = action.payload.response.data.data.list.map((p) => ({
          ...p,
          patientName: patients[p.idPatient]?.name,
          patientNameLoading: !Object.hasOwn(patients, p.idPatient),
        }));

        state.list = list;
        state.count = action.payload.response.data.data.count;
      })
      .addCase(fetchRegulationList.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        state.list = [];
      })
      .addCase(fetchPatients.pending, (state, action) => {
        state.patients.status = "loading";
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.patients.status = "succeeded";
        const patients = action.payload.patientData;

        state.list = state.list.map((p) => ({
          ...p,
          patientName: patients[p.idPatient]?.name,
          patientNameLoading: false,
        }));
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.patients.status = "failed";
        state.patients.error = action.error.message;
      });
  },
});

export const { reset, setFilters, setCurrentPage, updateOrder } =
  regulationPrioritizationSlice.actions;

export default regulationPrioritizationSlice.reducer;
