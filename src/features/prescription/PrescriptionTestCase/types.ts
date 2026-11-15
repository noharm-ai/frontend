import type { Dayjs } from "dayjs";

// the item kinds of the prescription view (presmed.origem)
export const ITEM_SOURCES = [
  "Medicamentos",
  "Soluções",
  "Proced/Exames",
  "Dietas",
  "Materiais",
] as const;

export type ItemSource = (typeof ITEM_SOURCES)[number];

export interface IOption {
  value: string;
  label: string;
}

export interface IItemValues {
  source: ItemSource;
  // labelInValue: the label survives a new search
  drug?: IOption;
  dose?: number | null;
  measureUnit?: string;
  frequency?: string;
  interval?: string;
  route?: string;
  notes?: string;
}

export interface IFormValues {
  admissionMode: "new" | "existing";
  admissionNumber?: number | null;
  birthdate?: Dayjs | null;
  gender?: "M" | "F";
  weight?: number | null;
  height?: number | null;
  idDepartment?: string;
  date?: Dayjs | null;
  expire?: Dayjs | null;
  bed?: string;
  prescriber?: string;
  items: IItemValues[];
}

export interface ITestCaseResult {
  idPrescription: string;
  admissionNumber: number;
  idPatient: string;
  idSegment: number | null;
  // null when prescalc left it pending
  idPrescriptionDay: string | null;
  items: string[];
}

export interface ISegmentDepartment {
  idSegment: number;
  idDepartment: number;
  label: string;
}
