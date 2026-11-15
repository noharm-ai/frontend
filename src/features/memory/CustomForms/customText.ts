import DOMPurify from "dompurify";

import { evaluateFormula } from "components/Forms/CustomForm/Fields/formulaEvaluator";
import {
  PARAMETRIZED_VARIABLE_PREFIXES,
  flattenVariableMenu,
  getClinicalNoteVariableMenus,
} from "utils/clinicalNoteVariables";

import type {
  CustomForm,
  Question,
  TextBlock,
  TextCondition,
  TextConditionOperator,
} from "./types";

/**
 * The custom text of an evolution form: blocks of rich text, each included or
 * not depending on the answers of the form (see TextBlock).
 *
 * renderCustomText resolves the blocks and the {{questionId}} answers, and
 * leaves every other {{variable}} in place: those are the clinical note
 * variables, resolved later against a prescription by getCustomClinicalNote.
 */

export const OPERATOR_LABELS: Record<TextConditionOperator, string> = {
  equals: "é igual a",
  not_equals: "é diferente de",
  contains: "inclui",
  not_contains: "não inclui",
  gt: "é maior que",
  gte: "é maior ou igual a",
  lt: "é menor que",
  lte: "é menor ou igual a",
  filled: "foi respondida",
  empty: "não foi respondida",
};

const PRESENCE: TextConditionOperator[] = ["filled", "empty"];
const NUMERIC: TextConditionOperator[] = [
  "equals",
  "not_equals",
  "gt",
  "gte",
  "lt",
  "lte",
  ...PRESENCE,
];
const SINGLE_OPTION: TextConditionOperator[] = [
  "equals",
  "not_equals",
  ...PRESENCE,
];
const MULTIPLE_OPTION: TextConditionOperator[] = [
  "contains",
  "not_contains",
  ...PRESENCE,
];

/** The operators a condition on a question of this type can use. */
export const operatorsForType = (
  type: Question["type"] | undefined,
): TextConditionOperator[] => {
  switch (type) {
    case "number":
    case "calculated_field":
      return NUMERIC;
    case "options":
    case "options-key-value":
      return SINGLE_OPTION;
    case "options-multiple":
    case "options-key-value-multiple":
      return MULTIPLE_OPTION;
    default:
      return PRESENCE;
  }
};

/** Whether the operator compares the answer with a value of the condition. */
export const operatorNeedsValue = (operator: TextCondition["operator"]) =>
  operator !== "" && !PRESENCE.includes(operator);

export const isOptionQuestion = (question: Question | undefined) =>
  !!question && question.type.startsWith("options");

/** The options of a selection question as { value, label } pairs. */
export const questionOptions = (question: Question) =>
  (question.options ?? []).map((option) =>
    typeof option === "string"
      ? { value: option, label: option }
      : { value: option.id, label: option.value },
  );

export const allQuestions = (form: Pick<CustomForm, "data">): Question[] =>
  (form.data ?? []).flatMap((group) => group.questions ?? []);

const stripTags = (html: string) => html.replace(/<[^>]*>/g, "");

/** The answer of a question; calculated fields are computed from the others. */
const getAnswer = (question: Question, values: Record<string, any>) =>
  question.type === "calculated_field"
    ? evaluateFormula(question.formula || "", values).value
    : values[question.id];

const isEmptyAnswer = (question: Question, answer: any) => {
  if (answer === null || answer === undefined) return true;
  if (Array.isArray(answer)) return answer.length === 0;
  if (typeof answer === "string") {
    const text = question.type === "text" ? stripTags(answer) : answer;
    return text.trim() === "";
  }
  return false;
};

/**
 * Whether a condition holds for the answers. Only "foi respondida" and the
 * negative operators hold for a question left unanswered.
 */
export const evaluateCondition = (
  condition: TextCondition,
  question: Question | undefined,
  values: Record<string, any>,
): boolean => {
  if (!question || !condition.operator) return false;

  const answer = getAnswer(question, values);
  const empty = isEmptyAnswer(question, answer);
  const expected = condition.value;

  switch (condition.operator) {
    case "filled":
      return !empty;
    case "empty":
      return empty;
    case "equals":
    case "not_equals": {
      const equal =
        !empty &&
        (operatorsForType(question.type) === NUMERIC
          ? Number(answer) === Number(expected)
          : String(answer) === String(expected));
      return condition.operator === "equals" ? equal : !equal;
    }
    case "contains":
    case "not_contains": {
      const list = Array.isArray(answer) ? answer.map(String) : [];
      const contains = list.includes(String(expected));
      return condition.operator === "contains" ? contains : !contains;
    }
    case "gt":
    case "gte":
    case "lt":
    case "lte": {
      if (empty || expected === null || expected === undefined) return false;
      const a = Number(answer);
      const b = Number(expected);
      if (Number.isNaN(a) || Number.isNaN(b)) return false;
      if (condition.operator === "gt") return a > b;
      if (condition.operator === "gte") return a >= b;
      if (condition.operator === "lt") return a < b;
      return a <= b;
    }
    default:
      return false;
  }
};

/** Whether a block is part of the text for these answers. */
export const isBlockIncluded = (
  block: TextBlock,
  questions: Question[],
  values: Record<string, any>,
): boolean => {
  const conditions = block.conditions ?? [];
  if (conditions.length === 0) return true;

  const results = conditions.map((condition) =>
    evaluateCondition(
      condition,
      questions.find((q) => q.id === condition.questionId),
      values,
    ),
  );

  return block.logic === "or" ? results.some(Boolean) : results.every(Boolean);
};

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    // an answer never turns into a variable resolved later
    .replace(/\{/g, "&#123;")
    .replace(/\}/g, "&#125;");

