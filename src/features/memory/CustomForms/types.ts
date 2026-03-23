export interface Question {
  id: string;
  label: string;
  help?: string;
  helpDetails?: string;
  type: "text" | "number" | "options" | "options-multiple";
  options: string[];
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
  { value: "options", label: "Seleção única" },
  { value: "options-multiple", label: "Seleção múltipla" },
];
