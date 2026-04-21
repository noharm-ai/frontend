export type FilterKey =
  | "idSegmentList"
  | "substanceStatus"
  | "minDrugCount"
  | "term"
  | "substance"
  | "substanceList"
  | "attributeList"
  | "hasMaxDose"
  | "hasSubstanceMaxDoseWeightAdult"
  | "hasSubstanceMaxDoseWeightPediatric";

export type ColumnKey =
  | "segment"
  | "name"
  | "substance"
  | "operations"
  | "doseRange"
  | "useWeight";

interface DrugAttributesMode {
  pageTitle: string;
  apiParams: Record<string, unknown>;
  mainFilters: FilterKey[];
  secondaryFilters: FilterKey[];
  columns: ColumnKey[];
  expandedRow: boolean;
}

export const ALL_MAIN_FILTERS: FilterKey[] = [
  "idSegmentList",
  "substanceStatus",
  "minDrugCount",
];

export const ALL_SECONDARY_FILTERS: FilterKey[] = [
  "term",
  "substance",
  "substanceList",
  "attributeList",
  "hasMaxDose",
  "hasSubstanceMaxDoseWeightAdult",
  "hasSubstanceMaxDoseWeightPediatric",
];

export const ALL_COLUMNS: ColumnKey[] = [
  "segment",
  "name",
  "substance",
  "operations",
  "doseRange",
  "useWeight",
];

export const DRUG_ATTRIBUTES_MODES: Record<string, DrugAttributesMode> = {
  drugAttributes: {
    pageTitle: "Curadoria de Medicamentos",
    apiParams: {},
    mainFilters: ALL_MAIN_FILTERS,
    secondaryFilters: ALL_SECONDARY_FILTERS,
    columns: ["segment", "name", "substance", "operations"],
    expandedRow: true,
  },
  substanceDefinition: {
    pageTitle: "Definição de Substâncias",
    apiParams: { groupByDrug: true },
    mainFilters: ["term", "substanceStatus", "minDrugCount"],
    secondaryFilters: [],
    columns: ["name", "substance", "operations"],
    expandedRow: false,
  },
  doseDivision: {
    pageTitle: "Divisor de Faixas",
    apiParams: {},
    mainFilters: [
      "idSegmentList",
      "hasSubstanceMaxDoseWeightAdult",
      "hasSubstanceMaxDoseWeightPediatric",
    ],
    secondaryFilters: ["attributeList"],
    columns: ["segment", "name", "doseRange", "useWeight", "operations"],
    expandedRow: true,
  },
};

export const DEFAULT_MODE = "drugAttributes";
