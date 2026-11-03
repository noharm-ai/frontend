import { test, expect } from "../support/mockApi";

/**
 * Exams on the antimicrobial timeline of the infection control page
 * (src/features/infectionControl/CourseGantt/ExamRows).
 *
 * On opening, the timeline plots some exams under the courses, a row each on
 * the same days: CRP, CKD-EPI (or CKD-EPI 2021, where configured instead) and
 * leukocytes. They are picked by their NoHarm identifier (tpexame_ref of the
 * segment exams), not by the tpexame of the schema, from the history "Ver
 * todos" shows. "+" adds any other exam of it, and each row can be taken out.
 */

const ADMISSION = 9300;
const PATIENT_ID = 4330;
const PAGE_URL = `/controle-infeccao/${ADMISSION}`;
const TIMELINE =
  "GET /infection-control/antimicrobial-timeline/:admissionNumber";
const EXAMS_HISTORY = "GET /exams/:admissionNumber";

/** A naive ISO date some hours away from now, as the backend sends it */
const hoursFromNow = (hours: number) =>
  new Date(Date.now() + hours * 60 * 60 * 1000).toISOString().slice(0, 19);

const MEROPENEM = {
  idDrug: 11,
  drug: "MEROPENEM 1 g SOL INJ",
  substance: null,
  atbLevel: null,
  cpoe: false,
  status: "active",
  start: hoursFromNow(-48),
  end: hoursFromNow(24),
  days: 3,
  plannedEnd: null,
  plannedDays: null,
  lastIdPrescription: "199",
  prescriptionCount: 2,
  gaps: [],
  regimens: [],
};

const timeline = (
  idPrescription: string | null,
  courses: Record<string, unknown>[] = [MEROPENEM],
) => ({
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
    courses,
    exams: [],
    alertExams: 0,
    followUp: { enabled: false, admissionNumber: ADMISSION },
  },
});

/** An exam of the history, keyed by the tpexame of the schema */
const exam = (
  tpExamRef: string | null,
  name: string,
  unit: string,
  reference: [number, number],
  // [value, hours from now], newest first
  results: [number, number][],
) => ({
  value: results[0][0],
  unit,
  name,
  initials: name,
  configured: true,
  text: false,
  tp_exam_ref: tpExamRef,
  history: results.map(([value, hours]) => ({
    value,
    unit,
    date: hoursFromNow(hours),
    min: reference[0],
    max: reference[1],
    configured: true,
    manual: false,
  })),
});

const history = (data: Record<string, unknown>) => ({
  status: "success",
  data,
});

const CRP = exam(
  "pcru",
  "PCR ultrassensível",
  "mg/L",
  [0, 5],
  [
    [12, -5],
    [8, -30],
    // twenty days before the course: older than the timeline reaches back
    [2, -480],
  ],
);
const CKD = exam(
  "ckd",
  "CKD-EPI",
  "mL/min",
  [60, 120],
  [
    [55, -5],
    [70, -72],
  ],
);
const CKD21 = exam("ckd21", "CKD-EPI 2021", "mL/min", [60, 120], [[58, -5]]);
const LEUKOCYTES = exam(
  "h_conleuc",
  "Leucócitos",
  "/mm³",
  [4000, 10000],
  [
    [14000, -5],
    [9000, -50],
  ],
);
const CREATININE = exam("cr", "Creatinina", "mg/dL", [0.6, 1.2], [[1.8, -5]]);

const antimicrobialTimeline = (page: import("@playwright/test").Page) =>
  page.locator('[data-kb="infectionControl.antimicrobials.timeline"]');

const examRows = (page: import("@playwright/test").Page) =>
  antimicrobialTimeline(page).getByTestId("exam-timeline-row");

test.beforeEach(({ mockApi }) => {
  mockApi.override("GET /names/:idPatient", {
    json: { status: "success", idPatient: PATIENT_ID, name: "Ciclano de Tal" },
  });
});

