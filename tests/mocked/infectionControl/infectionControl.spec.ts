import { test, expect } from "../support/mockApi";

/**
 * Infection control (/controle-infeccao/:admissionNumber,
 * src/features/infectionControl).
 *
 * One GET /infection-control/antimicrobial-timeline/:admissionNumber brings the patient and the
 * antimicrobial courses, already grouped by the backend (one per drug, daily
 * prescriptions and CPOE orders alike). The page shows the courses in use now
 * as cards and every course as a row of a timeline.
 */

const ADMISSION = 9200;
const PATIENT_ID = 4320;
const PAGE_URL = `/controle-infeccao/${ADMISSION}`;
const ENDPOINT =
  "GET /infection-control/antimicrobial-timeline/:admissionNumber";

/** A naive ISO date some hours away from now, as the backend sends it */
const hoursFromNow = (hours: number) =>
  new Date(Date.now() + hours * 60 * 60 * 1000).toISOString().slice(0, 19);

const regimen = (start: number, end: number, dose: number) => ({
  start: hoursFromNow(start),
  end: hoursFromNow(end),
  dose,
  measureUnit: "g",
  frequency: "8h/8h",
  route: "IV",
});

const course = (overrides: Record<string, unknown>) => ({
  substance: null,
  atbLevel: null,
  cpoe: false,
  plannedEnd: null,
  plannedDays: null,
  lastIdPrescription: "199",
  prescriptionCount: 1,
  gaps: [],
  ...overrides,
});

const COURSES = [
  // CPOE order renewed with a higher dose, planned for 7 days
  course({
    idDrug: 11,
    drug: "MEROPENEM 1 g SOL INJ",
    atbLevel: 2,
    cpoe: true,
    status: "active",
    start: hoursFromNow(-72),
    end: hoursFromNow(96),
    plannedEnd: hoursFromNow(96),
    plannedDays: 7,
    days: 4,
    prescriptionCount: 2,
    regimens: [regimen(-72, -24, 1), regimen(-24, 96, 2)],
  }),
  // daily prescriber, already past the planned 7 days, with a missing day
  course({
    idDrug: 12,
    drug: "VANCOMICINA 500 mg SOL INJ",
    status: "active",
    start: hoursFromNow(-190),
    end: hoursFromNow(20),
    plannedEnd: hoursFromNow(-22),
    plannedDays: 7,
    days: 8,
    prescriptionCount: 7,
    regimens: [regimen(-190, 20, 1)],
    gaps: [{ start: hoursFromNow(-100), end: hoursFromNow(-76) }],
  }),
  course({
    idDrug: 13,
    drug: "CEFTRIAXONA 1 g SOL INJ",
    status: "suspended",
    start: hoursFromNow(-110),
    end: hoursFromNow(-80),
    days: 2,
    regimens: [regimen(-110, -80, 1)],
  }),
  course({
    idDrug: 14,
    drug: "AZITROMICINA 500 mg CP",
    status: "finished",
    start: hoursFromNow(-200),
    end: hoursFromNow(-130),
    days: 3,
    regimens: [regimen(-200, -130, 0.5)],
  }),
];

const timeline = (courses: unknown[]) => ({
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
      idPrescription: "199",
      bed: "12A",
      record: null,
      department: "UTI Adulto",
      segment: "Segmento Adulto",
    },
    courses,
  },
});

test.beforeEach(({ mockApi }) => {
  mockApi.override("GET /names/:idPatient", {
    json: { status: "success", idPatient: PATIENT_ID, name: "Ciclano de Tal" },
  });
});

test("shows the patient and the admission", async ({ page, mockApi }) => {
  mockApi.override(ENDPOINT, { json: timeline(COURSES) });

  await page.goto(PAGE_URL);

  await expect(
    page.getByRole("heading", { name: "Controle de Infecção" }),
  ).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("Ciclano de Tal")).toBeVisible();
  // patient data first, the admission one tab away
  await expect(page.getByText("82 kg")).toBeVisible();
  await page.getByRole("tab", { name: "Atendimento" }).click();
  await expect(page.getByText("UTI Adulto")).toBeVisible();
  // the header no longer links to the prescription
  await expect(
    page.getByRole("link", { name: "Abrir prescrição", exact: true }),
  ).toHaveCount(0);
});

