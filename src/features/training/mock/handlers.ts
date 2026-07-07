import type { InternalAxiosRequestConfig } from "axios";

import { trainingPrescriptionsListPayload } from "./fixtures/prescriptionsList";
import { trainingPrescriptionSinglePayload } from "./fixtures/prescriptionSingle";

export type TrainingHandler = (config: InternalAxiosRequestConfig) => unknown;

const emptyList: TrainingHandler = () => ({ status: "success", data: [] });

/** Nth path segment, e.g. pathSegment("/prescriptions/991001", 1) => "991001". */
const pathSegment = (config: InternalAxiosRequestConfig, index: number) =>
  (config.url ?? "").split("?")[0].split("/").filter(Boolean)[index];

/** The adapter runs after transformRequest, so data is usually a JSON string. */
const requestBody = (config: InternalAxiosRequestConfig) => {
  try {
    return typeof config.data === "string"
      ? JSON.parse(config.data)
      : (config.data ?? {});
  } catch {
    return {};
  }
};

/**
 * Endpoints answered with fixtures while training mode is active. Keys follow
 * the "METHOD /path" convention of tests/mocked/support/mockApi.ts (":" marks
 * a wildcard segment). Writes return harmless success payloads so user
 * actions "work" without ever touching the backend.
 */
export const trainingHandlers: Record<string, TrainingHandler> = {
  "GET /prescriptions": () => trainingPrescriptionsListPayload(),
  "GET /prescriptions/:id": (config) =>
    trainingPrescriptionSinglePayload(Number(pathSegment(config, 1))),
  "GET /exams/:admissionNumber": emptyList,
  "GET /notes/:admissionNumber/v2": emptyList,
  "POST /prescriptions/status": (config) => ({
    status: "success",
    data: [requestBody(config)?.idPrescription],
  }),
  "POST /prescriptions/start-evaluation": () => ({
    status: "success",
    data: null,
  }),
  "GET /prescriptions/:id/update": () => ({ status: "success", data: {} }),
  // async job polling: always terminal so the UI never polls forever
  "GET /queue/status/:id": () => ({
    status: "success",
    data: { status: "completed", url: null },
  }),
};
