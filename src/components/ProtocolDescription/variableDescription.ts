import { ProtocolVariableFieldEnum } from "src/models/ProtocolVariableFieldEnum";
import clinicalNotesIndicator from "src/components/Screening/ClinicalNotes/ClinicalNotesIndicator";

import {
  DRUG_ATTRIBUTE_OPTIONS,
  DRUG_ALERT_LIMIT_OPTIONS,
  SEGMENT_TYPE_OPTIONS,
  ST_CONCILIA_OPTIONS,
  findOptionLabel,
} from "./protocolOptions";
import { LabelKind, LabelLookup, fieldLabelKind } from "./labels";

export interface IDescriptionItem {
  id: string;
  label: string;
  // False when the description could not be resolved (still loading, or the
  // referenced record no longer exists) and we are showing the bare id.
  resolved: boolean;
}

export interface IDescriptionCriterion {
  // Present only for multi-criteria variables (combinations), where each line
  // needs to say which attribute it constrains.
  label?: string;
  phrase: string;
  items?: IDescriptionItem[];
  text?: string;
}

export interface IVariableDescription {
  subject: string;
  fieldLabel: string;
  criteria: IDescriptionCriterion[];
  notes: string[];
  incomplete: boolean;
}

const OPERATOR_PHRASES: Record<string, string> = {
  IN: "está contida na lista",
  NOTIN: "não está contida na lista",
  CONTAINS: "contém",
  ">": "é maior que",
  ">=": "é maior ou igual a",
  "<": "é menor que",
  "<=": "é menor ou igual a",
  "=": "é igual a",
  "!=": "é diferente de",
};

const CRITERION_PHRASES: Record<string, string> = {
  ...OPERATOR_PHRASES,
  ">": "maior que",
  ">=": "maior ou igual a",
  "<": "menor que",
  "<=": "menor ou igual a",
  "=": "igual a",
  "!=": "diferente de",
};

const SUBJECTS: Record<string, string> = {
  [ProtocolVariableFieldEnum.SUBSTANCE]: "a substância de algum item prescrito",
  [ProtocolVariableFieldEnum.ID_DRUG]: "algum medicamento prescrito",
  [ProtocolVariableFieldEnum.DRUG_CLASS]:
    "a classe de algum medicamento prescrito",
  [ProtocolVariableFieldEnum.ROUTE]: "a via de algum item prescrito",
  [ProtocolVariableFieldEnum.AGE]: "a idade do paciente",
  [ProtocolVariableFieldEnum.WEIGHT]: "o peso do paciente",
  [ProtocolVariableFieldEnum.IMC]: "o IMC do paciente",
  [ProtocolVariableFieldEnum.ID_DEPARTMENT]: "o setor da prescrição",
  [ProtocolVariableFieldEnum.ID_SEGMENT]: "o segmento da prescrição",
  [ProtocolVariableFieldEnum.ADMISSION_TIME]:
    "o tempo de internação do paciente",
  [ProtocolVariableFieldEnum.ST_CONCILIA]: "a conciliação do paciente",
  [ProtocolVariableFieldEnum.ID_ICD]: "o CID do paciente",
  [ProtocolVariableFieldEnum.DISCHARGE_REASON]: "o motivo de alta do paciente",
  [ProtocolVariableFieldEnum.SEGMENT_TYPE]: "o tipo de segmento",
  [ProtocolVariableFieldEnum.INSURANCE]: "o convênio da prescrição",
};

const UNITS: Record<string, string> = {
  [ProtocolVariableFieldEnum.AGE]: "anos",
  [ProtocolVariableFieldEnum.WEIGHT]: "kg",
  [ProtocolVariableFieldEnum.IMC]: "kg/m²",
  [ProtocolVariableFieldEnum.ADMISSION_TIME]: "horas",
};

const FIELD_LABELS: Record<string, string> = Object.fromEntries(
  ProtocolVariableFieldEnum.getList().map((f: any) => [f.value, f.label]),
);

const MISSING_VALUE = "(não informado)";

const asList = (value: any): Array<string | number> =>
  Array.isArray(value) ? value : [];

const isFilled = (value: any) =>
  value !== null && value !== undefined && value !== "";

