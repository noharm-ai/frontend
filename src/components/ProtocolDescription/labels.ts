import { ProtocolVariableFieldEnum } from "src/models/ProtocolVariableFieldEnum";

/**
 * Groups of protocol variable values that are stored as ids and need a
 * description to be readable. The admin editor resolves them through the
 * lookup endpoints; the prescription view gets them resolved by the server.
 */
export type LabelKind =
  | "substance"
  | "class"
  | "drug"
  | "icd"
  | "department"
  | "segment"
  | "route"
  | "exam"
  | "examRef";

export type LabelLookup = (
  kind: LabelKind,
  id: string | number
) => string | undefined;

const FIELD_KINDS: Record<string, LabelKind> = {
  [ProtocolVariableFieldEnum.SUBSTANCE]: "substance",
  [ProtocolVariableFieldEnum.DRUG_CLASS]: "class",
  [ProtocolVariableFieldEnum.ID_DRUG]: "drug",
  [ProtocolVariableFieldEnum.ID_ICD]: "icd",
  [ProtocolVariableFieldEnum.ID_DEPARTMENT]: "department",
  [ProtocolVariableFieldEnum.ID_SEGMENT]: "segment",
  [ProtocolVariableFieldEnum.ROUTE]: "route",
};

export function fieldLabelKind(field: string): LabelKind | undefined {
  return FIELD_KINDS[field];
}

const asList = (value: any): Array<string | number> =>
  Array.isArray(value) ? value : [];

/**
 * Every id the given variables reference, grouped by kind. Mirrors what the
 * backend collects for `/protocol/:id/description`.
 */
export function collectLabelRequests(
  variables: any[]
): Partial<Record<LabelKind, string[]>> {
  const buckets: Partial<Record<LabelKind, Set<string>>> = {};

  const add = (kind: LabelKind, values: Array<string | number>) => {
    if (!values.length) return;

    if (!buckets[kind]) {
      buckets[kind] = new Set();
    }

    values.forEach((value) => {
      if (value !== null && value !== undefined && value !== "") {
        (buckets[kind] as Set<string>).add(String(value));
      }
    });
  };

  (variables ?? []).forEach((variable: any) => {
    if (!variable?.field) return;

    if (variable.field === ProtocolVariableFieldEnum.COMBINATION) {
      add("substance", asList(variable.substance));
      add("class", asList(variable.class));
      add("drug", asList(variable.drug));
      // `combination.route` is a free-text tag input, not an id list — its
      // values are already human-readable and must not be resolved.
      return;
    }

    if (variable.field === ProtocolVariableFieldEnum.EXAM) {
      add("exam", [variable.examType]);
      return;
    }

    if (variable.field === ProtocolVariableFieldEnum.EXAM_REF) {
      add("examRef", [variable.examRefType]);
      return;
    }

    const kind = fieldLabelKind(variable.field);
    if (kind) {
      add(kind, asList(variable.value));
    }
  });

  const requests: Partial<Record<LabelKind, string[]>> = {};

  (Object.keys(buckets) as LabelKind[]).forEach((kind) => {
    requests[kind] = Array.from(buckets[kind] as Set<string>);
  });

  return requests;
}

/**
 * Lookup backed by the label maps the server sends, shaped
 * `{ substance: { "123": "Vancomicina" } }`.
 */
export function labelLookupFromMap(
  labels: Partial<Record<LabelKind, Record<string, string>>> | undefined
): LabelLookup {
  return (kind, id) => labels?.[kind]?.[String(id)];
}
