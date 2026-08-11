import { getStorageItem, setStorageItem, removeStorageItem } from "./storage";

export type EditDraft = {
  id: string;
  text?: string;
  date?: string;
  form?: Record<string, unknown>;
  timestamp: number;
};

export type NewEditDraft = Omit<EditDraft, "id" | "timestamp">;

function getSchema(): string {
  return getStorageItem("schema") ?? "default";
}

function getStorageKey(): string {
  return `clinicalNotes_editDraft_${getSchema()}`;
}

// Only the most recent draft is kept, so the storage never grows: a new draft
// (for any note) overwrites the previous one.
export function saveDraft(id: string | number, data: NewEditDraft): void {
  const draft: EditDraft = { ...data, id: String(id), timestamp: Date.now() };
  setStorageItem(getStorageKey(), JSON.stringify(draft));
}

export function getDraft(id: string | number): EditDraft | null {
  const raw = getStorageItem(getStorageKey());
  if (!raw) return null;
  try {
    const draft = JSON.parse(raw) as EditDraft;
    return draft.id === String(id) ? draft : null;
  } catch {
    return null;
  }
}

export function clearDraft(id: string | number): void {
  const raw = getStorageItem(getStorageKey());
  if (!raw) return;
  try {
    const draft = JSON.parse(raw) as EditDraft;
    if (draft.id === String(id)) {
      removeStorageItem(getStorageKey());
    }
  } catch {
    removeStorageItem(getStorageKey());
  }
}
