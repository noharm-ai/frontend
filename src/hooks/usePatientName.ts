import { useSyncExternalStore } from "react";
import {
  subscribe,
  getPatient,
  isPatientLoading,
} from "utils/patientCache";

export function usePatientName(idPatient: number | string) {
  const name = useSyncExternalStore(
    subscribe,
    () => getPatient(idPatient)?.name ?? null,
    () => null
  );
  const isLoading = useSyncExternalStore(
    subscribe,
    () => isPatientLoading(idPatient),
    () => false
  );
  return { name, isLoading };
}