test("plots CRP, CKD-EPI and leukocytes under the courses on opening", async ({
  page,
  mockApi,
}) => {
  mockApi.override(TIMELINE, { json: timeline("199") });
  mockApi.override(EXAMS_HISTORY, {
    json: history({
      // the schema names its types its own way: the identifier picks them
      pcr_s: CRP,
      // a second type mapped to the CRP: on the same row
      pcr_lab2: exam("pcru", "PCR (lab 2)", "mg/L", [0, 5], [[4, -40]]),
      creat: CREATININE,
      ckd: CKD,
      ckd21: CKD21,
      leuco: LEUKOCYTES,
      laudo: { name: "Laudo", text: true, history: [] },
    }),
  });

  // with the references of the segment of the timeline
  const historyRequest = page.waitForRequest(
    (r) =>
      r.url().includes(`/exams/${ADMISSION}`) &&
      r.url().includes("idSegment=3"),
  );
  await page.goto(PAGE_URL);
  await historyRequest;

  await expect(
    antimicrobialTimeline(page).getByTestId("course-row"),
  ).toHaveCount(1, { timeout: 15000 });
  // in this order, CKD-EPI rather than CKD-EPI 2021, no creatinine
  await expect(examRows(page)).toHaveCount(3);
  await expect(examRows(page).nth(0)).toContainText("PCR ultrassensível");
  await expect(examRows(page).nth(1)).toContainText("CKD-EPI");
  await expect(examRows(page).nth(1)).not.toContainText("2021");
  await expect(examRows(page).nth(2)).toContainText("Leucócitos");

  // both CRP types, without the result older than the timeline reaches back
  const crp = examRows(page).nth(0);
  await expect(crp.getByTestId("exam-point")).toHaveCount(3);
  await expect(crp.locator(".exam-point.alert")).toHaveCount(2);
  await expect(crp).toContainText("ref. 0 a 5");
  await expect(crp.getByTestId("exam-reference")).toHaveCount(1);

  // exams are added on the timeline, not picked in the card
  await expect(
    page.locator('[data-kb="infectionControl.exams"] [role="button"]'),
  ).toHaveCount(0);

  // the legend of the timeline tells what the marks of an exam are
  await antimicrobialTimeline(page)
    .getByRole("button", { name: "Legenda" })
    .click();
  const legend = page.locator(
    '[data-kb="infectionControl.antimicrobials.legend"]',
  );
  await expect(legend).toContainText("faixa de referência");
  await expect(legend).toContainText("dentro da referência");
  await expect(legend).toContainText("fora da referência");
  // only there, not on the header of the exams
  await expect(
    antimicrobialTimeline(page).getByText("faixa de referência"),
  ).toHaveCount(0);
});

test("plots CKD-EPI 2021 where CKD-EPI is not configured", async ({
  page,
  mockApi,
}) => {
  mockApi.override(TIMELINE, { json: timeline("199") });
  mockApi.override(EXAMS_HISTORY, {
    json: history({ ckd21: CKD21, leuco: LEUKOCYTES }),
  });

  await page.goto(PAGE_URL);

  await expect(examRows(page)).toHaveCount(2, { timeout: 15000 });
  await expect(examRows(page).nth(0)).toContainText("CKD-EPI 2021");
  await expect(examRows(page).nth(1)).toContainText("Leucócitos");
});

test("adds any exam of the history with + and takes them out", async ({
  page,
  mockApi,
}) => {
  mockApi.override(TIMELINE, { json: timeline("199") });
  mockApi.override(EXAMS_HISTORY, {
    json: history({
      pcr_s: CRP,
      creat: CREATININE,
      leuco: LEUKOCYTES,
      // a type the segment maps to no identifier: offered by its own
      lactato: exam(null, "Lactato", "mmol/L", [0.5, 2], [[3.1, -10]]),
      laudo: { name: "Laudo", text: true, history: [] },
    }),
  });

  await page.goto(PAGE_URL);
  await expect(examRows(page)).toHaveCount(2, { timeout: 15000 });

  const add = antimicrobialTimeline(page).getByRole("button", {
    name: "Adicionar exame",
  });
  await add.click();
  const picker = page.getByTestId("exam-timeline-picker");
  await expect(picker).toBeVisible();
  // the exams not on the timeline yet, by name; no textual exam
  const options = page.locator(".ant-select-item-option");
  await expect(options).toHaveText(["Creatinina", "Lactato"]);

  await page.keyboard.type("lact");
  await expect(options).toHaveText(["Lactato"]);
  await page.keyboard.press("Enter");

  // at the end, with its points
  await expect(examRows(page)).toHaveCount(3);
  await expect(examRows(page).nth(2)).toContainText("Lactato");
  await expect(examRows(page).nth(2).getByTestId("exam-point")).toHaveCount(1);

  await add.click();
  await expect(options).toHaveText(["Creatinina"]);
  await options.nth(0).click();
  await expect(examRows(page)).toHaveCount(4);
  await expect(examRows(page).nth(3)).toContainText("Creatinina");

  // every exam on the timeline: nothing left to add
  await expect(add).toHaveCount(0);

  // a default one taken out can be added back
  await examRows(page)
    .nth(0)
    .getByRole("button", {
      name: "Remover PCR ultrassensível da linha do tempo",
    })
    .click();
  await expect(examRows(page)).toHaveCount(3);
  await expect(examRows(page).nth(0)).toContainText("Leucócitos");
  await add.click();
  await expect(options).toHaveText(["PCR ultrassensível"]);
});

