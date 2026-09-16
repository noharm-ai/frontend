export interface ICombinationCriterionTrace {
  criterion: string;
  criterionLabel: string;
  operator: string | null;
  operatorLabel: string | null;
  expected: any;
  actual: any;
  result: boolean | null;
}

export interface ICombinationDrugTrace {
  idPrescriptionDrug: number;
  idDrug: number;
  name: string | null;
  matched: boolean;
  failedCriterion: string | null;
  criteria: ICombinationCriterionTrace[];
}

export interface IVariableTrace {
  name: string;
  field: string;
  fieldLabel: string;
  operator: string | null;
  operatorLabel: string | null;
  expectedValue: any;
  actualValue: any;
  result: boolean;
  reason: string;
  details: Record<string, any>;
  drugs: ICombinationDrugTrace[];
  message: string;
}

export interface ITriggerTrace {
  expression: string;
  substituted: string;
  result: boolean;
}

export interface IDateGroupTrace {
  date: string;
  activated?: boolean;
  /**
   * The trigger evaluated true, but the protocol only counts on the latest
   * expire date, so no alert is raised for this group. `activated: true` with
   * `discarded: true` must never be presented as "this protocol fired".
   */
  discarded?: boolean;
  error?: string;
  summary?: string;
  trigger?: ITriggerTrace;
  variableMessages?: string[];
  relatedItems?: number[];
  variables?: IVariableTrace[];
}

export interface IProtocolTrace {
  idProtocol: number;
  name: string;
  applicable: boolean;
  applicabilityNotes: string[];
  dateGroups: IDateGroupTrace[];
}

export interface IPrescriptionTrace {
  idPrescription: string;
  evaluatedAt: string;
  protocols: IProtocolTrace[];
}

export interface IProtocolTraceWithStatus extends IProtocolTrace {
  activated: boolean;
  /** fired on at least one group, but every firing group was discarded */
  discarded: boolean;
}

export type StatusFilter = "all" | "active" | "inactive";