/** The answer of a question as HTML to place in the text. */
const formatAnswer = (question: Question, values: Record<string, any>) => {
  const answer = getAnswer(question, values);
  if (isEmptyAnswer(question, answer)) return "";

  if (question.type === "text") {
    // rich text: its paragraphs become line breaks, so the answer fits
    // inside the paragraph of the block that names it
    const html = DOMPurify.sanitize(String(answer))
      .replace(/<\/p>\s*<p>/g, "<br>")
      .replace(/^<p>|<\/p>$/g, "")
      .replace(/\{/g, "&#123;")
      .replace(/\}/g, "&#125;");
    return html;
  }

  const labelOf = (value: any) => {
    if (!isOptionQuestion(question)) return String(value);
    const option = questionOptions(question).find(
      (o) => String(o.value) === String(value),
    );
    return option ? option.label : String(value);
  };

  const text = Array.isArray(answer)
    ? answer.map(labelOf).join(", ")
    : labelOf(answer);

  return escapeHtml(text);
};

const VARIABLE_PATTERN = /\{\{([^{}]+)\}\}/g;

/** The variable names ({{name}}) a text names, in order, without repeats. */
export const variablesIn = (html: string): string[] =>
  Array.from(
    new Set(Array.from(html.matchAll(VARIABLE_PATTERN), (m) => m[1])),
  );

/**
 * The text of the form for these answers: the included blocks, in order,
 * with the answers in place of their {{questionId}}. The clinical note
 * variables are left for getCustomClinicalNote.
 */
export const renderCustomText = (
  form: Pick<CustomForm, "data" | "customText">,
  values: Record<string, any>,
): string => {
  const questions = allQuestions(form);
  const byId = new Map(questions.map((q) => [q.id, q]));

  return (form.customText?.blocks ?? [])
    .filter((block) => isBlockIncluded(block, questions, values))
    .map((block) =>
      (block.content ?? "").replace(VARIABLE_PATTERN, (match, name) => {
        const question = byId.get(name);
        return question ? formatAnswer(question, values) : match;
      }),
    )
    .join("");
};

let clinicalNoteVariableNames: Set<string> | null = null;

/** The names of the clinical note variables that take no parameter. */
const getClinicalNoteVariableNames = () => {
  if (!clinicalNoteVariableNames) {
    // the labels are not needed, only the keys
    const menus = getClinicalNoteVariableMenus((key: string) => key);
    clinicalNoteVariableNames = new Set(
      Object.values(menus)
        .flatMap((items) => flattenVariableMenu(items))
        .map((item) => item.key ?? "")
        .filter((key) => key.startsWith("{{"))
        .map((key) => key.slice(2, -2)),
    );
  }
  return clinicalNoteVariableNames;
};

/** Whether a variable name is one the clinical note resolves. */
export const isClinicalNoteVariable = (name: string) =>
  getClinicalNoteVariableNames().has(name) ||
  PARAMETRIZED_VARIABLE_PREFIXES.some((prefix) =>
    name.startsWith(`${prefix}.`),
  ) ||
  name === "interacoes";

export interface CustomTextError {
  path: string;
  message: string;
}

/**
 * The problems that keep a form from being saved: blocks without text,
 * conditions incomplete or on a question that no longer exists, and
 * variables that nothing resolves or that are ambiguous.
 */
export const validateCustomText = (
  form: Pick<CustomForm, "data" | "customText">,
): CustomTextError[] => {
  const errors: CustomTextError[] = [];
  const questions = allQuestions(form);
  const byId = new Map(questions.map((q) => [q.id, q]));

  (form.customText?.blocks ?? []).forEach((block, bIdx) => {
    const base = `customText.blocks[${bIdx}]`;

    if (!block.content || stripTags(block.content).trim() === "") {
      errors.push({ path: `${base}.content`, message: "Texto obrigatório" });
    } else {
      variablesIn(block.content).forEach((name) => {
        const isQuestion = byId.has(name);
        const isNoteVariable = isClinicalNoteVariable(name);
        if (isQuestion && isNoteVariable) {
          errors.push({
            path: `${base}.content`,
            message: `A variável {{${name}}} é ambígua: uma questão tem o mesmo ID de uma variável da evolução. Altere o ID da questão.`,
          });
        } else if (!isQuestion && !isNoteVariable) {
          errors.push({
            path: `${base}.content`,
            message: `Variável desconhecida: {{${name}}}`,
          });
        }
      });
    }

    (block.conditions ?? []).forEach((condition, cIdx) => {
      const path = `${base}.conditions[${cIdx}]`;
      const question = byId.get(condition.questionId);

      if (!condition.questionId) {
        errors.push({ path, message: "Selecione a questão" });
      } else if (!question) {
        errors.push({
          path,
          message: `A questão "${condition.questionId}" não existe mais no formulário`,
        });
      } else if (
        !condition.operator ||
        !operatorsForType(question.type).includes(condition.operator)
      ) {
        errors.push({ path, message: "Selecione a regra" });
      } else if (
        operatorNeedsValue(condition.operator) &&
        (condition.value === null ||
          condition.value === undefined ||
          condition.value === "")
      ) {
        errors.push({ path, message: "Informe o valor" });
      } else if (
        isOptionQuestion(question) &&
        operatorNeedsValue(condition.operator) &&
        !questionOptions(question).some(
          (o) => String(o.value) === String(condition.value),
        )
      ) {
        errors.push({
          path,
          message: `A opção "${condition.value}" não existe mais na questão`,
        });
      }
    });
  });

  return errors;
};
