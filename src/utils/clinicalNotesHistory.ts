export type HistoryEntry = {
  id: string;
  timestamp: number;
  admissionNumber: string;
  idPrescription: number;
  tplName: string;
  templateData: unknown[];
  formValues: Record<string, unknown>;
};

import { getStorageItem, setStorageItem, removeStorageItem } from "./storage";

export type NewHistoryEntry = Omit<HistoryEntry, "id" | "timestamp">;

const MAX_ENTRIES = 30;

function getSchema(): string {
  return getStorageItem("schema") ?? "default";
}

// `scope` isolates a feature's drafts into their own storage key so unrelated
// forms don't pollute each other's history or collide on the
// `admissionNumber + tplName` dedup key. Omitting it preserves the original
// (shared) key used by the clinical-notes custom forms.
function getStorageKey(scope?: string): string {
  const base = `clinicalNotes_formHistory_${getSchema()}`;
  return scope ? `${base}_${scope}` : base;
}

function load(scope?: string): HistoryEntry[] {
  const raw = getStorageItem(getStorageKey(scope));
  try {
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function persist(entries: HistoryEntry[], scope?: string): void {
  setStorageItem(getStorageKey(scope), JSON.stringify(entries));
}

export function saveEntry(
  entry: NewHistoryEntry,
  scope?: string,
  maxEntries: number = MAX_ENTRIES,
): void {
  const existing = load(scope);
  const matchIdx = existing.findIndex(
    (e) =>
      e.admissionNumber === entry.admissionNumber &&
      e.tplName === entry.tplName,
  );
  const newEntry: HistoryEntry = {
    ...entry,
    id: `${Date.now()}_${entry.admissionNumber}_${entry.tplName}`,
    timestamp: Date.now(),
  };
  const updated =
    matchIdx !== -1
      ? existing.map((e, i) => (i === matchIdx ? newEntry : e))
      : [newEntry, ...existing].slice(0, maxEntries);
  persist(updated, scope);
}

export function getEntries(scope?: string): HistoryEntry[] {
  return load(scope);
}

export function clearEntries(scope?: string): void {
  removeStorageItem(getStorageKey(scope));
}
