import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";

/**
 * The prescription dates filter keeps agg prescriptions having at least one
 * inner prescription date at or after the point in time on the control.
 *
 * The clock is frozen at local noon of the current day so the "two hours ago"
 * and "in two hours" prescriptions below always land on the same day, whatever
 * the timezone of the machine running the suite.
 */
const FIXED_NOW = (() => {
  const noon = new Date();
  noon.setHours(12, 0, 0, 0);

  return noon;
})();

const shiftHours = (hours: number) =>
  new Date(FIXED_NOW.getTime() + hours * 60 * 60 * 1000);

const pad = (value: number) => `${value}`.padStart(2, "0");

// the backend sends naive (timezone-less) local timestamps
const naive = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;

const prescription = (
  idPrescription: number,
  idPatient: number,
  admissionNumber: number,
  prescriptionDates: string[],
) => ({
  idPrescription,
  admissionNumber,
  idPatient,
  namePatient: `Paciente ${idPatient}`,
  birthdate: "1980-05-10T00:00:00",
  gender: "M",
  weight: 70,
  height: 170,
  date: naive(shiftHours(-2)),
  expire: naive(shiftHours(22)),
  admissionDate: naive(shiftHours(-24 * 5)),
  dischargeDate: null,
  dischargeReason: null,
  status: "0",
  agg: true,
  concilia: null,
  daysAgo: 5,
  lengthStay: 5,
  globalScore: 12,
  prescriptionScore: 8,
  patientScore: 4,
  scoreVariation: null,
  mdrd: null,
  tgo: null,
  tgp: null,
  alerts: 2,
  alertExams: 1,
  alertStats: {},
  am: 1,
  av: 2,
  controlled: 0,
  np: 3,
  tube: 0,
  diff: 1,
  interventions: 0,
  complication: 0,
  department: "UTI ADULTO",
  bed: "L101",
  insurance: "SUS",
  observation: null,
  patientTags: [],
  reviewType: 0,
  isBeingEvaluated: false,
  class: "yellow",
  features: null,
  prescriptionDates,
  prescriptionDatesTruncated: false,
});

const UPCOMING = "Paciente 99";
const PAST = "Paciente 98";

test.beforeEach(async ({ page, mockApi }) => {
  await page.clock.setFixedTime(FIXED_NOW);

  mockApi.override("GET /prescriptions", {
    json: {
      status: "success",
      data: [
        prescription(199, 99, 9999, [naive(shiftHours(2))]),
        prescription(198, 98, 8888, [naive(shiftHours(-2))]),
      ],
    },
  });
  mockApi.override("POST /names", {
    json: [
      { status: "success", idPatient: 99, name: UPCOMING },
      { status: "success", idPatient: 98, name: PAST },
    ],
  });
});

const search = async (page: Page) => {
  await page.goto("/priorizacao/pacientes/cards");
  await page.getByRole("main").getByRole("button", { name: "search" }).click();
};

const datesFilter = (page: Page) =>
  page.locator(".filters-item", { hasText: "Prescrições:" });

test("starts from the current point in time, hiding past prescriptions", async ({
  page,
}) => {
  await search(page);

  await expect(page.getByText(UPCOMING)).toBeVisible();
  await expect(page.getByText(PAST)).toBeHidden();
});

test("clearing the date brings every prescription back", async ({ page }) => {
  await search(page);
  await expect(page.getByText(UPCOMING)).toBeVisible();

  const filter = datesFilter(page);
  await filter.locator(".ant-picker").hover();
  await filter.locator(".ant-picker-clear").click();

  await expect(page.getByText(UPCOMING)).toBeVisible();
  await expect(page.getByText(PAST)).toBeVisible();
  await expect(filter.getByPlaceholder("Todas as prescrições")).toBeVisible();
});

test("dragging the time slider back includes earlier prescriptions", async ({
  page,
}) => {
  await search(page);
  await expect(page.getByText(PAST)).toBeHidden();

  const filter = datesFilter(page);
  await filter.locator(".ant-slider-handle").click();
  await filter.locator(".ant-slider-handle").press("Home");

  await expect(filter.getByText("00:00")).toBeVisible();
  await expect(page.getByText(UPCOMING)).toBeVisible();
  await expect(page.getByText(PAST)).toBeVisible();
});

test("moving to the next day hides prescriptions of the current day", async ({
  page,
}) => {
  await search(page);
  await expect(page.getByText(UPCOMING)).toBeVisible();

  const tomorrow = shiftHours(24);
  const filter = datesFilter(page);
  await filter.locator(".ant-picker input").fill(
    `${pad(tomorrow.getDate())}/${pad(
      tomorrow.getMonth() + 1,
    )}/${tomorrow.getFullYear()}`,
  );
  await filter.locator(".ant-picker input").press("Enter");

  await expect(page.getByText(UPCOMING)).toBeHidden();
  await expect(page.getByText(PAST)).toBeHidden();
  // changing the day keeps the time of day the user had chosen
  await expect(filter.getByText("12:00")).toBeVisible();
});
