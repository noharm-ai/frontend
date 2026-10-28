import type { Dayjs } from "dayjs";

/**
 * The answer of POST /reports/consolidated/infection-control, as the private
 * backend builds it (services/reports/infection_control_report_service.py):
 * shares are 0-1, a missing number is null.
 */

export interface IQuantiles {
  median: number | null;
  p90: number | null;
  count: number;
}

export interface IBin {
  label: string;
  count: number;
  share: number | null;
}

export interface INamedCount {
  reason: string;
  count: number;
}

// antimicrobial days by the record in force on them
export interface IVerdictDays {
  conforming: number;
  non_conforming: number;
  not_evaluated: number;
  expired: number;
}

export interface IOverview {
  admissionsClosed: number;
  admissionsFollowed: number;
  courses: number;
  dot: number;
  lot: number;
  dotLot: number | null;
  patientDays: number;
  dotPer1000PatientDays: number | null;
  accessShare: number | null;
  evaluations: number;
  conformingShare: number | null;
  evaluatedByD3Share: number | null;
  timeToFirstReviewHours: IQuantiles;
  interventionAcceptance: number | null;
  interventionsWithOutcome: number;
}

export interface IDepartmentRow {
  idDepartment: number;
  department: string | null;
  admissions: number;
  dot: number;
  dotPer1000PatientDays: number | null;
  accessShare: number | null;
  conformingShare: number | null;
  evaluatedByD3Share: number | null;
  timeToFirstReviewHours: number | null;
  interventionAcceptance: number | null;
  pendingTimeShare: number | null;
  verdictDays: IVerdictDays;
}

// the scale of the trend chart
export type TrendScale = "month" | "day";

// a month (YYYY-MM) or a day (YYYY-MM-DD) of the trend
export interface ITrendPoint {
  period: string;
  dot: number;
  // antimicrobial days by the record in force on them
  verdictDays: IVerdictDays;
}

export interface IPendingRow {
  type: number;
  opened: number;
  stillOpen: number;
  hoursOpen: IQuantiles;
  resolvedByTeamShare: number | null;
}

export interface IReviewerRow {
  idReviewer: number | null;
  reviewer: string | null;
  evaluations: number;
  admissions: number;
  nonConformingShare: number | null;
}

export interface IProcess {
  admissionsReviewedShare: number | null;
  coursesEvaluatedShare: number | null;
  reviewsPerAdmission: number | null;
  reviewsPer100Dot: number | null;
  reviewIntervalHours: IQuantiles;
  timeToFirstReviewBins: IBin[];
  timeToFirstEvaluationHours: IQuantiles;
  pendings: IPendingRow[];
  pendingResolutions: Record<string, number>;
  pendingTimeShare: number | null;
  retroactiveShare: number | null;
  reviewers: IReviewerRow[];
}

export interface ISubstanceEvaluations {
  idSubstance: number | null;
  substance: string | null;
  evaluations: number;
  conformingShare: number | null;
}

export interface ISubstitution {
  from: string | null;
  to: string | null;
  type: string | null;
  count: number;
}

export interface IAppropriateness {
  evaluationsConformingShare: number | null;
  coursesEndingConformingShare: number | null;
  coursesEverNonConformingShare: number | null;
  admissionsWithNonConformity: number;
  bySubstance: ISubstanceEvaluations[];
  reasons: INamedCount[];
  nonConforming: number;
  adjustments: Record<string, number>;
  substitutions: ISubstitution[];
  interventions: {
    recorded: number;
    byStatus: Record<string, number>;
    hoursToOutcome: IQuantiles;
  };
  verdictDays: IVerdictDays;
}

export interface IConsumption {
  awareMix: Record<string, number | null>;
  dotBySubstance: {
    idSubstance: number | null;
    substance: string | null;
    dot: number;
  }[];
  courseLengthDays: IQuantiles;
  courseLengthBins: IBin[];
  pastPlannedEndShare: number | null;
  maxSimultaneous: Record<string, number>;
  routeShare: Record<string, number | null>;
  ivToOralSwitchShare: number | null;
  ivToOralSwitchDay: IQuantiles;
  restartShare: number | null;
  episodesPerAdmission: number | null;
}

export interface IMicroorganism {
  microorganism: string;
  admissions: number;
}

export interface IMicrobiology {
  collectedBeforeStartShare: number | null;
  positiveShare: number | null;
  culturesCollected: number;
  resistantInUseShare: number | null;
  microorganisms: IMicroorganism[];
}

export interface IAgeBand {
  ageBand: string;
  admissions: number;
  dotPerAdmission: number | null;
}

export interface IDiagnosis {
  idcid: string;
  name: string | null;
  admissions: number;
  dotPerAdmission: number | null;
}

export interface IOutcomes {
  lengthOfStayDays: IQuantiles;
  antimicrobialEndToDischargeDays: IQuantiles;
  stillInHospitalShare: number | null;
  byAgeBand: IAgeBand[];
  bySex: Record<string, number>;
  diagnoses: IDiagnosis[];
}

export interface IIndicators {
  overview: IOverview;
  byDepartment: IDepartmentRow[];
  monthly: ITrendPoint[];
  daily: ITrendPoint[];
  process: IProcess;
  appropriateness: IAppropriateness;
  consumption: IConsumption;
  microbiology: IMicrobiology;
  outcomes: IOutcomes;
}

// an admission of a department's drill-down (the ones its row counts)
export interface IAdmission {
  admissionNumber: number;
  followed: boolean;
  closedAt: string | null;
  segment: string | null;
  age: number | null;
  sex: string | null;
  idcid: string | null;
  diagnosis: string | null;
  antimicrobialStart: string | null;
  antimicrobialEnd: string | null;
  dot: number | null;
  episodes: number | null;
  reviews: number | null;
  timeToFirstReviewHours: number | null;
  lengthOfStayDays: number | null;
}

// an antimicrobial course of an admission
export interface ICourse {
  course: number;
  idSubstance: number | null;
  substance: string | null;
  awareLevel: number | null;
  start: string | null;
  days: number | null;
  plannedDays: number | null;
  pastPlannedEnd: boolean;
  route: string | null;
  ivToOralDay: number | null;
  ongoing: boolean;
  restart: boolean;
  department: string | null;
  // null while a running course has not reached D3
  evaluatedByD3: boolean | null;
  finalVerdict: "conforming" | "non_conforming" | null;
  everNonConforming: boolean;
}

// the period answers indicators; admissions_of and courses_of the drill-down
export interface IReportResult {
  indicators?: IIndicators;
  admissions?: IAdmission[];
  courses?: ICourse[];
  updatedAt?: string | null;
}

// what the report asks (InfectionControlReportRequest in the backend)
export interface IReportParams {
  year: number;
  start_date?: string;
  end_date?: string;
  id_department?: number[];
  segment?: string[];
  substance?: number[];
  aware_level?: number[];
  reviewer?: number[];
  // the admissions of this department in the period
  admissions_of?: number;
  // the courses of this admission
  courses_of?: number;
}

export interface IOption {
  value: number;
  label: string;
}

// the values of the filter form
export interface IFilterValues {
  dateRange: Dayjs[];
  segment: string[];
  department: number[];
  aware_level: number[];
  // searched, so they keep their labels (labelInValue)
  substance: IOption[];
  reviewer: IOption[];
}

// the AdvancedFilter context (JS) as the filter fields use it
export interface IFilterContext {
  values: IFilterValues;
  setFieldValue: (values: Partial<IFilterValues>) => void;
}
