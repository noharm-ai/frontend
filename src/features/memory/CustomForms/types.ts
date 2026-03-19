export interface Question {
  id: string;
  label: string;
  type: "text" | "number" | "options" | "options-multiple";
  options: string[];
  required: boolean;
}

export interface FormGroup {
  group: string;
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
  type: "text",
  options: [],
  required: false,
});

export const emptyGroup = (): FormGroup => ({
  group: "",
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
