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

function getStorageKey(): string {
  return `clinicalNotes_formHistory_${getSchema()}`;
}

function load(): HistoryEntry[] {
  const raw = getStorageItem(getStorageKey());
  try {
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function persist(entries: HistoryEntry[]): void {
  setStorageItem(getStorageKey(), JSON.stringify(entries));
}

export function saveEntry(entry: NewHistoryEntry): void {
  const existing = load();
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
      : [newEntry, ...existing].slice(0, MAX_ENTRIES);
  persist(updated);
}

export function getEntries(): HistoryEntry[] {
  return load();
}

export function clearEntries(): void {
  removeStorageItem(getStorageKey());
}
