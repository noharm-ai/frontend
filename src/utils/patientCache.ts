const STORAGE_KEY = "patientNamesCache";

export type PatientData = {
  idPatient: number | string;
  name: string;
  cache: boolean;
  [k: string]: unknown;
};

export type Cache = Record<string, PatientData>;

type Listener = () => void;

const listeners = new Set<Listener>();

function load(): Cache {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Cache) : {};
  } catch {
    return {};
  }
}

function persist(data: Cache): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be unavailable (private mode, quota exceeded)
  }
}

function notify(): void {
  listeners.forEach((fn) => fn());
}

let mem: Cache = load();
const loadingIds = new Set<string>();

export function markLoading(ids: (number | string)[]): void {
  ids.forEach((id) => loadingIds.add(String(id)));
  notify();
}

export function isPatientLoading(id: number | string): boolean {
  return loadingIds.has(String(id));
}

export function getPatient(id: number | string): PatientData | undefined {
  return mem[String(id)];
}

export function getAllPatients(): Cache {
  return mem;
}

export function setPatient(data: PatientData): void {
  loadingIds.delete(String(data.idPatient));
  mem = { ...mem, [String(data.idPatient)]: data };
  persist(mem);
  notify();
}

export function setPatients(list: Cache): void {
  const updates: Cache = {};
  Object.keys(list).forEach((key) => {
    loadingIds.delete(key);
    if (list[key].cache) {
      updates[key] = list[key];
    }
  });

  if (Object.keys(updates).length === 0) {
    notify();
    return;
  }

  mem = { ...mem, ...updates };
  persist(mem);
  notify();
}

export function clearCache(): void {
  mem = {};
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  notify();
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
