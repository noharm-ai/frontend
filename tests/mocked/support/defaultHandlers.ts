import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Handler } from "./mockApi";
import { fakeJwt } from "./token";

const FIXTURES_DIR = fileURLToPath(new URL("../fixtures", import.meta.url));

/**
 * Loads a fixture JSON, replacing date/token placeholders so the data is
 * always "fresh" relative to the moment the test runs:
 *   __FAKE_JWT__         a well-formed JWT with a far-future exp
 *   __DATE_NOW__         2 hours ago (prescription release date)
 *   __DATE_EXPIRE__      22 hours from now (prescription expiration)
 *   __DATE_ADMISSION__   5 days ago
 *   __DATE_BIRTH__       a fixed adult birthdate
 */
export function loadFixture<T = unknown>(relativePath: string): T {
  const raw = fs.readFileSync(path.join(FIXTURES_DIR, relativePath), "utf-8");

  const hoursFromNow = (hours: number) =>
    new Date(Date.now() + hours * 60 * 60 * 1000).toISOString().slice(0, 19);

  const hydrated = raw
    .replaceAll("__FAKE_JWT__", fakeJwt())
    .replaceAll("__DATE_NOW__", hoursFromNow(-2))
    .replaceAll("__DATE_EXPIRE__", hoursFromNow(22))
    .replaceAll("__DATE_ADMISSION__", hoursFromNow(-5 * 24))
    .replaceAll("__DATE_BIRTH__", "1980-05-10T00:00:00");

  return JSON.parse(hydrated) as T;
}

const json = (relativePath: string): Handler => ({
  json: loadFixture(relativePath),
});

const emptyList: Handler = { json: { status: "success", data: [] } };

/**
 * Happy-path handlers installed for every mocked test. Override any of
 * them per test with mockApi.override().
 */
export function defaultHandlers(): Record<string, Handler> {
  return {
    // auth
    "POST /authenticate": json("auth/authenticate.json"),
    "POST /refresh-token": {
      json: { status: "success", access_token: fakeJwt() },
    },

    // getname service (proxy mode, see src/services/hospital.js)
    "POST /names": json("names/multiple.json"),
    "GET /names/:idPatient": json("names/single.json"),

    // base data
    "GET /segments": json("segments/list.json"),
    "GET /memory/:type": emptyList,
    "GET /support/list-pending": emptyList,
    "GET /user/preferences": emptyList,

    // prioritization / screening
    "GET /prescriptions": json("prescriptions/list.json"),
    "GET /prescriptions/:id": json("prescriptions/single-199.json"),
    "GET /exams/:admissionNumber": emptyList,
    "GET /notes/:admissionNumber/v2": emptyList,
    "POST /prescriptions/status": {
      json: { status: "success", data: [199] },
    },
    "POST /prescriptions/start-evaluation": {
      json: { status: "success", data: null },
    },
    "GET /prescriptions/:id/update": { json: { status: "success", data: {} } },

    // async job polling: always terminal so the UI never polls forever
    "GET /queue/status/:id": {
      json: { status: "success", data: { status: "completed", url: null } },
    },
  };
}
