import type { IPrescriptionTrace } from "components/Screening/Patient/Card/ProtocolTrace/types";

export interface ITestDateGroup {
  date: string;
  activated?: boolean;
  /**
   * trigger fired, but the protocol is restricted to the latest expire date,
   * so this group raises no alert. The row-level `activated` below already
   * excludes discarded groups — don't apply the guard twice.
   */
  discarded?: boolean;
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
