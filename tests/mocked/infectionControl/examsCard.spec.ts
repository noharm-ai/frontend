import { test, expect } from "../support/mockApi";
import { loginWithFeatures } from "../support/featureLogin";

/**
 * Exams card of the infection control page
 * (src/features/infectionControl/InfectionControlExams).
 *
 * It is the card of the screening, for the latest prescription of the
 * admission, with the exams that come with the antimicrobial timeline. Its
 * culture tab is left out: the page shows the cultures by drug in the culture
 * section (recentCultures.spec.ts).
 */

const ADMISSION = 9200;
const PATIENT_ID = 4320;
const PAGE_URL = `/controle-infeccao/${ADMISSION}`;
const TIMELINE =
  "GET /infection-control/antimicrobial-timeline/:admissionNumber";

// the request of the cultures by drug; the page's recent cultures
// (/infection-control/admission/:n/cultures) load on their own
const isPrescriptionCultures = (r: { path: string }) =>
  /\/prescriptions\/[^/]+\/cultures$/.test(r.path);

/** A naive ISO date some hours away from now, as the backend sends it */
const hoursFromNow = (hours: number) =>
  new Date(Date.now() + hours * 60 * 60 * 1000).toISOString().slice(0, 19);

const EXAMS = [
  {
    key: "cr",
    value: {
      value: 1.8,
      unit: "mg/dL",
      alert: true,
      date: hoursFromNow(-5),
      ref: "0,6 a 1,2 mg/dL",
      initials: "Cr",
      name: "Creatinina",
      delta: 20,
    },
  },
  {
    key: "pcr",
    value: {
      value: 3,
      unit: "mg/L",
      alert: false,
      date: hoursFromNow(-5),
      ref: null,
      initials: "PCR",
      name: "Proteína C reativa",
      delta: null,
    },
  },
];

const timeline = (idPrescription: string | null) => ({
  status: "success",
  data: {
    now: hoursFromNow(0),
    patient: {
      idPatient: `${PATIENT_ID}`,
      admissionNumber: ADMISSION,
      admissionDate: hoursFromNow(-240),
      dischargeDate: null,
      dischargeReason: null,
      birthdate: "1980-05-10T00:00:00",
      gender: "M",
      weight: 82,
      weightDate: hoursFromNow(-240),
      height: 178,
      idPrescription,
      bed: "12A",
      record: null,
      department: "UTI Adulto",
      segment: "Segmento Adulto",
      idSegment: 3,
    },
    courses: [],
    // the backend sends no exam without a prescription
    exams: idPrescription ? EXAMS : [],
    alertExams: idPrescription ? 1 : 0,
    followUp: { enabled: false, admissionNumber: ADMISSION },
  },
});

const card = (page: import("@playwright/test").Page) =>
  page.locator('[data-kb="infectionControl.exams"]');

test.beforeEach(({ mockApi }) => {
  mockApi.override("GET /names/:idPatient", {
    json: { status: "success", idPatient: PATIENT_ID, name: "Ciclano de Tal" },
  });
});

test.describe("without the culture feature", () => {
  test("shows the exams of the latest prescription", async ({
    page,
    mockApi,
  }) => {
    mockApi.override(TIMELINE, { json: timeline("199") });

    await page.goto(PAGE_URL);

    await expect(card(page).getByText("Cr", { exact: true })).toBeVisible({
      timeout: 15000,
    });
    await expect(card(page).getByText("PCR", { exact: true })).toBeVisible();
    // the exams out of range, as the screening card counts them
    await expect(card(page).locator(".footer .stats")).toHaveText("1");
    // the cultures are behind a feature the schema does not have
    expect(mockApi.requests.some(isPrescriptionCultures)).toBe(false);

    // "Ver todos" opens every exam of the admission
    const examsRequest = page.waitForRequest((r) =>
      r.url().includes(`/exams/${ADMISSION}`),
    );
    await card(page).getByRole("button", { name: "Ver todos" }).click();
    await examsRequest;
    await expect(
      page.getByRole("tab", { name: "Exames numéricos" }),
    ).toBeVisible();
  });

  test("has no card when the admission has no prescription", async ({
    page,
    mockApi,
  }) => {
    mockApi.override(TIMELINE, { json: timeline(null) });

    await page.goto(PAGE_URL);

    await expect(page.getByText("82 kg")).toBeVisible({ timeout: 15000 });
    await expect(card(page)).toHaveCount(0);
  });
});

test.describe("with the culture feature", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page, mockApi }) => {
    await loginWithFeatures(page, mockApi, ["CULTURE"]);
  });

  test("keeps to the exams: the cultures have their own section", async ({
    page,
    mockApi,
  }) => {
    mockApi.override(TIMELINE, { json: timeline("199") });

    await page.goto(PAGE_URL);

    await expect(card(page).getByText("Cr", { exact: true })).toBeVisible({
      timeout: 15000,
    });
    // no tab bar: the card is titled by the exams alone
    await expect(card(page).locator(".ant-segmented")).toHaveCount(0);
    await expect(card(page).getByText("Cultura", { exact: true })).toHaveCount(
      0,
    );
    // the cultures by drug are in the cultures section, out of the card
    await expect(card(page).getByTestId("cultures-by-drug")).toHaveCount(0);
    await expect(page.getByTestId("cultures-by-drug")).toBeVisible();
    expect(mockApi.requests.some(isPrescriptionCultures)).toBe(true);
  });
});
