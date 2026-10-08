import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
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
 * order (backend services/infection_control/antimicrobial_timeline_service.py)
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

export interface IInfectionControlPatient {
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
  patient: IInfectionControlPatient;
  courses: ICourse[];
}

// an open reason that keeps the admission pending
export interface IFollowUpPending {
  id: string;
  // InfectionControlPendingTypeEnum
  type: number;
  origin: number;
  idDrug: number | null;
  idPrescription: string | null;
  details: {
    drug?: string;
    courseStart?: string;
    // EXPIRED: when the evaluation stopped holding
    validUntil?: string;
    // POSOLOGY_CHANGED: the posology evaluated and the one prescribed now
    evaluated?: IEvaluationPosology;
    current?: IEvaluationPosology;
  } | null;
  createdAt: string;
}

// how the posology was when the drug was evaluated
export interface IEvaluationPosology {
  idPrescriptionDrug: string;
  dose: number | null;
  doseconv: number | null;
  measureUnit: string | null;
  frequency: string | null;
  dailyFrequency: number | null;
  route: string | null;
}

// conformity of one antimicrobial course, recorded in a review
export interface IAntimicrobialEvaluation {
  id: string;
  idReview: string;
  idDrug: number;
  idPrescription: string;
  courseStart: string;
  conforming: boolean;
  notes: string | null;
  posology: IEvaluationPosology;
  validUntil: string;
  // optional reasons it sends the patient back to pending for
  // (InfectionControlPendingTypeEnum)
  triggers: number[];
  // AntimicrobialEvaluationStatusEnum
  status: number;
  closedAt: string | null;
  closingType: number | null;
  createdAt: string;
  createdBy: string | null;
}

// the evaluations of one course; idDrug + start match an ICourse
export interface IFollowUpCourse {
  idDrug: number;
  start: string;
  ongoing: boolean;
  evaluation: IAntimicrobialEvaluation | null;
  // every evaluation of the course, latest first
  history: IAntimicrobialEvaluation[];
}

export interface IFollowUpReview {
  id: string;
  notes: string | null;
  nextReviewDate: string | null;
  createdAt: string;
  createdBy: string | null;
}

/**
 * Infection control follow-up of an admission
 * (backend services/infection_control/infection_control_service.py). Only
 * `enabled` and `admissionNumber` come when the schema has not turned the
 * feature on.
 */
export interface IFollowUp {
  enabled: boolean;
  admissionNumber: number;
  followed?: boolean;
  // InfectionControlStatusEnum, null when the admission is not followed
  status?: number | null;
  statusDate?: string | null;
  nextReviewDate?: string | null;
  recalculatedAt?: string | null;
  pendings?: IFollowUpPending[];
  reviews?: IFollowUpReview[];
  courses?: IFollowUpCourse[];
}

export interface IReviewEvaluationPayload {
  idDrug: number;
  conforming: boolean;
  notes: string | null;
  validUntil: string;
  triggers: number[];
}

export interface IReviewPayload {
  admissionNumber: number;
  notes: string | null;
  nextReviewDate: string | null;
  evaluations: IReviewEvaluationPayload[];
}

type Status = "idle" | "loading" | "succeeded" | "failed";

interface IInfectionControlSlice {
  status: Status;
  data: IAntimicrobialTimeline | null;
  // i18n code of a failed load (errors.invalidRecord: unknown admission)
  errorCode: string | null;
  followUp: {
    status: Status;
    data: IFollowUp | null;
  };
  review: {
    open: boolean;
    status: Status;
  };
  // starting the follow-up of an admission by hand
  follow: {
    status: Status;
  };
}

const initialState: IInfectionControlSlice = {
  status: "idle",
  data: null,
  errorCode: null,
  followUp: {
    status: "idle",
    data: null,
  },
  review: {
    open: false,
    status: "idle",
  },
  follow: {
    status: "idle",
  },
};

export const fetchAntimicrobialTimeline = createAsyncThunk(
  "infectionControl/fetchAntimicrobialTimeline",
  async (params: { admissionNumber: string }, thunkAPI) => {
    try {
      const response = await api.infectionControl.getAntimicrobialTimeline(
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

export const fetchFollowUp = createAsyncThunk(
  "infectionControl/fetchFollowUp",
  async (params: { admissionNumber: string }, thunkAPI) => {
    try {
      const response = await api.infectionControl.getAdmission(
        params.admissionNumber,
      );
      return response.data.data as IFollowUp;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

export const saveReview = createAsyncThunk(
  "infectionControl/saveReview",
  async (params: IReviewPayload, thunkAPI) => {
    try {
      const response = await api.infectionControl.saveReview(params);
      return response.data.data as IFollowUp;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

export const followAdmission = createAsyncThunk(
  "infectionControl/followAdmission",
  async (params: { admissionNumber: string }, thunkAPI) => {
    try {
      const response = await api.infectionControl.followAdmission(
        params.admissionNumber,
      );
      return response.data.data as IFollowUp;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

const infectionControlSlice = createSlice({
  name: "infectionControl",
  initialState,
  reducers: {
    reset() {
      return initialState;
    },
    setReviewOpen(state, action: PayloadAction<boolean>) {
      state.review.open = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchFollowUp.pending, (state) => {
        state.followUp.status = "loading";
      })
      .addCase(fetchFollowUp.fulfilled, (state, action) => {
        state.followUp.status = "succeeded";
        state.followUp.data = action.payload;
      })
      .addCase(fetchFollowUp.rejected, (state) => {
        state.followUp.status = "failed";
        state.followUp.data = null;
      })
      .addCase(saveReview.pending, (state) => {
        state.review.status = "loading";
      })
      .addCase(saveReview.fulfilled, (state, action) => {
        state.review.status = "succeeded";
        state.review.open = false;
        state.followUp.status = "succeeded";
        state.followUp.data = action.payload;
      })
      .addCase(saveReview.rejected, (state) => {
        state.review.status = "failed";
      })
      .addCase(followAdmission.pending, (state) => {
        state.follow.status = "loading";
      })
      .addCase(followAdmission.fulfilled, (state, action) => {
        state.follow.status = "succeeded";
        state.followUp.status = "succeeded";
        state.followUp.data = action.payload;
      })
      .addCase(followAdmission.rejected, (state) => {
        state.follow.status = "failed";
      })
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

export const { reset, setReviewOpen } = infectionControlSlice.actions;

export const infectionControlReducer = infectionControlSlice.reducer;