test("offers + when the patient has none of the default exams", async ({
  page,
  mockApi,
}) => {
  mockApi.override(TIMELINE, { json: timeline("199") });
  mockApi.override(EXAMS_HISTORY, {
    json: history({
      creat: CREATININE,
      // a type the segment does not map to the identifier
      pcr_s: { ...CRP, tp_exam_ref: null },
    }),
  });

  await page.goto(PAGE_URL);

  await expect(page.getByTestId("exam-timeline-group")).toBeVisible({
    timeout: 15000,
  });
  await expect(examRows(page)).toHaveCount(0);

  await antimicrobialTimeline(page)
    .getByRole("button", { name: "Adicionar exame" })
    .click();
  await page
    .locator(".ant-select-item-option", { hasText: "Creatinina" })
    .click();
  await expect(examRows(page)).toHaveCount(1);
});

test("shows no exams group when the history has no numeric exam", async ({
  page,
  mockApi,
}) => {
  mockApi.override(TIMELINE, { json: timeline("199") });
  mockApi.override(EXAMS_HISTORY, {
    json: history({ laudo: { name: "Laudo", text: true, history: [] } }),
  });

  await page.goto(PAGE_URL);

  await expect(
    antimicrobialTimeline(page).getByTestId("course-row"),
  ).toHaveCount(1, { timeout: 15000 });
  await expect
    .poll(() => mockApi.requests.some((r) => r.path === `/exams/${ADMISSION}`))
    .toBe(true);
  await expect(page.getByTestId("exam-timeline-group")).toHaveCount(0);
});

test("retries the exam history when it fails to load", async ({
  page,
  mockApi,
}) => {
  mockApi.override(TIMELINE, { json: timeline("199") });
  mockApi.override(EXAMS_HISTORY, {
    status: 500,
    json: { status: "error", message: "erro" },
  });

  await page.goto(PAGE_URL);

  const error = antimicrobialTimeline(page).getByTestId("exam-timeline-error");
  await expect(error).toBeVisible({ timeout: 15000 });
  // the courses are there all the same
  await expect(
    antimicrobialTimeline(page).getByTestId("course-row"),
  ).toHaveCount(1);

  mockApi.override(EXAMS_HISTORY, { json: history({ pcr_s: CRP }) });
  await error.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(examRows(page)).toHaveCount(1);
  await expect(error).toHaveCount(0);
});

test("keeps the empty timeline when there is no course", async ({
  page,
  mockApi,
}) => {
  mockApi.override(TIMELINE, { json: timeline("199", []) });
  mockApi.override(EXAMS_HISTORY, { json: history({ pcr_s: CRP }) });

  await page.goto(PAGE_URL);

  await expect(
    page.getByText("Nenhum antimicrobiano prescrito neste atendimento."),
  ).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId("exam-timeline-row")).toHaveCount(0);
});

test("loads no history without a prescription", async ({ page, mockApi }) => {
  mockApi.override(TIMELINE, { json: timeline(null) });

  await page.goto(PAGE_URL);

  await expect(
    antimicrobialTimeline(page).getByTestId("course-row"),
  ).toHaveCount(1, { timeout: 15000 });
  await expect(page.getByText("82 kg")).toBeVisible();
  expect(mockApi.requests.some((r) => r.path === `/exams/${ADMISSION}`)).toBe(
    false,
  );
  await expect(page.getByTestId("exam-timeline-group")).toHaveCount(0);
});
