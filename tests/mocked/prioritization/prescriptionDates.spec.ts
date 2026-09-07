import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import { openSelect, pickOption } from "../support/antd";
import { loginWithFeatures } from "../support/featureLogin";

/**
 * The prescription dates filter keeps agg prescriptions having at least one
 * inner prescription date at or after the point in time on the control. It is
 * only available while prioritizing by next prescription: picking that
 * prioritization turns it on from the current point in time, any other one
 * turns it off.
 *
 * The whole thing is behind the per-user PRIORITIZATION_PRESCRIPTION_DATES
 * feature while it is tested with a few users, so every test logs in with an
 * explicit feature list instead of the shared storage state.
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
  globalScore = 12,
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
  globalScore,
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
const FEATURE = "PRIORITIZATION_PRESCRIPTION_DATES";

test.use({ storageState: { cookies: [], origins: [] } });

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

const openPrioritizationSelect = (page: Page) =>
  openSelect(page.locator(".prioritization-select"));

const dropdownOptions = (page: Page) =>
  page
    .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
    .locator(".ant-select-item-option");

const datesFilter = (page: Page) => page.locator(".prescription-dates-filter");

// the prioritization select is long enough to be virtualized: only the
// options around the current scroll position exist in the DOM, so the list is
// paged through until the wanted one shows up
// scrolls the (virtualized) prioritization dropdown until the option is in
// the DOM, or the whole list has been paged through
const scrollToOption = async (page: Page, label: string) => {
  const holder = page.locator(
    ".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-dropdown-list-holder",
  );
  await holder.evaluate((el) => (el.scrollTop = 0));

  for (let i = 0; i < 10; i++) {
    if (await dropdownOptions(page).filter({ hasText: label }).count()) {
      return;
    }
    await holder.evaluate((el) => (el.scrollTop += el.clientHeight));
  }
};

const prioritizeBy = async (page: Page, label: string) => {
  await openPrioritizationSelect(page);
  await scrollToOption(page, label);
  await pickOption(page, label);
};

test("the prioritization is hidden from users without the feature", async ({
  page,
  mockApi,
}) => {
  await loginWithFeatures(page, mockApi, []);
  await search(page);

  await expect(page.getByText(UPCOMING)).toBeVisible();
  await expect(page.getByText(PAST)).toBeVisible();

  await openPrioritizationSelect(page);
  await scrollToOption(page, "Próxima prescrição");
  await expect(dropdownOptions(page).first()).toBeVisible();
  await expect(
    dropdownOptions(page).filter({ hasText: "Próxima prescrição" }),
  ).toHaveCount(0);
});

test("the dates tab lists the inner prescription times grouped by day", async ({
  page,
  mockApi,
}) => {
  const tomorrow = shiftHours(24);
  mockApi.override("GET /prescriptions", {
    json: {
      status: "success",
      data: [
        prescription(199, 99, 9999, [
          naive(shiftHours(-2)),
          naive(shiftHours(2)),
          naive(tomorrow),
        ]),
      ],
    },
  });
  mockApi.override("POST /names", {
    json: [{ status: "success", idPatient: 99, name: UPCOMING }],
  });

  await loginWithFeatures(page, mockApi, [FEATURE]);
  await search(page);

  // the card is a styled anchor
  const card = page.getByRole("link").filter({ hasText: UPCOMING });
  await card.locator(".tab-prescription-dates").click();

  const day = (d: Date) =>
    `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  const today = card.locator(".prescription-dates-day", {
    hasText: day(FIXED_NOW),
  });
  await expect(today.locator(".ant-tag")).toHaveText(["10:00", "14:00"]);
  await expect(today.locator(".ant-tag.past")).toHaveText("10:00");
  await expect(
    card
      .locator(".prescription-dates-day", { hasText: day(tomorrow) })
      .locator(".ant-tag"),
  ).toHaveText("12:00");
});

test("the dates tab is not offered to users without the feature", async ({
  page,
  mockApi,
}) => {
  await loginWithFeatures(page, mockApi, []);
  await search(page);

  await expect(page.getByText(UPCOMING)).toBeVisible();
  await expect(page.locator(".tab-prescription-dates")).toHaveCount(0);
});

test("picking a prioritization applies its default order", async ({
  page,
  mockApi,
}) => {
  const soon = naive(shiftHours(2));
  const later = naive(shiftHours(4));
  mockApi.override("GET /prescriptions", {
    json: {
      status: "success",
      data: [
        prescription(197, 97, 7777, [later], 30),
        prescription(196, 96, 6666, [soon], 5),
        prescription(195, 95, 5555, [soon], 20),
      ],
    },
  });
  mockApi.override("POST /names", {
    json: [
      { status: "success", idPatient: 97, name: "Paciente 97" },
      { status: "success", idPatient: 96, name: "Paciente 96" },
      { status: "success", idPatient: 95, name: "Paciente 95" },
    ],
  });

  await loginWithFeatures(page, mockApi, [FEATURE]);
  await search(page);
  // global score, desc: the highest score leads
  await expect(page.getByRole("link").first()).toContainText("Paciente 97");

  await prioritizeBy(page, "Próxima prescrição");

  await expect(page.locator(".gtm-btn-change-order")).toHaveClass(/order-asc/);
  // soonest first; same instant -> higher global score first
  await expect(page.getByRole("link")).toContainText([
    "Paciente 95",
    "Paciente 96",
    "Paciente 97",
  ]);

  // back to global score: desc again, whatever the order was
  await prioritizeBy(page, "Escore global");

  await expect(page.locator(".gtm-btn-change-order")).toHaveClass(/order-desc/);
  await expect(page.getByRole("link")).toContainText([
    "Paciente 97",
    "Paciente 95",
    "Paciente 96",
  ]);
});

test("is off until the user prioritizes by next prescription", async ({
  page,
  mockApi,
}) => {
  await loginWithFeatures(page, mockApi, [FEATURE]);
  await search(page);

  await expect(page.getByText(UPCOMING)).toBeVisible();
  await expect(page.getByText(PAST)).toBeVisible();
  await expect(datesFilter(page)).toBeHidden();
});

test("prioritizing by next prescription starts from the current point in time, hiding past prescriptions", async ({
  page,
  mockApi,
}) => {
  await loginWithFeatures(page, mockApi, [FEATURE]);
  await search(page);
  await prioritizeBy(page, "Próxima prescrição");

  await expect(datesFilter(page)).toBeVisible();
  await expect(page.getByText(UPCOMING)).toBeVisible();
  await expect(page.getByText(PAST)).toBeHidden();
});

test("switching to another prioritization turns the filter off", async ({
  page,
  mockApi,
}) => {
  await loginWithFeatures(page, mockApi, [FEATURE]);
  await search(page);
  await prioritizeBy(page, "Próxima prescrição");
  await expect(page.getByText(PAST)).toBeHidden();

  await prioritizeBy(page, "Escore global");

  await expect(datesFilter(page)).toBeHidden();
  await expect(page.getByText(UPCOMING)).toBeVisible();
  await expect(page.getByText(PAST)).toBeVisible();
});

test("clearing the date brings every prescription back", async ({
  page,
  mockApi,
}) => {
  await loginWithFeatures(page, mockApi, [FEATURE]);
  await search(page);
  await prioritizeBy(page, "Próxima prescrição");
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
  mockApi,
}) => {
  await loginWithFeatures(page, mockApi, [FEATURE]);
  await search(page);
  await prioritizeBy(page, "Próxima prescrição");
  await expect(page.getByText(PAST)).toBeHidden();

  const filter = datesFilter(page);
  await filter.locator(".ant-slider-handle").click();
  await filter.locator(".ant-slider-handle").press("Home");

  await expect(filter.getByText("00:00")).toBeVisible();
  await expect(page.getByText(UPCOMING)).toBeVisible();
  await expect(page.getByText(PAST)).toBeVisible();

  // "next prescription" follows the pointer: seen from midnight, the 10:00
  // prescription of the past card is the next one
  await expect(
    page.getByRole("link").filter({ hasText: PAST }).locator(".stamp-value"),
  ).toContainText("10:00");
});

test("moving to the next day hides prescriptions of the current day", async ({
  page,
  mockApi,
}) => {
  await loginWithFeatures(page, mockApi, [FEATURE]);
  await search(page);
  await prioritizeBy(page, "Próxima prescrição");
  await expect(page.getByText(UPCOMING)).toBeVisible();

  const tomorrow = shiftHours(24);
  const filter = datesFilter(page);
  await filter
    .locator(".ant-picker input")
    .fill(
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
