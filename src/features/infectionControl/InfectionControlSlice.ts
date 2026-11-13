import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import api from "services/api";
import { transformExams } from "utils/transformers";
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

// a result of an exam's history (GET /exams/:admissionNumber), newest first
export interface IExamHistoryItem {
  value: number | string | null;
  unit: string | null;
  date: string;
  // the reference of the segment; both 0 when the exam is not configured
  min: number | null;
  max: number | null;
  configured?: boolean;
}

// every exam of the patient, keyed by the type of the schema (key)
export interface IExamHistory {
  key: string;
  name: string | null;
  initials: string | null;
  // the NoHarm identifier the segment maps the type to, when it does
  tp_exam_ref?: string | null;
  unit: string | null;
  configured?: boolean;
  // the textual exams have no values to plot
  text: boolean;
  history: IExamHistoryItem[];
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

// a culture released after an evaluation watching cultures (CULTURE_RESULT)
export interface IReleasedCulture {
  material: string | null;
  microorganism: string | null;
  releaseDate: string;
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
    // EXAM_RESULT: every rule the exam results met
    matches?: IExamTriggerMatch[];
    // CULTURE_RESULT: the latest release and the new cultures, one per
    // material and microorganism, newest first
    releaseDate?: string;
    cultures?: IReleasedCulture[];
  } | null;
  createdAt: string;
}

/**
 * An exam trigger rule of the schema (schema params
 * infectionControl.examTriggers): a review turns it on per drug, and an exam
 * result meeting every condition it sets sends the patient back to pending
 * (EXAM_RESULT). Comparisons are strict.
 */
export interface IExamTriggerCondition {
  id: string;
  name: string;
  // the exam of the catalog (IExamTriggerExam): a NoHarm exam identifier
  // (tp_exam_ref), or ckd / ckd21, the eGFR the backend calculates from the
  // creatinine
  examRef: string;
  // above / below are strict (> <), at least / at most inclusive (>= <=)
  valueAbove: number | null;
  valueAtLeast: number | null;
  valueBelow: number | null;
  valueAtMost: number | null;
  // signed percent from the value at review time: 30 is a rise of more than
  // 30%, -25 a fall of more than 25%
  variationAbove: number | null;
  variationAtLeast: number | null;
  variationBelow: number | null;
  variationAtMost: number | null;
  // from this day of the course on (4: from D4)
  fromCourseDay: number | null;
}

export interface IExamTriggerRule extends IExamTriggerCondition {
  // turned on for a drug evaluated for the first time
  enabledByDefault: boolean;
  // false when the schema has no results for its exam: it never fires
  available: boolean;
}

// an exam of the catalog (public.exame) a rule is set on
export interface IExamTriggerExam {
  examRef: string;
  name: string;
  // false when the schema doesn't configure it (no active exam mapped to it,
  // or no creatinine for the eGFRs)
  available: boolean;
}

// the schema's rules, set by its users, and the catalog of exams
export interface IExamTriggers {
  rules: IExamTriggerRule[];
  exams: IExamTriggerExam[];
  // asked for an admission: its patient's latest result of each exam the
  // schema has (null without one), the baseline a review saved now keeps
  current?: Record<string, IExamTriggerResult | null>;
}

// a rule as saved: a new one has no id yet, the backend gives it one
export type IExamTriggerRulePayload = Omit<
  IExamTriggerRule,
  "id" | "available"
> & { id?: string };

// an exam result a rule is compared with
export interface IExamTriggerResult {
  examType: string;
  date: string;
  value: number;
  unit: string | null;
  // the creatinine an eGFR (ckd, ckd21) is calculated from
  rawValue?: number | null;
  rawUnit?: string | null;
}

// a rule an evaluation turned on, copied at review time with the result of
// then; a null baseline (no result at review time) never fires a variation
export interface IEvaluationExamTrigger extends IExamTriggerCondition {
  baseline: IExamTriggerResult | null;
}

