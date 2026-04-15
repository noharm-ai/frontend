import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "services/api";
import hospital from "services/hospital";

export interface PatientRecord {
  idPatient: number;
  idPrescription: number;
  admissionNumber: string;
  namePatient: string | null;
  observation: string | null;
  refDate: string | null;
  birthdate: string | null;
  admissionDate: string | null;
  loadingName: boolean;
}

export interface OutpatientFilters {
  idSegment: number | null;
  idDepartment: number[];
  nextAppointmentStartDate: string | null;
  nextAppointmentEndDate: string | null;
  scheduledBy: number[];
  attendedBy: number[];
  appointment: "scheduled" | "not-scheduled" | null;
}

interface OutpatientPrioritizationState {
  list: PatientRecord[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  patients: {
    status: "idle" | "loading" | "succeeded" | "failed";
  };
}

const initialState: OutpatientPrioritizationState = {
  list: [],
  status: "idle",
  error: null,
  patients: {
    status: "idle",
  },
};

export const fetchPatientList = createAsyncThunk<
  PatientRecord[],
  OutpatientFilters
>(
  "outpatient/fetchPatientList",
  async (params, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as any;
      const { access_token } = state.auth.identify;
      const response = await api.getPatientList(access_token, params);
      return response.data.data as PatientRecord[];
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.response?.data ?? "Fetch failed");
    }
  }
);

export const fetchPatientNames = createAsyncThunk<void, void>(
  "outpatient/fetchPatientNames",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as any;
      const list: PatientRecord[] = state.outpatient.list;
      const { nameUrl, nameHeaders, proxy, multipleNameUrl } = state.app.config;

      const limit = 150;
      let offset = 0;
      const pages = Math.ceil(list.length / limit);

      for (let i = 0; i < pages; i++) {
        const items = list.slice(offset, offset + limit);
        offset += limit;

        await (hospital.getPatients as any)({
          listToRequest: items,
          nameUrl,
          nameHeaders,
          proxy,
          multipleNameUrl,
        });
      }
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.response?.data ?? "Name fetch failed");
    }
  }
);

const outpatientPrioritizationSlice = createSlice({
  name: "outpatient",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchPatientList.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPatientList.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchPatientList.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Unknown error";
        state.list = [];
      })
      .addCase(fetchPatientNames.pending, (state) => {
        state.patients.status = "loading";
      })
      .addCase(fetchPatientNames.fulfilled, (state) => {
        state.patients.status = "succeeded";
      })
      .addCase(fetchPatientNames.rejected, (state) => {
        state.patients.status = "failed";
      });
  },
});

export const { reset } = outpatientPrioritizationSlice.actions;
export const outpatientPrioritizationReducer =
  outpatientPrioritizationSlice.reducer;
