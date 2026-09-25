import { getStorageItem, setStorageItem, removeStorageItem } from "./storage";

export type PatientData = {
  idPatient: number | string;
  name: string;
  cache: boolean;
  [k: string]: unknown;
};

export type Cache = Record<string, PatientData>;

type Listener = () => void;

// Upper bound of cached patients per schema. Least recently used entries are
// evicted first, keeping memory usage and the localStorage payload bounded.
const MAX_ENTRIES = 5000;
const PERSIST_DELAY = 500;

const listeners = new Set<Listener>();

function getSchema(): string {
  return getStorageItem("schema") ?? "default";
}

function getStorageKey(schema: string): string {
  return `patientNamesCache_${schema}`;
}

// Stored as an array of [id, data] ordered from least to most recently used.
// A plain object would not keep that order, since numeric-like keys are
// always iterated in ascending order.
function load(schema: string): Map<string, PatientData> {
  const raw = getStorageItem(getStorageKey(schema));
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed)) {
      return trim(
        new Map(
          parsed.filter(
            (entry): entry is [string, PatientData] =>
              Array.isArray(entry) && isValidEntry(entry[0], entry[1]),
          ),
        ),
      );
    }
    if (parsed && typeof parsed === "object") {
      // legacy format: plain object without usage order
      return trim(
        new Map(
          Object.entries(parsed as Cache).filter(([key, data]) =>
            isValidEntry(key, data),
          ),
        ),
      );
    }
  } catch {
    // corrupted cache — start over
  }
  return new Map();
}

// Discards malformed entries, e.g. leftovers written by an older app version
// reading the current format, so they are fetched again.
function isValidEntry(key: unknown, data: unknown): data is PatientData {
  return (
    typeof key === "string" &&
    data !== null &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    String((data as PatientData).idPatient) === key
  );
}

function trim(cache: Map<string, PatientData>): Map<string, PatientData> {
  if (cache.size <= MAX_ENTRIES) return cache;

  const excess = cache.size - MAX_ENTRIES;
  const keys = cache.keys();
  for (let i = 0; i < excess; i++) {
    cache.delete(keys.next().value as string);
  }
  return cache;
}

function persist(schema: string, cache: Map<string, PatientData>): void {
  let entries = Array.from(cache.entries());

  // localStorage is shared with the rest of the app: when the quota is
  // exceeded, keep dropping the oldest half until it fits.
  while (entries.length > 0) {
    if (setStorageItem(getStorageKey(schema), JSON.stringify(entries))) {
      return;
    }
    entries = entries.slice(Math.ceil(entries.length / 2));
  }

  removeStorageItem(getStorageKey(schema));
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;

// Writes are batched: many names usually arrive at once (one request per
// patient), and serializing the whole cache for each one is expensive.
function schedulePersist(): void {
  if (persistTimer) return;
  persistTimer = setTimeout(flush, PERSIST_DELAY);
}

function flush(): void {
  if (persistTimer) {
    clearTimeout(persistTimer);
    persistTimer = null;
  }
  if (currentSchema !== null) {
    persist(currentSchema, mem);
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => {
    if (persistTimer) flush();
  });
}

function notify(): void {
  listeners.forEach((fn) => fn());
}

let currentSchema: string | null = null;
let mem = new Map<string, PatientData>();
let loadingIds = new Set<string>();

function ensureSchemaLoaded(): void {
  const schema = getSchema();
  if (schema !== currentSchema) {
    if (persistTimer) flush();
    currentSchema = schema;
    mem = load(schema);
    loadingIds = new Set<string>();
  }
}

function put(data: PatientData): void {
  const key = String(data.idPatient);
  loadingIds.delete(key);
  mem.delete(key);
  mem.set(key, data);
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
  const key = String(id);
  const data = mem.get(key);
  if (data) {
    // mark as recently used (in memory only, persisted on the next write)
    mem.delete(key);
    mem.set(key, data);
  }
  return data;
}

export function setPatient(data: PatientData): void {
  ensureSchemaLoaded();
  put(data);
  trim(mem);
  schedulePersist();
  notify();
}

export function setPatients(list: Cache): void {
  ensureSchemaLoaded();
  const keys = Object.keys(list);

  if (keys.length === 0) {
    notify();
    return;
  }

  keys.forEach((key) => put(list[key]));
  trim(mem);
  schedulePersist();
  notify();
}

export function clearLoading(ids: (number | string)[]): void {
  ensureSchemaLoaded();
  ids.forEach((id) => loadingIds.delete(String(id)));
  notify();
}

export function clearCache(): void {
  ensureSchemaLoaded();
  if (persistTimer) {
    clearTimeout(persistTimer);
    persistTimer = null;
  }
  mem = new Map();
  removeStorageItem(getStorageKey(getSchema()));
  notify();
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
