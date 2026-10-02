import { useCallback, useEffect, useRef, useState } from "react";

import {
  trackCustomReportAction,
  TrackedCustomReportAction,
} from "src/utils/tracker";
import { LoadAllResult, PatientNameStore } from "./patientNameStore";

interface Options {
  /** Called when a run ends; `complete` when every patient was answered. */
  onFinished: (result: { complete: boolean }) => void;
  /** Where the run was started from, for tracking. */
  source: "button" | "export";
}

/**
 * Runs the store's full load with cancel and progress, for the components
 * that offer it (the "load all names" modal and the export with names).
 */
export function usePatientNamesLoad(
  store: PatientNameStore | null,
  { onFinished, source }: Options,
) {
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

  /** Resolves to the run's result, or null when the component unmounted. */
  const run = useCallback(async (): Promise<LoadAllResult | null> => {
    if (!store) return null;

    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    setProgress({ current: 0, total: 0 });

    const result = await store.loadAll({
      signal: controller.signal,
      onProgress: (current, total) => {
        if (mountedRef.current) setProgress({ current, total });
      },
    });

    abortRef.current = null;
    if (!mountedRef.current) return null;

    setRunning(false);
    onFinished({ complete: result.complete });
    trackCustomReportAction(TrackedCustomReportAction.LOAD_PATIENT_NAMES, {
      source,
      ...result,
    });

    return result;
  }, [store, onFinished, source]);

  const cancel = useCallback(() => abortRef.current?.abort(), []);

  return { running, progress, run, cancel };
}