const toItems = (
  values: Array<string | number>,
  kind: LabelKind | undefined,
  getLabel: LabelLookup,
): IDescriptionItem[] =>
  values.map((value) => {
    const id = String(value);
    const label = kind ? getLabel(kind, id) : undefined;

    return { id, label: label ?? id, resolved: !!label };
  });

// Free-text lists (combination routes, tag inputs) are already readable.
const toPlainItems = (values: Array<string | number>): IDescriptionItem[] =>
  values.map((value) => ({
    id: String(value),
    label: String(value),
    resolved: true,
  }));

const listCriterion = (
  label: string,
  values: Array<string | number>,
  kind: LabelKind | undefined,
  getLabel: LabelLookup,
  phrase = "está contida na lista",
): IDescriptionCriterion | null => {
  if (!values.length) return null;

  return {
    label,
    phrase,
    items: kind ? toItems(values, kind, getLabel) : toPlainItems(values),
  };
};

const comparisonCriterion = (
  label: string,
  operator: any,
  value: any,
  unit?: string,
): IDescriptionCriterion | null => {
  if (!isFilled(value)) return null;

  return {
    label,
    phrase: operator ? (CRITERION_PHRASES[operator] ?? String(operator)) : "é",
    text: unit ? `${value} ${unit}` : String(value),
  };
};

function combinationDescription(
  variable: any,
  getLabel: LabelLookup,
): IVariableDescription {
  const criteria: IDescriptionCriterion[] = [];
  const push = (criterion: IDescriptionCriterion | null) => {
    if (criterion) criteria.push(criterion);
  };

  push(
    listCriterion(
      "Substância",
      asList(variable.substance),
      "substance",
      getLabel,
    ),
  );
  push(listCriterion("Classe", asList(variable.class), "class", getLabel));
  push(listCriterion("Medicamento", asList(variable.drug), "drug", getLabel));

  const attributes = asList(variable.drugAttribute);
  if (attributes.length) {
    criteria.push({
      label: "Atributo",
      phrase: "está contido na lista",
      items: attributes.map((value) => {
        const label = findOptionLabel(DRUG_ATTRIBUTE_OPTIONS, value);

        return {
          id: String(value),
          label: label ?? String(value),
          resolved: !!label,
        };
      }),
    });
  }

  const alertLimits = asList(variable.drugAlertLimit);
  if (alertLimits.length) {
    criteria.push({
      label: "Valor limite nefrotóxico/hepático",
      phrase: "está contido na lista",
      items: alertLimits.map((value) => {
        const label = findOptionLabel(DRUG_ALERT_LIMIT_OPTIONS, value);

        return {
          id: String(value),
          label: label ?? String(value),
          resolved: !!label,
        };
      }),
    });
  }

  // The combination route is a free-text tag input, so its values are already
  // readable — no id lookup involved.
  push(listCriterion("Via", asList(variable.route), undefined, getLabel));

  if (variable.intravenous === true || variable.intravenous === false) {
    criteria.push({
      label: "Via intravenosa",
      phrase: "é",
      text: variable.intravenous ? "sim" : "não",
    });
  }

  if (variable.feedingTube === true || variable.feedingTube === false) {
    criteria.push({
      label: "Via sonda",
      phrase: "é",
      text: variable.feedingTube ? "sim" : "não",
    });
  }

  push(
    comparisonCriterion(
      "Dose",
      variable.doseOperator,
      variable.dose,
      variable.defaultMeasureUnit || undefined,
    ),
  );
  push(
    comparisonCriterion(
      "Frequência diária",
      variable.frequencydayOperator,
      variable.frequencyday,
    ),
  );
  push(
    comparisonCriterion("Período", variable.periodOperator, variable.period),
  );

  const notes: string[] = [];

  if (isFilled(variable.observation)) {
    notes.push(`Observação: ${variable.observation}`);
  }

  return {
    subject:
      criteria.length > 1
        ? "existe um item prescrito que atende a todos os critérios abaixo"
        : "existe um item prescrito que atende ao critério abaixo",
    fieldLabel: FIELD_LABELS[ProtocolVariableFieldEnum.COMBINATION] ?? "Combo",
    criteria,
    notes,
    incomplete: criteria.length === 0,
  };
}

