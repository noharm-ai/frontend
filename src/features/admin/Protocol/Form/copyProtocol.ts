import { ProtocolVariableFieldEnum } from "src/models/ProtocolVariableFieldEnum";
import { IProtocolFormBaseFields, emptyProtocol } from "./types";

/**
 * Variable attributes whose values only make sense inside the schema that
 * created them: they hold ids/codes resolved against schema-scoped sources
 * (fkmedicamento, fksetor, idsegmento, tp_exame, the map-routes memory).
 * The very same id points at a different entity in another schema, so a
 * cross-schema copy must drop them instead of silently carrying them over.
 *
 * Everything else is portable: sctid, classe, CID and the NoHarm reference
 * exams come from global tables, and the remaining fields are plain scalars
 * or free text.
 */
const SCHEMA_SCOPED_ATTRIBUTES: Record<string, string[]> = {
  [ProtocolVariableFieldEnum.ID_DRUG]: ["value"],
  [ProtocolVariableFieldEnum.ID_DEPARTMENT]: ["value"],
  [ProtocolVariableFieldEnum.ID_SEGMENT]: ["value"],
  [ProtocolVariableFieldEnum.ROUTE]: ["value"],
  [ProtocolVariableFieldEnum.EXAM]: ["examType"],
  [ProtocolVariableFieldEnum.COMBINATION]: ["drug", "route"],
};

const ATTRIBUTE_LABELS: Record<string, string> = {
  [`${ProtocolVariableFieldEnum.ID_DRUG}.value`]: "Medicamento",
  [`${ProtocolVariableFieldEnum.ID_DEPARTMENT}.value`]: "Setor",
  [`${ProtocolVariableFieldEnum.ID_SEGMENT}.value`]: "Segmento",
  [`${ProtocolVariableFieldEnum.ROUTE}.value`]: "Via",
  [`${ProtocolVariableFieldEnum.EXAM}.examType`]: "Exame",
  [`${ProtocolVariableFieldEnum.COMBINATION}.drug`]: "Medicamento",
  [`${ProtocolVariableFieldEnum.COMBINATION}.route`]: "Via",
};

export const COPY_NAME_SUFFIX = " (cópia)";

/** A variable attribute that was emptied by a cross-schema copy. */
export interface IClearedVariableAttribute {
  variableName: string;
  field: string;
  attribute: string;
  label: string;
}

export interface IProtocolCopy {
  values: IProtocolFormBaseFields;
  sourceName: string;
  sourceSchema: string | null;
  crossSchema: boolean;
  clearedAttributes: IClearedVariableAttribute[];
}

const isFilled = (value: any) => {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;

  return true;
};

const getAttributeLabel = (field: string, attribute: string) =>
  ATTRIBUTE_LABELS[`${field}.${attribute}`] ?? attribute;

/**
 * Build the form values for a new protocol out of an existing one.
 *
 * The copy is always detached from the source record (no id, no timestamps)
 * and starts inactive, so an unreviewed copy never fires on its own. When the
 * source belongs to another schema, schema-scoped variable values are cleared
 * and reported back so the caller can tell the user what has to be refilled.
 */
export function buildProtocolCopy(
  source: any,
  currentSchema: string,
): IProtocolCopy {
  const sourceSchema = source?.schema ?? null;
  // A null schema means "Todos" (global protocol). It is editable from any
  // schema, but its ids are still not tied to this one, so a copy of it is
  // treated as cross-schema and its unverifiable values are cleared.
  const crossSchema = sourceSchema !== currentSchema;

  const config = JSON.parse(
    JSON.stringify(source?.config ?? emptyProtocol().config),
  );
  const clearedAttributes: IClearedVariableAttribute[] = [];

  const variables = (config.variables ?? []).map((variable: any) => {
    if (!crossSchema) return variable;

    (SCHEMA_SCOPED_ATTRIBUTES[variable.field] ?? []).forEach((attribute) => {
      if (!isFilled(variable[attribute])) return;

      delete variable[attribute];
      clearedAttributes.push({
        variableName: variable.name,
        field: variable.field,
        attribute,
        label: getAttributeLabel(variable.field, attribute),
      });
    });

    return variable;
  });

  return {
    values: {
      name: `${source?.name ?? ""}${COPY_NAME_SUFFIX}`,
      protocolType: source?.protocolType,
      statusType: 0,
      config: { ...config, variables },
    },
    sourceName: source?.name ?? "",
    sourceSchema,
    crossSchema,
    clearedAttributes,
  };
}

/**
 * Which cleared attributes are still empty in the current form values.
 *
 * This is the only guard for COMBINATION variables: the backend silently drops
 * empty combo attributes instead of rejecting them, so a copy whose drug list
 * was cleared would save fine and match a much broader population than the
 * protocol it came from.
 */
export function findUnfilledClearedAttributes(
  values: IProtocolFormBaseFields,
  clearedAttributes: IClearedVariableAttribute[],
): IClearedVariableAttribute[] {
  const variables = values?.config?.variables ?? [];

  return clearedAttributes.filter((cleared) => {
    const variable = variables.find(
      (v: any) => v?.name === cleared.variableName,
    );

    // The user removed the whole variable — nothing left to refill.
    if (!variable) return false;

    return !isFilled(variable[cleared.attribute]);
  });
}
