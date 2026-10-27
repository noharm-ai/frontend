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
  // dose per Kg and per Kg a day, as the screening shows them
  // ("0,04 g/Kg ou 40,00 mg/Kg"); null without a patient weight
  doseWeight?: string | null;
  doseWeightDay?: string | null;
  // the observation of the regimen's latest prescribed item (complemento)
  notes?: string | null;
}

// a break inside a course: a day the drug was not prescribed
export interface ICourseGap {
  start: string;
  end: string;
}

// an alert of the screening (backend services/alert_service.py and
// alert_interaction_service.py), as the prescription view lists them
// (alertsComplete)
export interface IDrugAlert {
  idPrescriptionDrug: string;
  key: string;
  // drugAlertType: maxDose, kidney, liver, it (interaction), ...
  type: string;
  level: "high" | "medium" | "low";
  text: string;
  // the substance has a handling text for this type of alert
  handling?: boolean;
}

// the levels of the screening alerts, the most severe first
export const ALERT_LEVELS: IDrugAlert["level"][] = ["high", "medium", "low"];

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
  // the alerts the screening raises for the course in the screening
  // prescription, most severe first; empty for a course not prescribed there
  alerts?: IDrugAlert[];
  // the substance of the drug, for the handling of the alerts
  idSubstance?: string | null;
}

// the prescription the screening shows for the patient now (the latest
// prescription-day, or the latest prescription without one): the exams and the
// alerts are read from it
export interface IScreeningPrescription {
  idPrescription: string;
  date: string;
  agg: boolean;
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
  idSegment: number | null;
}

// one exam of the screening exam card
// (backend prescription_view_service._build_exams_card)
export interface IExamCardItem {
  key: string;
  value: {
    value: number | null;
    unit: string | null;
    alert: boolean;
    date: string | null;
    ref: string | null;
    initials: string | null;
    name: string | null;
    delta: number | null;
  };
}

export interface IAntimicrobialTimeline {
  // server time the courses were judged at
  now: string;
  patient: IInfectionControlPatient;
  courses: ICourse[];
  // null when the admission has no prescription
  screeningPrescription?: IScreeningPrescription | null;
  // the exam card of the screening, for the screening prescription (empty
  // when the admission has none)
  exams: IExamCardItem[];
  // how many of them are out of range
  alertExams: number;
}