// a rule an exam result met (EXAM_RESULT)
export interface IExamTriggerMatch {
  id: string;
  name: string;
  examRef: string;
  result: IExamTriggerResult;
  baseline: IExamTriggerResult | null;
  // percent from the baseline, null without one
  variation: number | null;
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
  // why the drug is given (AntimicrobialTreatmentTypeEnum) and the infections
  // it is given for (InfectionFocusEnum, one or more); empty in evaluations
  // made before they were asked, and the foci of a prophylaxis may be empty
  treatmentType?: number | null;
  infectionFoci?: number[];
  posology: IEvaluationPosology;
  // when the verdict starts to apply: the review, or earlier when backdated
  validFrom: string;
  validUntil: string;
  // optional reasons it sends the patient back to pending for
  // (InfectionControlPendingTypeEnum)
  triggers: number[];
  // the exam trigger rules it turned on, with their baselines; absent in
  // evaluations made before they existed
  examTriggers?: IEvaluationExamTrigger[];
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
  // AntimicrobialTreatmentTypeEnum
  treatmentType: number;
  // InfectionFocusEnum, one or more; empty only for a prophylaxis
  infectionFoci: number[];
  // between the course start and now; null applies it from the review
  validFrom: string | null;
  validUntil: string;
  triggers: number[];
  // the ids of the exam trigger rules turned on
  examTriggers: string[];
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
 * A culture of the patient released in the last 60 days (backend
 * services/infection_control/recent_cultures_service.py). A collection still
 * waiting for the lab gets a release date too, about the collection time
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
  // every collection, newest first: what the culture card lists. Missing
  // from a backend older than them (cultureCollections.collectionsOf)
  collections?: ICultureCollection[];
  // the latest culture of each exam and material, newest collection first:
  // what the report and the review's clinical note list
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

// an exam and material collected at one time, with each of its cultures (a
// bottle, a partial and a final report...) in the order the lab released them
export interface ICultureCollection {
  // the first culture of the collection
  id: string;
  examName: string | null;
  material: string | null;
  collectionDate: string | null;
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
  // the schema's exam trigger rules and the exams they can be set on,
  // loaded each time a review or the settings open
  examTriggers: {
    status: Status;
    list: IExamTriggerRule[];
    exams: IExamTriggerExam[];
    // the patient's current result of each exam, by its reference
    current: Record<string, IExamTriggerResult | null>;
    saveStatus: Status;
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
  // the history of every exam, for the exams the antimicrobial timeline
  // plots: loaded with the timeline
  examHistory: {
    status: Status;
    list: IExamHistory[];
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
  examTriggers: {
    status: "idle",
    list: [],
    exams: [],
    current: {},
    saveStatus: "idle",
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
  examHistory: {
    status: "idle",
    list: [],
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

// the history the "Ver todos" modal shows, read with the references of the
// segment. Kept apart from the modal's cache (ExamModalSlice), which is not
// told which admission its list is of
export const fetchExamHistory = createAsyncThunk(
  "infectionControl/fetchExamHistory",
  async (
    params: { admissionNumber: string; idSegment: number | null },
    thunkAPI,
  ) => {
    try {
      const response = await api.getExams(null, params.admissionNumber, {
        idSegment: params.idSegment ?? undefined,
      });
      return transformExams(response.data.data) as IExamHistory[];
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

// the rules an admin may change between reviews: loaded each time one opens,
// with the current results of the admission reviewed
export const fetchExamTriggers = createAsyncThunk(
  "infectionControl/fetchExamTriggers",
  async (params: { admissionNumber: number }, thunkAPI) => {
    try {
      const response = await api.infectionControl.getExamTriggers(
        params.admissionNumber,
      );
      return response.data.data as IExamTriggers;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
  },
);

// replaces the whole list: a rule left out is deleted
export const saveExamTriggers = createAsyncThunk(
  "infectionControl/saveExamTriggers",
  async (params: { rules: IExamTriggerRulePayload[] }, thunkAPI) => {
    try {
      const response = await api.infectionControl.saveExamTriggers(
        params.rules,
      );
      return response.data.data as IExamTriggers;
    } catch (err) {
      return thunkAPI.rejectWithValue((err as AxiosError).response?.data);
    }
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
      .addCase(fetchExamHistory.pending, (state, action) => {
        state.examHistory.status = "loading";
        state.examHistory.requestId = action.meta.requestId;
      })
      .addCase(fetchExamHistory.fulfilled, (state, action) => {
        if (state.examHistory.requestId !== action.meta.requestId) return;
        state.examHistory.status = "succeeded";
        state.examHistory.list = action.payload;
      })
      .addCase(fetchExamHistory.rejected, (state, action) => {
        if (state.examHistory.requestId !== action.meta.requestId) return;
        state.examHistory.status = "failed";
        state.examHistory.list = [];
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
      // another admission's results are never shown while loading
      .addCase(fetchExamTriggers.pending, (state) => {
        state.examTriggers.status = "loading";
        state.examTriggers.current = {};
      })
      .addCase(fetchExamTriggers.fulfilled, (state, action) => {
        state.examTriggers.status = "succeeded";
        state.examTriggers.list = action.payload?.rules ?? [];
        state.examTriggers.exams = action.payload?.exams ?? [];
        state.examTriggers.current = action.payload?.current ?? {};
      })
      .addCase(fetchExamTriggers.rejected, (state) => {
        state.examTriggers.status = "failed";
        state.examTriggers.list = [];
        state.examTriggers.exams = [];
        state.examTriggers.current = {};
      })
      // the backend gives the new rules their ids: the list is the one saved
      // (the current results stay: a save doesn't send them)
      .addCase(saveExamTriggers.pending, (state) => {
        state.examTriggers.saveStatus = "loading";
      })
      .addCase(saveExamTriggers.fulfilled, (state, action) => {
        state.examTriggers.saveStatus = "succeeded";
        state.examTriggers.status = "succeeded";
        state.examTriggers.list = action.payload?.rules ?? [];
        state.examTriggers.exams = action.payload?.exams ?? [];
      })
      .addCase(saveExamTriggers.rejected, (state) => {
        state.examTriggers.saveStatus = "failed";
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

export const { reset, setReviewOpen } = infectionControlSlice.actions;

export const infectionControlReducer = infectionControlSlice.reducer;
