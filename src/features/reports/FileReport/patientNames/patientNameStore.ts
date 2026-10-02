import { peekPatient } from "src/utils/patientCache";
import { PatientNames } from "./patientNames.utils";

/**
 * idle: never requested · loading: request in flight · loaded: name known ·
 * missing: the name service does not know the patient · error: the lookup
 * failed (or was never answered), so it is retried.
 */
export type NameStatus = "idle" | "loading" | "loaded" | "missing" | "error";

export interface FetchNamesResult {
  names: PatientNames;
  notFound: string[];
}

export type FetchNames = (
  ids: (string | number)[],
  options: { signal: AbortSignal; headers: object | undefined },
) => Promise<FetchNamesResult>;

interface StoreOptions {
  fetchNames: FetchNames;
  /** Resolved once per run, so an auth token is not fetched per request. */
  resolveHeaders: () => Promise<object | undefined>;
  /** Ids per request. */
  batchSize: number;
  /** Requests in flight at once. */
  concurrency: number;
  /**
   * How long an id must stay on screen before it is requested, so the rows a
   * fast scroll flies past are never fetched.
   */
  delay?: number;
}

export interface LoadPlan {
  total: number;
  loaded: number;
  missing: number;
  cached: number;
  pending: number;
}

export interface LoadAllResult {
  cached: number;
  fetched: number;
  notFound: number;
  failed: number;
  remaining: number;
  cancelled: boolean;
  /** Every patient of the report has a definitive answer: name or not found. */
  complete: boolean;
}

/**
 * Patient names of one report, kept only in page memory: the app's shared
 * name cache is read (without reordering it) but never written.
 *
 * Cells `watch` the id they show; ids still on screen once the delay elapses
 * are requested. `loadAll` requests every patient not answered yet.
 */
export interface PatientNameStore {
  /**
   * Sets the report's distinct patient ids. What is known about ids that stay
   * is kept (so reloading the same dataset requests nothing again); the rest
   * is dropped, so counts only cover the current report.
   */
  setIds(ids: (string | number)[]): void;
  getName(id: string | number): string | undefined;
  getStatus(id: string | number): NameStatus;
  /** Every name loaded so far (a copy). */
  getNames(): PatientNames;
  loadedCount(): number;
  /** What a full load would do now. */
  plan(): LoadPlan;
  loadAll(options: {
    signal: AbortSignal;
    onProgress: (current: number, total: number) => void;
  }): Promise<LoadAllResult>;
  /** Registers an on-screen id; the returned function unregisters it. */
  watch(id: string | number): () => void;
  subscribe(listener: () => void): () => void;
  /**
   * Cancels the scheduled and in-flight lookups. The store stays usable:
   * StrictMode runs effect cleanups and then the effects again on mount, and
   * ids watched afterwards are requested as usual.
   */
  stop(): void;
}

/** Aborts when any of the given signals aborts. */
const anySignal = (signals: AbortSignal[]): AbortSignal => {
  const controller = new AbortController();
  signals.forEach((signal) => {
    if (signal.aborted) controller.abort();
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  });
  return controller.signal;
};

