import type { Page, Route } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";
import { loginWithAuth } from "../support/featureLogin";

/**
 * Without a batch name endpoint (no multipleNameUrl) every patient name is one
 * GET. The prioritization list resolves its names a few at a time instead of
 * firing them all at once, and stops on a 429 instead of hammering a rate
 * limited name service.
 */

const CAP = 6;
const PATIENTS = 30;
// far from the ids of the default fixtures, which the landing page resolves
const FIRST_ID = 5001;
const ids = Array.from({ length: PATIENTS }, (_, i) => FIRST_ID + i);

const base = loadFixture<{ data: Record<string, unknown>[] }>(
  "prescriptions/list.json",
).data[0];

const prescriptions = [
  ...ids.map((idPatient, i) => ({
    ...base,
    idPrescription: 7001 + i,
    admissionNumber: 8001 + i,
    idPatient,
    namePatient: `Paciente ${idPatient}`,
  })),
  // a second prescription of the first patient: still one name request
  {
    ...base,
    idPrescription: 7999,
    admissionNumber: 8999,
    idPatient: FIRST_ID,
    namePatient: `Paciente ${FIRST_ID}`,
  },
];

const idOf = (route: Route) => Number(route.request().url().split("/").pop());

const nameRequests = (mockApi: MockApi) =>
  mockApi.requests
    .filter((r) => r.method === "GET" && /^\/names\/\d+$/.test(r.path))
    .map((r) => Number(r.path.split("/").pop()))
    .filter((id) => id >= FIRST_ID && id < FIRST_ID + PATIENTS);

/** Answers each name after a delay, recording the most requests in flight. */
const slowNames = (answer: (route: Route) => Promise<void>) => {
  const stats = { inFlight: 0, max: 0 };
  const handler = async (route: Route) => {
    if (idOf(route) < FIRST_ID) {
      await route.fulfill({
        json: {
          status: "success",
          idPatient: idOf(route),
          name: "Maria Teste",
        },
      });
      return;
    }

    stats.inFlight++;
    stats.max = Math.max(stats.max, stats.inFlight);
    await new Promise((resolve) => setTimeout(resolve, 150));
    stats.inFlight--;
    await answer(route);
  };
  return { stats, handler };
};

const openList = async (page: Page, mockApi: MockApi) => {
  await loginWithAuth(page, mockApi, { multipleNameUrl: undefined });
  mockApi.override("GET /prescriptions", {
    json: { status: "success", data: prescriptions },
  });
  await page.goto("/priorizacao/pacientes/cards");
  await page.getByRole("main").getByRole("button", { name: "search" }).click();
};

test.use({ storageState: { cookies: [], origins: [] } });

test("resolves the names a few at a time", async ({ page, mockApi }) => {
  const { stats, handler } = slowNames((route) =>
    route.fulfill({
      json: {
        status: "success",
        idPatient: idOf(route),
        name: `Fulano Teste ${idOf(route)}`,
      },
    }),
  );
  mockApi.override("GET /names/:idPatient", handler);

  await openList(page, mockApi);

  // the list is paged: the last patients are not on the first page
  await expect(page.getByText(`Fulano Teste ${FIRST_ID + 10}`)).toBeVisible({
    timeout: 15000,
  });
  await expect.poll(() => new Set(nameRequests(mockApi)).size).toBe(PATIENTS);
  await expect.poll(() => stats.inFlight).toBe(0);

  expect(stats.max).toBeGreaterThan(1);
  expect(stats.max).toBeLessThanOrEqual(CAP);
  // one request per patient, even for a patient listed twice
  expect(nameRequests(mockApi)).toHaveLength(PATIENTS);
});

test("stops requesting names once rate limited", async ({ page, mockApi }) => {
  const { stats, handler } = slowNames((route) =>
    route.fulfill({
      status: 429,
      json: { status: "error", message: "too many requests" },
    }),
  );
  mockApi.override("GET /names/:idPatient", handler);

  await openList(page, mockApi);

  await expect(page.getByText(`Paciente ${FIRST_ID}`).first()).toBeVisible({
    timeout: 15000,
  });
  await expect.poll(() => nameRequests(mockApi).length).toBeGreaterThan(0);
  await expect.poll(() => stats.inFlight).toBe(0);
  // give a further wave the time to show up
  await page.waitForTimeout(500);

  expect(nameRequests(mockApi).length).toBeLessThanOrEqual(CAP);
  expect(stats.max).toBeLessThanOrEqual(CAP);
  // the patients never requested are not left loading
  await expect(page.getByText(`Paciente ${FIRST_ID + 10}`)).toBeVisible();
});
