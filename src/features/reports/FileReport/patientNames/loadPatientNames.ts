import { peekPatient } from "src/utils/patientCache";
import { PatientNames } from "./patientNames.utils";

export interface FetchNamesResult {
  names: PatientNames;
  notFound: string[];
}

export type FetchNames = (
  ids: (string | number)[],
  options: { signal: AbortSignal; headers: object | undefined },
) => Promise<FetchNamesResult>;

export interface NameLookup {
  fetchNames: FetchNames;
  /** Resolved once per run, so an auth token is not fetched per request. */
  resolveHeaders: () => Promise<object | undefined>;
  /** Ids per request. */
  batchSize: number;
  /** Requests in flight at once. */
  concurrency: number;
}

export interface LoadPlan {
  total: number;
  /** Names already on the page. */
  loaded: number;
  /** Patients the name service already answered as unknown. */
  missing: number;
  /** Names a run takes from the app's name cache, without a request. */
  cached: number;
  /** Names a run requests. */
  pending: number;
}

export interface LoadResult {
  /** Names learned by this run: cache hits and fetched. */
  names: PatientNames;
  /** Ids the name service answered as unknown in this run. */
  notFound: string[];
  cached: number;
  fetched: number;
  failed: number;
  remaining: number;
  cancelled: boolean;
  /** Every patient of the report has an answer: a name or not found. */
  complete: boolean;
}

/** Ids still without an answer, keyed by String(id). */
const unanswered = (
  ids: (string | number)[],
  known: PatientNames,
  notFound: ReadonlySet<string>,
) =>
  ids.filter((id) => {
    const key = String(id);
    return !known[key] && !notFound.has(key);
  });

export function planPatientNames(
  ids: (string | number)[],
  known: PatientNames,
  notFound: ReadonlySet<string>,
): LoadPlan {
  const open = unanswered(ids, known, notFound);
  const cached = open.filter((id) => !!peekPatient(id)?.name).length;

  return {
    total: ids.length,
    loaded: ids.filter((id) => !!known[String(id)]).length,
    missing: notFound.size,
    cached,
    pending: open.length - cached,
  };
}

/**
 * Loads the names of the report's patients that have no answer yet. Names
 * come from the app's name cache when there (read without reordering it,
 * never written) and from the name service otherwise, in batches. A run
 * stops when a whole batch fails, instead of hammering a service that is
 * down; ids the service leaves out count as failures, to be retried.
 */
export async function loadPatientNames({
  ids,
  known,
  notFound,
  lookup,
  signal,
  onProgress,
}: {
  ids: (string | number)[];
  known: PatientNames;
  notFound: ReadonlySet<string>;
  lookup: NameLookup;
  signal: AbortSignal;
  onProgress: (current: number, total: number) => void;
}): Promise<LoadResult> {
  const names: PatientNames = {};
  const newlyNotFound: string[] = [];
  const toFetch: (string | number)[] = [];

  unanswered(ids, known, notFound).forEach((id) => {
    const cachedName = peekPatient(id)?.name;
    if (cachedName) {
      names[String(id)] = cachedName;
    } else {
      toFetch.push(id);
    }
  });
  const cached = Object.keys(names).length;

  const batches: (string | number)[][] = [];
  for (let i = 0; i < toFetch.length; i += lookup.batchSize) {
    batches.push(toFetch.slice(i, i + lookup.batchSize));
  }

  let processed = 0;
  let fetched = 0;
  let failed = 0;
  let stopped = false;
  onProgress(0, toFetch.length);

  if (batches.length) {
    let headers: object | undefined;
    try {
      headers = await lookup.resolveHeaders();
    } catch {
      stopped = true;
    }

    let next = 0;
    const worker = async () => {
      while (next < batches.length && !stopped && !signal.aborted) {
        const batch = batches[next++];

        let result: FetchNamesResult | null = null;
        try {
          result = await lookup.fetchNames(batch, { signal, headers });
        } catch {
          // a batch with no answer, handled below
        }
        if (signal.aborted) return;

        const unknown = new Set(result?.notFound ?? []);
        let found = 0;
        batch.forEach((id) => {
          const key = String(id);
          const name = result?.names[key];
          if (name) {
            names[key] = name;
            found++;
          } else if (unknown.has(key)) {
            newlyNotFound.push(key);
          } else {
            failed++;
          }
        });

        fetched += found;
        processed += batch.length;
        if (found === 0 && unknown.size === 0) stopped = true;
        onProgress(processed, toFetch.length);
      }
    };

    await Promise.all(
      Array.from(
        { length: Math.min(lookup.concurrency, batches.length) },
        worker,
      ),
    );
  }

  const remaining = toFetch.length - processed;
  return {
    names,
    notFound: newlyNotFound,
    cached,
    fetched,
    failed,
    remaining,
    cancelled: signal.aborted,
    complete: remaining === 0 && failed === 0,
  };
}
