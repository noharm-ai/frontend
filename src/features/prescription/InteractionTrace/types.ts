export interface IInteractionTraceItem {
  idPrescriptionDrug: string;
  idPrescription: string;
  drug: string | null;
  substance: string | null;
  sctid: string | null;
  source: string;
  suspended: boolean;
  eligible: boolean;
  ineligibilityReason: string | null;
}

export interface IInteractionTraceAllergy {
  sctid: string;
  name: string;
}

export interface IInteractionTraceSide {
  idPrescriptionDrug: string | null;
  drug: string | null;
  substance: string | null;
  sctid: string | null;
  source: string;
  eligible: boolean;
  ineligibilityReason: string | null;
  intravenous?: boolean | null;
  group?: string | null;
  frequency?: number | null;
  interval?: string | null;
  prescriptionDate?: string | null;
  expireDate?: string | null;
}

export interface IInteractionTraceRule {
  rule: string;
  passed: boolean;
  message: string;
}

export interface IInteractionTraceRelation {
  sctida: string;
  sctidb: string;
  substanceA: string | null;
  substanceB: string | null;
  kind: string;
  label: string;
  active: boolean;
  level: string | null;
  text: string | null;
}

export interface IInteractionTraceDirection {
  from: string;
  to: string;
  relation: IInteractionTraceRelation | null;
  rules: IInteractionTraceRule[];
  alerted: boolean;
  message: string;
  alert: {
    level: string;
    text: string;
    levelNotes: string[];
    shownOn: string[];
  } | null;
}

export interface IInteractionTraceKind {
  kind: string;
  label: string;
  directions: IInteractionTraceDirection[];
}

export interface IInteractionTracePair {
  from: IInteractionTraceSide;
  to: IInteractionTraceSide;
  isAllergy: boolean;
  compared: boolean;
  alerted: boolean;
  summary: string;
  notes: string[];
  checks: IInteractionTraceRule[];
  relations: IInteractionTraceRelation[];
  kinds: IInteractionTraceKind[];
}

export interface IInteractionTraceResponse {
  idPrescription: string;
  evaluatedAt: string;
  isCpoe: boolean;
  agg: boolean;
  items: IInteractionTraceItem[];
  allergies: IInteractionTraceAllergy[];
  allergiesWithoutSubstance: string[];
  trace: IInteractionTracePair | null;
}
