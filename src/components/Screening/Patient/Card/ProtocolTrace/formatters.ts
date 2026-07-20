import type { IDateGroupTrace, IVariableTrace } from "./types";

export function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return "—";
  }
  if (Array.isArray(value)) {
    return value.length ? value.map(formatValue).join(", ") : "—";
  }
  if (typeof value === "boolean") {
    return value ? "sim" : "não";
  }
  return String(value);
}

export function isComparedReason(reason: string): boolean {
  return reason === "COMPARED" || reason.startsWith("COMBINATION");
}

export function variableTone(
  variable: IVariableTrace
): "true" | "false" | "muted" {
  if (!isComparedReason(variable.reason)) {
    return "muted";
  }
  return variable.result ? "true" : "false";
}

export function stripMessage(
  message: string,
  name: string,
  fieldLabel: string
): string {
  const prefix = `Variável '${name}' (${fieldLabel}): `;
  let body = message.startsWith(prefix) ? message.slice(prefix.length) : message;
  body = body.replace(/\s*→\s*(verdadeiro|falso)(\s*\([^)]*\))?$/, "");
  return body;
}

export function slugForId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

export function variableDomId(
  group: IDateGroupTrace,
  variableName: string
): string {
  return `protocol-var-${slugForId(group.date)}-${slugForId(variableName)}`;
}

export function buildRelatedItemNames(group: IDateGroupTrace): string[] {
  if (!group.relatedItems || group.relatedItems.length === 0) {
    return [];
  }

  const nameById = new Map<number, string>();
  (group.variables || []).forEach((variable) => {
    (variable.drugs || []).forEach((drug) => {
      if (drug.name) {
        nameById.set(drug.idPrescriptionDrug, drug.name);
      }
    });
  });

  return group.relatedItems.map((id) => nameById.get(id) || `Item ${id}`);
}