export function createPatientNameStore({
  fetchNames,
  resolveHeaders,
  batchSize,
  concurrency,
  delay = 150,
}: StoreOptions): PatientNameStore {
  const originalIds = new Map<string, string | number>();
  const names = new Map<string, string>();
  const status = new Map<string, NameStatus>();
  const watchers = new Map<string, number>();
  const pending = new Set<string>();
  const listeners = new Set<() => void>();
  let controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | null = null;
  let queue: Promise<unknown> = Promise.resolve();

  const notify = () => listeners.forEach((listener) => listener());

  const setLoaded = (key: string, name: string) => {
    names.set(key, name);
    status.set(key, "loaded");
  };

  /** Takes the cached name, when there is one, without touching the cache. */
  const fromCache = (key: string) => {
    const cachedName = peekPatient(originalIds.get(key) ?? key)?.name;
    if (cachedName) setLoaded(key, cachedName);
    return !!cachedName;
  };

  const release = (batch: string[]) =>
    batch.forEach((key) => {
      if (status.get(key) === "loading") status.delete(key);
    });

  /**
   * Requests the batches with up to `concurrency` in flight. Returns the
   * outcome per batch; stops early when a whole batch fails, instead of
   * hammering a name service that is down.
   */
  const runBatches = async (
    batches: string[][],
    signal: AbortSignal,
    onBatchDone?: (batch: string[], found: number) => void,
  ) => {
    const outcome = { found: 0, notFound: 0, failed: 0, stopped: false };
    if (!batches.length) return outcome;

    let headers: object | undefined;
    try {
      headers = await resolveHeaders();
    } catch {
      batches.forEach((batch) =>
        batch.forEach((key) => status.set(key, "error")),
      );
      outcome.failed = batches.flat().length;
      outcome.stopped = true;
      notify();
      return outcome;
    }

    let next = 0;
    const worker = async () => {
      while (next < batches.length && !outcome.stopped && !signal.aborted) {
        const batch = batches[next++];
        batch.forEach((key) => status.set(key, "loading"));
        notify();

        let result: FetchNamesResult | null = null;
        try {
          result = await fetchNames(
            batch.map((key) => originalIds.get(key) ?? key),
            { signal, headers },
          );
        } catch {
          // handled below, as a batch with no answer
        }

        if (signal.aborted) {
          release(batch);
          notify();
          return;
        }

        const notFound = new Set(result?.notFound ?? []);
        let found = 0;
        batch.forEach((key) => {
          // the report changed while the request was in flight
          if (!originalIds.has(key)) {
            status.delete(key);
            return;
          }

          const name = result?.names[key];
          if (name) {
            setLoaded(key, name);
            found++;
          } else if (notFound.has(key)) {
            status.set(key, "missing");
            outcome.notFound++;
          } else {
            status.set(key, "error");
            outcome.failed++;
          }
        });
        outcome.found += found;
        if (found === 0 && notFound.size === 0) outcome.stopped = true;

        notify();
        onBatchDone?.(batch, found);
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(concurrency, batches.length) }, worker),
    );

    // batches that never ran: reserved ids are retried later (an error is
    // retried when the row comes back on screen)
    batches.slice(next).forEach((batch) =>
      batch.forEach((key) => {
        if (status.get(key) !== "loading") return;
        if (outcome.stopped) {
          status.set(key, "error");
        } else {
          status.delete(key);
        }
      }),
    );
    notify();

    return outcome;
  };

  const toBatches = (keys: string[]) => {
    const batches: string[][] = [];
    for (let i = 0; i < keys.length; i += batchSize) {
      batches.push(keys.slice(i, i + batchSize));
    }
    return batches;
  };

  const flush = () => {
    timer = null;

    // only ids still on screen: the rest scrolled away before the delay
    const visible = Array.from(pending).filter(
      (key) => (watchers.get(key) ?? 0) > 0 && !status.has(key),
    );
    pending.clear();
    if (!visible.length) return;

    // reserved now, so a later flush does not request them again
    visible.forEach((key) => status.set(key, "loading"));
    notify();

    const { signal } = controller;
    queue = queue.then(() => runBatches(toBatches(visible), signal));
  };

  // ids a full load still has to ask for: neither loaded nor known missing
  const unanswered = () =>
    Array.from(originalIds.keys()).filter((key) => {
      const current = status.get(key);
      return current !== "loaded" && current !== "missing";
    });

  return {
    setIds(nextIds) {
      const next = new Set(nextIds.map(String));
      originalIds.clear();
      nextIds.forEach((id) => originalIds.set(String(id), id));

      names.forEach((_, key) => {
        if (!next.has(key)) names.delete(key);
      });
      // in-flight lookups settle on their own (and are discarded then)
      status.forEach((current, key) => {
        if (!next.has(key) && current !== "loading") status.delete(key);
      });
      notify();
    },

    getName: (id) => names.get(String(id)),
    getStatus: (id) => status.get(String(id)) ?? "idle",
    getNames: () => Object.fromEntries(names),
    loadedCount: () => names.size,

    plan() {
      const keys = unanswered();
      const cached = keys.filter(
        (key) => !!peekPatient(originalIds.get(key) ?? key)?.name,
      ).length;

      return {
        total: originalIds.size,
        loaded: names.size,
        missing: Array.from(status.values()).filter((s) => s === "missing")
          .length,
        cached,
        pending: keys.length - cached,
      };
    },

    async loadAll({ signal: callerSignal, onProgress }) {
      const signal = anySignal([callerSignal, controller.signal]);

      // let the on-screen lookups in flight settle, so they are not repeated
      await queue.catch(() => undefined);

      const keys = unanswered();
      const toFetch = keys.filter((key) => !fromCache(key));
      const cached = keys.length - toFetch.length;
      if (cached) notify();

      let processed = 0;
      onProgress(0, toFetch.length);
      const outcome = await runBatches(toBatches(toFetch), signal, (batch) => {
        processed += batch.length;
        onProgress(processed, toFetch.length);
      });

      const remaining = toFetch.length - processed;
      return {
        cached,
        fetched: outcome.found,
        notFound: outcome.notFound,
        failed: outcome.failed,
        remaining,
        cancelled: callerSignal.aborted,
        complete: remaining === 0 && outcome.failed === 0,
      };
    },

    watch(id) {
      const key = String(id);
      watchers.set(key, (watchers.get(key) ?? 0) + 1);
      if (!originalIds.has(key)) originalIds.set(key, id);

      // a failed lookup is retried when the row comes back on screen
      if (status.get(key) === "error") status.delete(key);

      if (!status.has(key)) {
        if (fromCache(key)) {
          notify();
        } else {
          pending.add(key);
          if (!timer) timer = setTimeout(flush, delay);
        }
      }

      return () => {
        const count = (watchers.get(key) ?? 1) - 1;
        if (count > 0) {
          watchers.set(key, count);
        } else {
          watchers.delete(key);
        }
      };
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    stop() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      controller.abort();
      controller = new AbortController();
      // reservations of a flush that never ran go back to idle
      status.forEach((current, key) => {
        if (current === "loading") status.delete(key);
      });
    },
  };
}
