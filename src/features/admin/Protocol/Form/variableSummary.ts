import { ProtocolVariableFieldEnum } from "src/models/ProtocolVariableFieldEnum";

const fieldLabels: Record<string, string> = Object.fromEntries(
  ProtocolVariableFieldEnum.getList().map((f: any) => [f.value, f.label])
);

const formatOperator = (operator: any): string => {
  if (!operator) return "?";
  if (operator === "CONTAINS") return "contém";

  return String(operator);
};

const formatValue = (value: any): string => {
  if (Array.isArray(value)) {
    if (value.length === 0) return "[vazio]";
    return value.length === 1 ? "[1 item]" : `[${value.length} itens]`;
  }

  if (value === null || value === undefined || value === "") {
    return "?";
  }

  return String(value);
};

const combinationSummary = (variable: any): string => {
  const parts: string[] = [];

  const addList = (label: string, value: any) => {
    if (Array.isArray(value) && value.length > 0) {
      parts.push(`${label} [${value.length}]`);
    }
  };

  addList("substância", variable.substance);
  addList("classe", variable.class);
  addList("medicamento", variable.drug);
  addList("atributo", variable.drugAttribute);
  addList("valor limite", variable.drugAlertLimit);
  addList("via", variable.route);

  if (variable.intravenous === true) parts.push("intravenosa");
  if (variable.intravenous === false) parts.push("não intravenosa");
  if (variable.feedingTube === true) parts.push("sonda");
  if (variable.feedingTube === false) parts.push("não sonda");

  if (variable.dose !== null && variable.dose !== undefined && variable.dose !== "") {
    const unit = variable.defaultMeasureUnit ? ` ${variable.defaultMeasureUnit}` : "";
    parts.push(`dose ${formatOperator(variable.doseOperator)} ${variable.dose}${unit}`);
  }

  if (
    variable.frequencyday !== null &&
    variable.frequencyday !== undefined &&
    variable.frequencyday !== ""
  ) {
    parts.push(
      `freq ${formatOperator(variable.frequencydayOperator)} ${variable.frequencyday}`
    );
  }

  if (
    variable.period !== null &&
    variable.period !== undefined &&
    variable.period !== ""
  ) {
    parts.push(
      `período ${formatOperator(variable.periodOperator)} ${variable.period}`
    );
  }

  if (parts.length === 0) {
    return "Combo (sem critérios)";
  }

  return `Combo: ${parts.join(", ")}`;
};

export function getVariableSummary(variable: any): string {
  if (!variable?.field) {
    return "(incompleta)";
  }

  if (variable.field === ProtocolVariableFieldEnum.COMBINATION) {
    return combinationSummary(variable);
  }

  let subject = fieldLabels[variable.field] ?? variable.field;

  if (variable.field === ProtocolVariableFieldEnum.EXAM && variable.examType) {
    subject = `Exame ${variable.examType}`;
  }

  if (
    variable.field === ProtocolVariableFieldEnum.EXAM_REF &&
    variable.examRefType
  ) {
    subject = `Exame ${variable.examRefType}`;
  }

  if (
    variable.field === ProtocolVariableFieldEnum.CN_STATS &&
    variable.statsType
  ) {
    subject = `Indicador ${variable.statsType}`;
  }

  return `${subject} ${formatOperator(variable.operator)} ${formatValue(
    variable.value
  )}`;
}