// the antimicrobial timeline comes with the follow-up, judged from the same
// courses at the same time; null when the follow-up failed to load
interface IAntimicrobialTimelineResponse extends IAntimicrobialTimeline {
  followUp: IFollowUp | null;
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

// an intervention reason that can justify a non-conformity (flagged for
// infection control in motivointervencao)
export interface IInterventionReason {
  id: number;
  // with the name of its parent reason, as the intervention form shows it
  name: string;
  // whether it relates the drug to another, the substitute, optionally or
  // necessarily (InterventionReasonRelationType)
  relationType: number;
}

// an antimicrobial recommended instead of the one evaluated
export interface ISubstituteDrug {
  id: number;
  name: string | null;
}

// an intervention recorded by a review, kept by infection control
export interface IEvaluationIntervention {
  id: string;
  // the intervention status: "s" pending its outcome, "a" accepted...
  status: string;
}

// conformity of one antimicrobial course, recorded in a review
export interface IAntimicrobialEvaluation {
  id: string;
  idReview: string;
  idDrug: number;
  idPrescription: string;
  courseStart: string;
  conforming: boolean;
  // the reasons of a non-conformity
  interventionReasons?: { id: number; name: string | null }[];
  // the drug recommended instead, for reasons related to another drug
  substituteDrug?: ISubstituteDrug | null;
  // the interventions it recorded on the drug
  interventions?: IEvaluationIntervention[];
  notes: string | null;
  posology: IEvaluationPosology;
  // when the verdict starts to apply: the review, or earlier when backdated
  validFrom: string;
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
  // the prescription-day the record points at, where a review and its
  // clinical note are written; null when it has none
  idPrescription?: string | null;
  pendings?: IFollowUpPending[];
  reviews?: IFollowUpReview[];
  courses?: IFollowUpCourse[];
}

export interface IReviewEvaluationPayload {
  idDrug: number;
  conforming: boolean;
  // the reasons of a non-conformity, empty when conforming
  interventionReasons: number[];
  // record an intervention on the drug with the reasons
  createIntervention: boolean;
  // the drug recommended instead, only for reasons related to another drug
  substituteDrug: number | null;
  notes: string | null;
  // between the course start and now; null applies it from the review
  validFrom: string | null;
  validUntil: string;
  triggers: number[];
}

// a type a clinical note is given (tipoevolucao)
export interface IClinicalNoteType {
  id: string;
  name: string;
}

// the clinical note a review writes in the patient's record
export interface IReviewClinicalNotePayload {
  idClinicalNoteType: string;
  text: string;
}

export interface IReviewPayload {
  admissionNumber: number;
  notes: string | null;
  nextReviewDate: string | null;
  evaluations: IReviewEvaluationPayload[];
  // null when the review is saved without a note
  clinicalNote: IReviewClinicalNotePayload | null;
}

/**
 * The latest culture of an exam and material of the patient, released in the
 * last 60 days (backend services/infection_control/recent_cultures_service.py).
 * The latest is the newest collection, so it may still be waiting for the lab
 */
export interface IRecentCulture {
  id: string;
  examName: string | null;
  material: string | null;
  collectionDate: string | null;
  releaseDate: string | null;
  gram: string | null;
  // as the lab wrote it: HTML from some hospitals, plain text from others
  previousResult: string | null;
  // named by the antibiogram rows of the culture
  microorganisms: string[];
}

export interface IRecentCultures {
  admissionNumber: number;
  releasedSince: string;
  cultures: IRecentCulture[];
}

// a released result of the antibiogram of a culture. A prediction is never
// one: the backend leaves the rows without a lab result out
export interface IAntibiogramResult {
  microorganism: string | null;
  drug: string;
  // as the lab wrote it
  result: string;
  // R, S or the U of a wording the backend could not classify, read as the
  // culture card reads it (features/culture/cultureResistance)
  resultType: string;
  resultDetail: string | null;
  // MIC as the lab reports it, qualifier included ("<=0.5")
  mic: string | null;
}

export interface ICultureWithAntibiogram extends IRecentCulture {
  // empty while the collection waits for the lab
  antibiogram: IAntibiogramResult[];
}

// every culture of the patient with the exam and material of one culture,
// each with its antibiogram
export interface ICultureHistory {
  admissionNumber: number;
  examName: string | null;
  material: string | null;
  cultures: ICultureWithAntibiogram[];
}

type Status = "idle" | "loading" | "succeeded" | "failed";

interface IInfectionControlSlice {
  status: Status;
  data: IAntimicrobialTimeline | null;
  // i18n code of a failed load (errors.invalidRecord: unknown admission)
  errorCode: string | null;
  // the latest load: a response to an older one (another admission, or a
  // retry overtaken) is dropped
  requestId: string | null;
  followUp: {
    status: Status;
    data: IFollowUp | null;
    requestId: string | null;
  };
  review: {
    open: boolean;
    status: Status;
  };
  // starting the follow-up of an admission by hand
  follow: {
    status: Status;
  };
  // the reasons a non-conformity can be given, loaded once
  interventionReasons: {
    status: Status;
    list: IInterventionReason[];
  };
  // the types the note of a review can be given, loaded once
  clinicalNoteTypes: {
    status: Status;
    list: IClinicalNoteType[];
  };
  // the drugs found for a substitute, by the latest search
  substituteSearch: {
    status: Status;
    list: ISubstituteDrug[];
    requestId: string | null;
  };
  // only informative: loaded apart, so a failure here leaves the page whole
  cultures: {
    status: Status;
    data: IRecentCultures | null;
    requestId: string | null;
  };
  // the antibiogram of a row of the recent cultures and the other collections
  // of its exam and material, opened on click
  cultureHistory: {
    // the culture whose row was clicked, null while it is closed
    culture: IRecentCulture | null;
    status: Status;
    data: ICultureHistory | null;
    requestId: string | null;
  };
}

const initialState: IInfectionControlSlice = {
  status: "idle",
  data: null,
  errorCode: null,
  requestId: null,
  followUp: {
    status: "idle",
    data: null,
    requestId: null,
  },
  review: {
    open: false,
    status: "idle",
  },
  follow: {
    status: "idle",
  },
  interventionReasons: {
    status: "idle",
    list: [],
  },
  clinicalNoteTypes: {
    status: "idle",
    list: [],
  },
  substituteSearch: {
    status: "idle",
    list: [],
    requestId: null,
  },
  cultures: {
    status: "idle",
    data: null,
    requestId: null,
  },
  cultureHistory: {
    culture: null,
    status: "idle",
    data: null,
    requestId: null,
  },
};

export const fetchAntimicrobialTimeline = createAsyncThunk(
  "infectionControl/fetchAntimicrobialTimeline",
  async (params: { admissionNumber: string }, thunkAPI) => {
    try {
      const response = await api.infectionControl.getAntimicrobialTimeline(
        params.admissionNumber,
      );
      const data: IAntimicrobialTimelineResponse = response.data.data;

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

// the follow-up alone, to retry it when it failed to come with the timeline
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

export const fetchRecentCultures = createAsyncThunk(
  "infectionControl/fetchRecentCultures",
  async (params: { admissionNumber: string }, thunkAPI) => {
    try {
      const response = await api.infectionControl.getRecentCultures(
        params.admissionNumber,
      );
      return response.data.data as IRecentCultures;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

export const fetchCultureHistory = createAsyncThunk(
  "infectionControl/fetchCultureHistory",
  async (
    params: { admissionNumber: string; culture: IRecentCulture },
    thunkAPI,
  ) => {
    try {
      const response = await api.infectionControl.getCultureHistory(
        params.admissionNumber,
        params.culture.id,
      );
      return response.data.data as ICultureHistory;
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

// the active intervention reasons flagged for infection control
export const fetchInterventionReasons = createAsyncThunk(
  "infectionControl/fetchInterventionReasons",
  async (_, thunkAPI) => {
    try {
      const response = await api.infectionControl.getInterventionReasons();
      const reasons: {
        id: number;
        name: string;
        parentName: string | null;
        relationType: number;
        infectionControl: boolean;
      }[] = response.data.data;

      return reasons
        .filter((reason) => reason.infectionControl)
        .map((reason): IInterventionReason => ({
          id: reason.id,
          name: reason.parentName
            ? `${reason.parentName} - ${reason.name}`
            : reason.name,
          relationType: reason.relationType,
        }));
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
  {
    // the list does not change while the page is open
    condition: (_, { getState }) =>
      !["loading", "succeeded"].includes(
        (getState() as any).infectionControl.interventionReasons.status,
      ),
  },
);

export const fetchClinicalNoteTypes = createAsyncThunk(
  "infectionControl/fetchClinicalNoteTypes",
  async (_, thunkAPI) => {
    try {
      const response = await api.infectionControl.getClinicalNoteTypes();
      return response.data.data as IClinicalNoteType[];
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
  {
    // the list does not change while the page is open
    condition: (_, { getState }) =>
      !["loading", "succeeded"].includes(
        (getState() as any).infectionControl.clinicalNoteTypes.status,
      ),
  },
);

export const searchSubstituteDrugs = createAsyncThunk(
  "infectionControl/searchSubstituteDrugs",
  async (params: { term: string }, thunkAPI) => {
    try {
      const response = await api.infectionControl.searchAntimicrobials(
        params.term,
      );

      return response.data.data as ISubstituteDrug[];
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

// a review or a follow-up start saved for the admission on screen, not one the
// page has left (reset) while it was saving
const isShownAdmission = (state: IInfectionControlSlice, followUp: IFollowUp) =>
  state.followUp.data?.admissionNumber === followUp.admissionNumber;

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
    closeCultureHistory(state) {
      state.cultureHistory = initialState.cultureHistory;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchFollowUp.pending, (state, action) => {
        state.followUp.status = "loading";
        state.followUp.requestId = action.meta.requestId;
      })
      .addCase(fetchFollowUp.fulfilled, (state, action) => {
        if (state.followUp.requestId !== action.meta.requestId) return;
        state.followUp.status = "succeeded";
        state.followUp.data = action.payload;
      })
      .addCase(fetchFollowUp.rejected, (state, action) => {
        if (state.followUp.requestId !== action.meta.requestId) return;
        state.followUp.status = "failed";
        state.followUp.data = null;
      })
      .addCase(fetchRecentCultures.pending, (state, action) => {
        state.cultures.status = "loading";
        state.cultures.requestId = action.meta.requestId;
      })
      .addCase(fetchRecentCultures.fulfilled, (state, action) => {
        if (state.cultures.requestId !== action.meta.requestId) return;
        state.cultures.status = "succeeded";
        state.cultures.data = action.payload;
      })
      .addCase(fetchRecentCultures.rejected, (state, action) => {
        if (state.cultures.requestId !== action.meta.requestId) return;
        state.cultures.status = "failed";
        state.cultures.data = null;
      })
      .addCase(fetchCultureHistory.pending, (state, action) => {
        state.cultureHistory.culture = action.meta.arg.culture;
        state.cultureHistory.status = "loading";
        state.cultureHistory.data = null;
        state.cultureHistory.requestId = action.meta.requestId;
      })
      .addCase(fetchCultureHistory.fulfilled, (state, action) => {
        if (state.cultureHistory.requestId !== action.meta.requestId) return;
        state.cultureHistory.status = "succeeded";
        state.cultureHistory.data = action.payload;
      })
      .addCase(fetchCultureHistory.rejected, (state, action) => {
        if (state.cultureHistory.requestId !== action.meta.requestId) return;
        state.cultureHistory.status = "failed";
        state.cultureHistory.data = null;
      })
      .addCase(saveReview.pending, (state) => {
        state.review.status = "loading";
      })
      .addCase(saveReview.fulfilled, (state, action) => {
        state.review.status = "succeeded";
        if (!isShownAdmission(state, action.payload)) return;
        state.review.open = false;
        state.followUp.status = "succeeded";
        state.followUp.data = action.payload;
      })
      .addCase(saveReview.rejected, (state) => {
        state.review.status = "failed";
      })
      .addCase(fetchInterventionReasons.pending, (state) => {
        state.interventionReasons.status = "loading";
      })
      .addCase(fetchInterventionReasons.fulfilled, (state, action) => {
        state.interventionReasons.status = "succeeded";
        state.interventionReasons.list = action.payload;
      })
      .addCase(fetchInterventionReasons.rejected, (state) => {
        state.interventionReasons.status = "failed";
      })
      .addCase(fetchClinicalNoteTypes.pending, (state) => {
        state.clinicalNoteTypes.status = "loading";
      })
      .addCase(fetchClinicalNoteTypes.fulfilled, (state, action) => {
        state.clinicalNoteTypes.status = "succeeded";
        state.clinicalNoteTypes.list = action.payload;
      })
      .addCase(fetchClinicalNoteTypes.rejected, (state) => {
        state.clinicalNoteTypes.status = "failed";
      })
      // only the latest search fills the list
      .addCase(searchSubstituteDrugs.pending, (state, action) => {
        state.substituteSearch.status = "loading";
        state.substituteSearch.requestId = action.meta.requestId;
      })
      .addCase(searchSubstituteDrugs.fulfilled, (state, action) => {
        if (state.substituteSearch.requestId !== action.meta.requestId) return;
        state.substituteSearch.status = "succeeded";
        state.substituteSearch.list = action.payload;
      })
      .addCase(searchSubstituteDrugs.rejected, (state, action) => {
        if (state.substituteSearch.requestId !== action.meta.requestId) return;
        state.substituteSearch.status = "failed";
        state.substituteSearch.list = [];
      })
      .addCase(followAdmission.pending, (state) => {
        state.follow.status = "loading";
      })
      .addCase(followAdmission.fulfilled, (state, action) => {
        state.follow.status = "succeeded";
        if (!isShownAdmission(state, action.payload)) return;
        state.followUp.status = "succeeded";
        state.followUp.data = action.payload;
      })
      .addCase(followAdmission.rejected, (state) => {
        state.follow.status = "failed";
      })
      .addCase(fetchAntimicrobialTimeline.pending, (state, action) => {
        state.status = "loading";
        state.errorCode = null;
        state.requestId = action.meta.requestId;
        // the follow-up comes with it: a follow-up retry still running is
        // dropped when it arrives
        state.followUp.status = "loading";
        state.followUp.requestId = action.meta.requestId;
      })
      .addCase(fetchAntimicrobialTimeline.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        const { followUp, ...data } = action.payload;
        state.status = "succeeded";
        state.data = data;
        state.followUp.status = followUp ? "succeeded" : "failed";
        state.followUp.data = followUp;
      })
      .addCase(fetchAntimicrobialTimeline.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.status = "failed";
        state.data = null;
        state.errorCode =
          (action.payload as { code?: string } | undefined)?.code ?? null;
        state.followUp.status = "failed";
        state.followUp.data = null;
      });
  },
});

export const { reset, setReviewOpen, closeCultureHistory } =
  infectionControlSlice.actions;

export const infectionControlReducer = infectionControlSlice.reducer;
