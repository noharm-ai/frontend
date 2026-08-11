import type { IPrescriptionTrace } from "components/Screening/Patient/Card/ProtocolTrace/types";

export interface ITestDateGroup {
  date: string;
  activated?: boolean;
  summary?: string;
  error?: string;
}

export interface ITestResultRow {
  idPrescription: string;
  typeMatch?: boolean;
  activated?: boolean;
  dateGroups?: ITestDateGroup[];
  error?: string | null;
  trace?: IPrescriptionTrace;
}