test("lists every course on the timeline, the ones in use first", async ({
  page,
  mockApi,
}) => {
  mockApi.override(ENDPOINT, { json: timeline(COURSES) });

  await page.goto(PAGE_URL);

  const rows = page.getByTestId("course-row");
  await expect(rows).toHaveCount(4, { timeout: 15000 });
  await expect(rows.nth(0)).toContainText("Em uso");
  await expect(rows.nth(1)).toContainText("Em uso");
  await expect(rows.filter({ hasText: "CEFTRIAXONA" })).toContainText(
    "Suspenso",
  );
  await expect(rows.filter({ hasText: "AZITROMICINA" })).toContainText(
    "Encerrado",
  );
  await expect(rows.filter({ hasText: "MEROPENEM" })).toContainText("D4/7");
  await expect(page.getByText("Hoje", { exact: true })).toBeVisible();

  // a flag marks where each course is meant to end, when that is known
  await expect(
    rows.filter({ hasText: "VANCOMICINA" }).getByTestId("planned-end"),
  ).toHaveCount(1);
  await expect(
    rows.filter({ hasText: "AZITROMICINA" }).getByTestId("planned-end"),
  ).toHaveCount(0);

  // clicking the bar opens the details of the course
  await rows.filter({ hasText: "MEROPENEM" }).getByTestId("course-bar").click();
  const details = page.getByRole("dialog");
  await expect(
    details.getByText("CPOE (prescrição com vigência)"),
  ).toBeVisible();
  await expect(details.getByText("Posologias")).toBeVisible();

  // the footer button (the corner X is labeled "Fechar" too)
  await details.locator("button.ant-btn", { hasText: "Fechar" }).click();
  await expect(details).toHaveCount(0);
});

test("shows a drug prescribed again on the same row as its past course", async ({
  page,
  mockApi,
}) => {
  mockApi.override(ENDPOINT, {
    json: timeline([
      course({
        idDrug: 11,
        drug: "MEROPENEM 1 g SOL INJ",
        status: "finished",
        start: hoursFromNow(-200),
        end: hoursFromNow(-130),
        days: 3,
        regimens: [regimen(-200, -130, 1)],
      }),
      course({
        idDrug: 11,
        drug: "MEROPENEM 1 g SOL INJ",
        status: "active",
        start: hoursFromNow(-48),
        end: hoursFromNow(20),
        days: 2,
        regimens: [regimen(-48, 20, 2)],
      }),
    ]),
  });

  await page.goto(PAGE_URL);

  const rows = page.getByTestId("course-row");
  await expect(rows).toHaveCount(1, { timeout: 15000 });
  // the row is labelled after the course in use
  await expect(rows).toContainText("Em uso");
  await expect(rows).toContainText("D2");
  await expect(rows).toContainText("+1 ciclo anterior");
  await expect(rows.getByTestId("course-bar")).toHaveCount(2);

  // each bar opens its own course
  await rows.getByTestId("course-bar").first().click();
  await expect(page.getByRole("dialog")).toContainText("Encerrado");
});

test("says so when the admission has no antimicrobial", async ({
  page,
  mockApi,
}) => {
  mockApi.override(ENDPOINT, { json: timeline([]) });

  await page.goto(PAGE_URL);

  await expect(
    page.getByText("Nenhum antimicrobiano prescrito neste atendimento."),
  ).toBeVisible({ timeout: 15000 });
});

test("says so when the admission does not exist", async ({ page, mockApi }) => {
  mockApi.override(ENDPOINT, {
    status: 400,
    json: {
      status: "error",
      message: "Registro inválido",
      code: "errors.invalidRecord",
    },
  });

  await page.goto(PAGE_URL);

  await expect(
    page.getByText(
      `Nenhum registro encontrado para o atendimento ${ADMISSION}.`,
    ),
  ).toBeVisible({ timeout: 15000 });
  await expect(
    page.getByRole("button", { name: "Tentar novamente" }),
  ).toHaveCount(0);
});

test("does not call the backend for an invalid admission number", async ({
  page,
  mockApi,
}) => {
  await page.goto("/controle-infeccao/abc");

  await expect(
    page.getByText("Nenhum registro encontrado para o atendimento abc."),
  ).toBeVisible({ timeout: 15000 });
  expect(
    mockApi.requests.filter((r) => r.path.startsWith("/infection-control")),
  ).toHaveLength(0);
});

test("can retry after a server error", async ({ page, mockApi }) => {
  mockApi.override(ENDPOINT, { status: 500, json: { status: "error" } });

  await page.goto(PAGE_URL);

  const retry = page.getByRole("button", { name: "Tentar novamente" });
  await expect(retry).toBeVisible({ timeout: 15000 });

  mockApi.override(ENDPOINT, { json: timeline(COURSES) });
  await retry.click();

  await expect(page.getByTestId("course-row")).toHaveCount(4);
});
