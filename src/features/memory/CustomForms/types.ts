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
    | "datetime";
  options: string[] | { id: string; value: string }[];
  required: boolean;
}

export interface FormGroup {
  group: string;
  description?: string;
  questions: Question[];
}

export interface CustomForm {
  name: string;
  active?: boolean;
  data: FormGroup[];
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
];
