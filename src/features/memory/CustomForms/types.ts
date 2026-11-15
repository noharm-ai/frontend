export interface Question {
  id: string;
  label: string;
  help?: string;
  helpDetails?: string;
  type:
    | "text"
    | "number"
    | "options"
    | "options-multiple"
    | "options-key-value"
    | "options-key-value-multiple"
    | "plaintext"
    | "date"
    | "datetime"
    | "calculated_field";
  options: string[] | { id: string; value: string }[];
  formula?: string;
  required: boolean;
}

export interface FormGroup {
  group: string;
  description?: string;
  questions: Question[];
}

export type TextConditionOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "filled"
  | "empty";

export interface TextCondition {
  questionId: string;
  operator: TextConditionOperator | "";
  value?: string | number | null;
}

/**
 * A block of the custom text: rich text (HTML) taking {{questionId}} answers
 * and the clinical note variables. A block without conditions is always
 * part of the text; otherwise its conditions are joined by `logic`.
 */
export interface TextBlock {
  id: string;
  name?: string;
  content: string;
  logic: "and" | "or";
  conditions: TextCondition[];
}

export interface CustomText {
  blocks: TextBlock[];
}

export interface CustomForm {
  name: string;
  active?: boolean;
  data: FormGroup[];
  customText?: CustomText;
}

export const emptyQuestion = (): Question => ({
  id: "",
  label: "",
  help: "",
  helpDetails: "",
  type: "text",
  options: [],
  required: false,
});

export const emptyGroup = (): FormGroup => ({
  group: "",
  description: "",
  questions: [emptyQuestion()],
});

export const emptyForm = (): CustomForm => ({
  name: "",
  active: true,
  data: [emptyGroup()],
});

const newBlockId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const emptyCondition = (): TextCondition => ({
  questionId: "",
  operator: "",
  value: null,
});

export const emptyTextBlock = (): TextBlock => ({
  id: newBlockId(),
  name: "",
  content: "",
  logic: "and",
  conditions: [],
});

export const questionTypeOptions = [
  { value: "text", label: "Texto" },
  { value: "number", label: "Número" },
  { value: "plaintext", label: "Texto simples" },
  { value: "date", label: "Data" },
  { value: "datetime", label: "Data e hora" },
  { value: "options", label: "Seleção única" },
  { value: "options-multiple", label: "Seleção múltipla" },
  { value: "options-key-value", label: "Seleção única (chave-valor)" },
  { value: "options-key-value-multiple", label: "Seleção múltipla (chave-valor)" },
  { value: "calculated_field", label: "Campo calculado" },
];
