import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/api";
import hospital from "services/hospital";

// how a course stands at the time of the request
export type CourseStatus = "active" | "suspended" | "finished";

// consecutive prescriptions with the same dose, frequency and route
export interface ICourseRegimen {
  start: string;
  end: string;
  dose: number | null;
  measureUnit: string | null;
  frequency: string | null;
  route: string | null;
}

// a break inside a course: a day the drug was not prescribed
export interface ICourseGap {
  start: string;
  end: string;
}

/**
 * One antimicrobial course: the prescriptions of the same drug merged into a
 * single span, whether the hospital re-prescribes it every day or keeps a CPOE
 * order (backend services/antimicrobial_timeline_service.py)
 */
export interface ICourse {
  idDrug: number;
  drug: string;
  substance: string | null;
  // AWaRe group (features/culture/awareLevel)
  atbLevel: number | null;
  cpoe: boolean;
  status: CourseStatus;
  start: string;
  // when it stopped, or will stop (expire date of the latest prescription)
  end: string;
  // when it is meant to stop: the CPOE order expire date or, for daily
  // prescribers, the total period sent by the integration
  plannedEnd: string | null;
  plannedDays: number | null;
  // started days of treatment up to now, or up to the end when it is over
  days: number;
  lastIdPrescription: string;
  prescriptionCount: number;
  regimens: ICourseRegimen[];
  gaps: ICourseGap[];
}

export interface ITimelinePatient {
  idPatient: string;
  admissionNumber: number;
  admissionDate: string | null;
  dischargeDate: string | null;
  dischargeReason: string | null;
  birthdate: string | null;
  gender: string | null;
  weight: number | null;
  weightDate: string | null;
  height: number | null;
  // latest prescription of the admission
  idPrescription: string | null;
  bed: string | null;
  record: string | null;
  department: string | null;
  segment: string | null;
}

export interface IAntimicrobialTimeline {
  // server time the courses were judged at
  now: string;
  patient: ITimelinePatient;
  courses: ICourse[];
}

type Status = "idle" | "loading" | "succeeded" | "failed";

interface IAntimicrobialTimelineSlice {
  status: Status;
  data: IAntimicrobialTimeline | null;
  // i18n code of a failed load (errors.invalidRecord: unknown admission)
  errorCode: string | null;
}

const initialState: IAntimicrobialTimelineSlice = {
  status: "idle",
  data: null,
  errorCode: null,
};

export const fetchAntimicrobialTimeline = createAsyncThunk(
  "antimicrobialTimeline/fetch",
  async (params: { admissionNumber: string }, thunkAPI) => {
    try {
      const response = await api.antimicrobial.getTimeline(
        params.admissionNumber,
      );
      const data: IAntimicrobialTimeline = response.data.data;

      // the name comes from the hospital name service; PatientNameCache shows
      // it once it arrives, so the timeline does not wait for it
      const { config } = (thunkAPI.getState() as any).app;
      // the JSDoc of getPatients leaves out the name service settings
      (hospital.getPatients as any)({
        listToRequest: [
          {
            idPatient: data.patient.idPatient,
            birthdate: data.patient.birthdate,
          },
        ],
        nameUrl: config.nameUrl,
        proxy: config.proxy,
        nameHeaders: config.nameHeaders,
      }).catch(() => {});

      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

const antimicrobialTimelineSlice = createSlice({
  name: "antimicrobialTimeline",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchAntimicrobialTimeline.pending, (state) => {
        state.status = "loading";
        state.errorCode = null;
      })
      .addCase(fetchAntimicrobialTimeline.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchAntimicrobialTimeline.rejected, (state, action) => {
        state.status = "failed";
        state.data = null;
        state.errorCode =
          (action.payload as { code?: string } | undefined)?.code ?? null;
      });
  },
});

export const { reset } = antimicrobialTimelineSlice.actions;

export const antimicrobialTimelineReducer = antimicrobialTimelineSlice.reducer;
