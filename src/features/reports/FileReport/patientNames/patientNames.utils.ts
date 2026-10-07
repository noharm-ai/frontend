// Column names that hold the patient id (fkpessoa) in custom report datasets.
export const PATIENT_ID_COLUMNS = ["fkpessoa"];
export const DEFAULT_NAME_COLUMN = "nome_paciente";

export type PatientNames = Record<string, string>;
type Row = Record<string, unknown>;

/** Returns the dataset's patient id column (case-insensitive), if any. */
export function findPatientIdColumn(row: Row | undefined): string | null {
  if (!row) return null;

  return (
    Object.keys(row).find((key) =>
      PATIENT_ID_COLUMNS.includes(key.toLowerCase()),
    ) ?? null
  );
}

/** Picks a name column key that does not collide with the dataset's columns. */
export function resolveNameColumnKey(keys: string[]): string {
  const existing = new Set(keys.map((key) => key.toLowerCase()));
  if (!existing.has(DEFAULT_NAME_COLUMN)) return DEFAULT_NAME_COLUMN;

  let suffix = 2;
  while (existing.has(`${DEFAULT_NAME_COLUMN}_${suffix}`)) suffix++;
  return `${DEFAULT_NAME_COLUMN}_${suffix}`;
}

/** True when a row carries no usable patient id. */
export const isEmptyId = (value: unknown): boolean =>
  value === null ||
  value === undefined ||
  value === "" ||
  typeof value === "object";

/**
 * Distinct patient ids of the dataset, deduplicated by their string form and
 * kept with their original value for the name request.
 */
export function collectDistinctPatientIds(
  rows: Row[],
  idKey: string,
): (string | number)[] {
  const seen = new Map<string, string | number>();

  rows.forEach((row) => {
    const value = row[idKey];
    if (isEmptyId(value)) return;

    const key = String(value);
    if (!seen.has(key)) seen.set(key, value as string | number);
  });

  return Array.from(seen.values());
}

/**
 * Adds the patient name right after the id column of every row. The key is
 * set on every row, null while unknown, so the column exists before any name
 * is loaded: the filter schema reads the columns from the first row only.
 */
export function enrichRowsWithNames(
  rows: Row[],
  idKey: string,
  nameKey: string,
  names: PatientNames,
): Row[] {
  return rows.map((row) => {
    const enriched: Row = {};
    const idValue = row[idKey];

    Object.keys(row).forEach((key) => {
      enriched[key] = row[key];
      if (key === idKey) {
        enriched[nameKey] = isEmptyId(idValue)
          ? null
          : (names[String(idValue)] ?? null);
      }
    });

    // rows missing the id column still get the key, as null
    if (!(nameKey in enriched)) enriched[nameKey] = null;

    return enriched;
  });
}
