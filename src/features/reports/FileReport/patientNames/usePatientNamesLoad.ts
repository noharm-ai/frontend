import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAppSelector } from "src/store";
import hospital from "src/services/hospital";
import {
  trackCustomReportAction,
  TrackedCustomReportAction,
} from "src/utils/tracker";
import {
  loadPatientNames,
  LoadPlan,
  LoadResult,
  NameLookup,
  planPatientNames,
} from "./loadPatientNames";
import { PatientNames } from "./patientNames.utils";

/** The report's patient names as the page holds them. */
export interface ReportNames {
  /** Distinct patient ids of the report. */
  ids: (string | number)[];
  /** Names loaded so far, keyed by String(id). */
  known: PatientNames;
  /** Ids the name service answered as unknown. */
  notFound: ReadonlySet<string>;
  /** Receives what each run learned. */
  onLoaded: (result: LoadResult) => void;
}

/**
 * Loads the report's patient names with progress and cancel, for the
 * components that offer it (the "load names" modal and the export).
 */
export function usePatientNamesLoad(
  names: ReportNames,
  source: "button" | "export",
) {
  const appConfig = useAppSelector((state: any) => state.app.config);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const lookup = useMemo<NameLookup>(
    () => ({
      // one id per request without a batch endpoint, 10 in flight
      batchSize: appConfig.multipleNameUrl ? 100 : 1,
      concurrency: appConfig.multipleNameUrl ? 1 : 10,
      resolveHeaders: () => hospital.resolveNameHeaders(appConfig),
      fetchNames: (ids, { signal, headers }) =>
        hospital.getPatientNames({
          ids,
          nameUrl: appConfig.nameUrl,
          multipleNameUrl: appConfig.multipleNameUrl,
          headers,
          signal,
        }),
    }),
    [appConfig],
  );

  const { ids, known, notFound, onLoaded } = names;

  const plan = useCallback(
    (): LoadPlan => planPatientNames(ids, known, notFound),
    [ids, known, notFound],
  );

  /** Resolves to the run's result, or null when the component unmounted. */
  const run = useCallback(async (): Promise<LoadResult | null> => {
    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    setProgress({ current: 0, total: 0 });

    const result = await loadPatientNames({
      ids,
      known,
      notFound,
      lookup,
      signal: controller.signal,
      onProgress: (current, total) => {
        if (mountedRef.current) setProgress({ current, total });
      },
    });

    abortRef.current = null;
    if (!mountedRef.current) return null;

    setRunning(false);
    onLoaded(result);

    const { names: _names, notFound: _notFound, ...counts } = result;
    trackCustomReportAction(TrackedCustomReportAction.LOAD_PATIENT_NAMES, {
      source,
      total: ids.length,
      ...counts,
    });

    return result;
  }, [ids, known, notFound, lookup, onLoaded, source]);

  const cancel = useCallback(() => abortRef.current?.abort(), []);

  return { running, progress, plan, run, cancel };
}