/**
 * Turns a protocol variable into the pieces of a sentence a pharmacist can
 * read: what is being checked, how it is compared and every value behind the
 * ids that were stored.
 */
export function buildVariableDescription(
  variable: any,
  getLabel: LabelLookup,
  translate: (key: string) => string,
): IVariableDescription {
  if (!variable?.field) {
    return {
      subject: "esta condição ainda está incompleta",
      fieldLabel: "",
      criteria: [],
      notes: [],
      incomplete: true,
    };
  }

  const field = variable.field;
  const fieldLabel = FIELD_LABELS[field] ?? field;

  if (field === ProtocolVariableFieldEnum.COMBINATION) {
    return combinationDescription(variable, getLabel);
  }

  let subject = SUBJECTS[field] ?? fieldLabel;
  const notes: string[] = [];

  if (field === ProtocolVariableFieldEnum.EXAM) {
    const examLabel = variable.examType
      ? (getLabel("exam", variable.examType) ?? variable.examType)
      : MISSING_VALUE;
    subject = `o último resultado do exame ${examLabel}`;

    if (isFilled(variable.examPeriod)) {
      notes.push(
        `Considera apenas exames com até ${variable.examPeriod} dia(s).`,
      );
    }
  }

  if (field === ProtocolVariableFieldEnum.EXAM_REF) {
    const examLabel = variable.examRefType
      ? (getLabel("examRef", variable.examRefType) ?? variable.examRefType)
      : MISSING_VALUE;
    subject = `o último resultado do exame padrão NoHarm ${examLabel}`;

    if (isFilled(variable.examRefPeriod)) {
      notes.push(
        `Considera apenas exames com até ${variable.examRefPeriod} dia(s).`,
      );
    }
  }

  if (field === ProtocolVariableFieldEnum.CN_STATS) {
    const option = clinicalNotesIndicator
      .listSelectOptions(translate)
      .find((o: any) => o.value === variable.statsType);
    subject = `o indicador NoHarm Care ${
      option?.label ?? variable.statsType ?? MISSING_VALUE
    }`;
  }

  const phrase = variable.operator
    ? (OPERATOR_PHRASES[variable.operator] ?? String(variable.operator))
    : "?";

  const isList = variable.operator === "IN" || variable.operator === "NOTIN";

  if (isList) {
    const values = asList(variable.value);
    const kind = fieldLabelKind(field);

    return {
      subject,
      fieldLabel,
      criteria: [
        {
          phrase,
          items: values.length
            ? kind
              ? toItems(values, kind, getLabel)
              : staticItems(field, values)
            : undefined,
          text: values.length ? undefined : MISSING_VALUE,
        },
      ],
      notes,
      incomplete: !values.length,
    };
  }

  const unit = UNITS[field];
  const text = isFilled(variable.value)
    ? scalarText(field, variable.value, unit)
    : MISSING_VALUE;

  return {
    subject,
    fieldLabel,
    criteria: [{ phrase, text }],
    notes,
    incomplete: !isFilled(variable.value) || !variable.operator,
  };
}

// Fields whose accepted values come from a fixed list rather than a lookup
// endpoint.
function staticItems(
  field: string,
  values: Array<string | number>,
): IDescriptionItem[] {
  if (field === ProtocolVariableFieldEnum.SEGMENT_TYPE) {
    return values.map((value) => {
      const label = findOptionLabel(SEGMENT_TYPE_OPTIONS, value);

      return {
        id: String(value),
        label: label ?? String(value),
        resolved: !!label,
      };
    });
  }

  return toPlainItems(values);
}

function scalarText(field: string, value: any, unit?: string): string {
  if (field === ProtocolVariableFieldEnum.ST_CONCILIA) {
    const label = findOptionLabel(ST_CONCILIA_OPTIONS, value);

    return label ? `${label} (${value})` : String(value);
  }

  if (field === ProtocolVariableFieldEnum.SEGMENT_TYPE) {
    const label = findOptionLabel(SEGMENT_TYPE_OPTIONS, value);

    return label ?? String(value);
  }

  return unit ? `${value} ${unit}` : String(value);
}
