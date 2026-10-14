import { test, expect } from "../support/mockApi";
import { loginWithFeatures } from "../support/featureLogin";

/**
 * Exams and culture card of the infection control page
 * (src/features/infectionControl/InfectionControlExams).
 *
 * It is the card of the screening, for the latest prescription of the
 * admission. The exams come with the antimicrobial timeline; the cultures
 * come from GET /prescriptions/:id/cultures only when the culture tab is
 * opened.
 */

const ADMISSION = 9200;
const PATIENT_ID = 4320;
const PAGE_URL = `/controle-infeccao/${ADMISSION}`;
const TIMELINE =
  "GET /infection-control/antimicrobial-timeline/:admissionNumber";

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
    expect(mockApi.requests.some((r) => r.path.endsWith("/cultures"))).toBe(
      false,
    );

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

  test("flags a resistant drug in use on the culture tab", async ({
    page,
    mockApi,
  }) => {
    mockApi.override(TIMELINE, { json: timeline("199") });
    mockApi.override("GET /prescriptions/:id/cultures", {
      json: {
        status: "success",
        data: [
          {
            drug: "OXACILINA",
            prescribed: true,
            atbLevel: 1,
            items: [
              {
                key: "SANGUE TOTAL#MICROORGANISMO TESTE#OXACILINA",
                idExamItem: 900001,
                microorganism: "Microorganismo Teste",
                material: "Sangue Total",
                result: "Resistente",
                resultType: "R",
                resultDetail: null,
                prediction: null,
                predictionType: null,
                probability: null,
                collectionDate: "2024-03-01T12:17:03",
                releaseDate: "2024-03-08T07:17:02",
              },
            ],
          },
        ],
      },
    });

    await page.goto(PAGE_URL);

    // the cultures wait for their tab
    await expect(card(page).getByText("Cultura", { exact: true })).toBeVisible({
      timeout: 15000,
    });
    expect(mockApi.requests.some((r) => r.path.endsWith("/cultures"))).toBe(
      false,
    );
    await expect(card(page).locator(".culture-tab-alert")).toHaveCount(0);

    const culturesRequest = page.waitForRequest((r) =>
      r.url().includes("/prescriptions/199/cultures"),
    );
    await card(page).getByText("Cultura", { exact: true }).click();
    await culturesRequest;
    await expect(
      card(page).locator(".culture-item.culture-row-resistantInUse"),
    ).toHaveCount(1);
    // the screening reads the count from the prescription; here it comes
    // from the cultures, once the tab has loaded them
    await expect(card(page).locator(".culture-tab-alert")).toBeVisible();

    // the full report, for the patient on the page
    mockApi.override("GET /reports/culture", {
      json: { status: "success", data: [] },
    });
    const reportRequest = page.waitForRequest(
      (r) =>
        r.url().includes("/reports/culture") &&
        new URL(r.url()).searchParams.get("idPatient") === `${PATIENT_ID}`,
    );
    await card(page).getByRole("button", { name: "Ver todos" }).click();
    await reportRequest;
    const report = page.getByRole("dialog");
    await expect(
      report.getByRole("heading", { name: "Relatório: Culturas" }),
    ).toBeVisible();
    // the patient is named on the printed report only
    await expect(report).toContainText("Ciclano de Tal");
    await expect(report).toContainText("10/05/1980");
  });
});
