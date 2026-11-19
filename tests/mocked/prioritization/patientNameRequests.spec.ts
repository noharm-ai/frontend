import type { Route } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";
import { loginWithAuth } from "../support/featureLogin";

/**
 * Without a multipleNameUrl the app asks the name service for one patient per
 * GET (src/services/hospital.js). A long list used to fire every request at
 * once, which got the burst rate limited (429) and timed out the requests
 * the browser kept queued behind its few connections per host. The lookups
 * now share a small concurrency limit, and a 429 is retried after the wait
 * the service asks for in Retry-After.
 */

// NAME_REQUEST_CONCURRENCY in src/services/hospital.js
const MAX_IN_FLIGHT = 4;

// a name service on another origin, called directly by the browser
const NAME_SERVICE = "https://getname.example.com";
const PATIENT_IDS = Array.from({ length: 30 }, (_, i) => 501 + i);
const RATE_LIMITED_ID = 520;
const RETRY_AFTER_SECONDS = 3;

const patientName = (idPatient: number) => `Fulano Beltrano ${idPatient}`;

test.use({ storageState: { cookies: [], origins: [] } });

test("caps the name requests in flight and retries a rate-limited one", async ({
  page,
  mockApi,
}) => {
  const [template] = loadFixture<{ data: Record<string, unknown>[] }>(
    "prescriptions/list.json",
  ).data;
  mockApi.override("POST /prescriptions", {
    json: {
      status: "success",
      data: PATIENT_IDS.map((idPatient) => ({
        ...template,
        idPrescription: 1000 + idPatient,
        admissionNumber: 2000 + idPatient,
        idPatient,
        namePatient: `Paciente ${idPatient}`,
      })),
    },
  });

  let inFlight = 0;
  let maxInFlight = 0;
  const requestTimes = new Map<number, number[]>();

  await page.context().route(`${NAME_SERVICE}/**`, async (route: Route) => {
    const request = route.request();
    const cors = {
      "Access-Control-Allow-Origin": request.headers()["origin"] ?? "*",
      "Access-Control-Expose-Headers": "Retry-After",
    };
    const idPatient = Number(new URL(request.url()).pathname.split("/").pop());
    const times = requestTimes.get(idPatient) ?? [];
    times.push(Date.now());
    requestTimes.set(idPatient, times);

    inFlight++;
    maxInFlight = Math.max(maxInFlight, inFlight);

    if (idPatient === RATE_LIMITED_ID && times.length === 1) {
      inFlight--;
      return route.fulfill({
        status: 429,
        headers: { ...cors, "Retry-After": String(RETRY_AFTER_SECONDS) },
        json: { status: "error", message: "Too Many Requests" },
      });
    }

    // hold the request so the app has time to start the next ones
    await new Promise((resolve) => setTimeout(resolve, 150));
    inFlight--;

    return route.fulfill({
      status: 200,
      headers: cors,
      json: { status: "success", idPatient, name: patientName(idPatient) },
    });
  });

  await loginWithAuth(page, mockApi, {
    getnameType: undefined,
    proxy: false,
    nameUrl: `${NAME_SERVICE}/patient/{idPatient}`,
    multipleNameUrl: undefined,
  });

  await page.goto("/priorizacao/pacientes/cards");
  await page.getByRole("main").getByRole("button", { name: "search" }).click();

  await expect(page.getByText(patientName(PATIENT_IDS[0]))).toBeVisible();
  // the cards are paged, so only names on the first page are checked; the
  // names of the whole list are requested anyway
  await expect(page.getByText(patientName(RATE_LIMITED_ID))).toBeVisible({
    timeout: 15000,
  });

  // every patient was asked for, never more than the limit at once
  await expect
    .poll(() => [...requestTimes.keys()].sort((a, b) => a - b))
    .toEqual(PATIENT_IDS);
  expect(maxInFlight).toBeGreaterThan(1);
  expect(maxInFlight).toBeLessThanOrEqual(MAX_IN_FLIGHT);

  // the rate-limited patient was asked again once, after Retry-After
  const [first, retry, ...more] = requestTimes.get(RATE_LIMITED_ID)!;
  expect(more).toEqual([]);
  expect(retry - first).toBeGreaterThanOrEqual(
    RETRY_AFTER_SECONDS * 1000 - 100,
  );
});
