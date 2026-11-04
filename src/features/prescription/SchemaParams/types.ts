export type AlertLevel = "low" | "medium" | "high";

export interface IAlertTypeParams {
  enabled: boolean;
  // null: the alert's own level
  level: AlertLevel | null;
}

export interface IKidneyAlertParams extends IAlertTypeParams {
  adultExams: string[];
  pediatricExams: string[];
}

export interface IInteractionKindParams {
  enabled: boolean;
  ignoreLevels: AlertLevel[];
  ignoreFrequencies: number[];
  requireIntervalIntersection: boolean;
}

export interface IAlertParams {
  types: Record<string, IAlertTypeParams> & { kidney: IKidneyAlertParams };
  // only the kinds with settings: a missing kind is all defaults
  interactions: Record<string, IInteractionKindParams>;
}

export type SchemaParamsStatus =
  "found" | "not_found" | "read_error" | "no_schema";

export interface ISchemaParams {
  schema: string;
  status: SchemaParamsStatus;
  // sections of the item that failed validation (code defaults in use)
  invalidSections: string[];
  // in force: the schema's values over the code defaults
  params: { alerts: IAlertParams };
  // only what the schema's item sets (same shape, sparse)
  custom: {
    alerts?: {
      types?: Record<string, Partial<IKidneyAlertParams>>;
      interactions?: Record<string, Partial<IInteractionKindParams>>;
    };
  };
}
