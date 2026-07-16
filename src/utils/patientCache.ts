import { getStorageItem, setStorageItem, removeStorageItem } from "./storage";

export type PatientData = {
  idPatient: number | string;
  name: string;
  cache: boolean;
  [k: string]: unknown;
};

export type Cache = Record<string, PatientData>;

type Listener = () => void;

const listeners = new Set<Listener>();

function getSchema(): string {
  return getStorageItem("schema") ?? "default";
}

function getStorageKey(schema: string): string {
  return `patientNamesCache_${schema}`;
}

function load(schema: string): Cache {
  const raw = getStorageItem(getStorageKey(schema));
  try {
    return raw ? (JSON.parse(raw) as Cache) : {};
  } catch {
    return {};
  }
}

function persist(data: Cache): void {
  setStorageItem(getStorageKey(getSchema()), JSON.stringify(data));
}

function notify(): void {
  listeners.forEach((fn) => fn());
}

let currentSchema: string | null = null;
let mem: Cache = {};
let loadingIds = new Set<string>();

function ensureSchemaLoaded(): void {
  const schema = getSchema();
  if (schema !== currentSchema) {
    currentSchema = schema;
    mem = load(schema);
    loadingIds = new Set<string>();
  }
}

export function markLoading(ids: (number | string)[]): void {
  ensureSchemaLoaded();
  ids.forEach((id) => loadingIds.add(String(id)));
  notify();
}

export function isPatientLoading(id: number | string): boolean {
  ensureSchemaLoaded();
  return loadingIds.has(String(id));
}

export function getPatient(id: number | string): PatientData | undefined {
  ensureSchemaLoaded();
  return mem[String(id)];
}

export function getAllPatients(): Cache {
  ensureSchemaLoaded();
  return mem;
}

export function setPatient(data: PatientData): void {
  ensureSchemaLoaded();
  loadingIds.delete(String(data.idPatient));
  mem = { ...mem, [String(data.idPatient)]: data };
  persist(mem);
  notify();
}

export function setPatients(list: Cache): void {
  ensureSchemaLoaded();
  const updates: Cache = {};
  Object.keys(list).forEach((key) => {
    loadingIds.delete(key);
    updates[key] = list[key];
  });

  if (Object.keys(updates).length === 0) {
    notify();
    return;
  }

  mem = { ...mem, ...updates };
  persist(mem);
  notify();
}

export function clearLoading(ids: (number | string)[]): void {
  ensureSchemaLoaded();
  ids.forEach((id) => loadingIds.delete(String(id)));
  notify();
}

export function clearCache(): void {
  ensureSchemaLoaded();
  mem = {};
  removeStorageItem(getStorageKey(getSchema()));
  notify();
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
