import type { Page, Request } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import { openSelectById, pickOption } from "../support/antd";

/**
 * Infection control report (/relatorios/consolidado/controle-infeccao,
 * src/features/reports/InfectionControlConsolidatedReport).
 *
 * POST /reports/consolidated/infection-control answers the indicators of a
 * period, or, when the request carries `day`, the view of that day. The page
 * asks both when it opens: the period from January 1st to yesterday and the
 * day view of yesterday, the last complete day of the files.
 */

const PAGE_URL = "/relatorios/consolidado/controle-infeccao";
const ENDPOINT = "POST /reports/consolidated/infection-control";
const UPDATED_AT = "2026-03-11T02:10:00-03:00";

const quantiles = (median: number | null, p90: number | null = null) => ({
  median,
  p90,
  count: median == null ? 0 : 3,
});

const indicators = {
  overview: {
    admissionsClosed: 12,
    admissionsFollowed: 4,
    courses: 30,
    dot: 1234,
    lot: 800,
    dotLot: 1.54,
    patientDays: 2000,
    dotPer1000PatientDays: 617,
    accessShare: 0.612,
    evaluations: 40,
    conformingShare: 0.75,
    evaluatedByD3Share: 0.8,
    timeToFirstReviewHours: quantiles(26, 50),
    interventionAcceptance: 0.5,
    interventionsWithOutcome: 6,
  },
  byDepartment: [
    {
      idDepartment: 5,
      department: "UTI Teste",
      admissions: 12,
      dot: 1234,
      dotPer1000PatientDays: 617,
      accessShare: 0.612,
      conformingShare: 0.75,
      evaluatedByD3Share: 0.8,
      timeToFirstReviewHours: 26,
      interventionAcceptance: 0.5,
      pendingTimeShare: 0.1,
      verdictDays: {
        conforming: 900,
        non_conforming: 200,
        not_evaluated: 100,
        expired: 34,
      },
    },
  ],
  monthly: [
    {
      month: "2026-01",
      dot: 600,
      conformingShare: 0.7,
      evaluatedByD3Share: 0.75,
    },
    {
      month: "2026-02",
      dot: 634,
      conformingShare: 0.8,
      evaluatedByD3Share: 0.85,
    },
  ],
  process: {
    admissionsReviewedShare: 0.9,
    coursesEvaluatedShare: 0.85,
    reviewsPerAdmission: 3.5,
    reviewsPer100Dot: 12.4,
    reviewIntervalHours: quantiles(48),
    timeToFirstReviewBins: [
      { label: "<12h", count: 3, share: 0.25 },
      { label: "12-24h", count: 5, share: 0.42 },
    ],
    timeToFirstEvaluationHours: quantiles(30),
    pendings: [
      {
        type: 3,
        opened: 10,
        stillOpen: 2,
        hoursOpen: quantiles(12),
        resolvedByTeamShare: 0.75,
      },
    ],
    pendingResolutions: { "1": 8 },
    pendingTimeShare: 0.1,
    retroactiveShare: 0.05,
    reviewers: [
      {
        idReviewer: 7,
        reviewer: "Fulano Beltrano",
        evaluations: 40,
        admissions: 12,
        nonConformingShare: 0.25,
      },
    ],
  },
  appropriateness: {
    evaluationsConformingShare: 0.75,
    coursesEndingConformingShare: 0.8,
    coursesEverNonConformingShare: 0.3,
    admissionsWithNonConformity: 5,
    bySubstance: [
      {
        idSubstance: 100,
        substance: "SUBSTANCIA TESTE",
        evaluations: 40,
        conformingShare: 0.75,
      },
    ],
    reasons: [{ reason: "Duração - Tempo excessivo", count: 8 }],
    nonConforming: 10,
    adjustments: { suspension: 4, de_escalation: 3 },
    substitutions: [
      {
        from: "ANTIMICROBIANO TESTE",
        to: "SUBSTITUTO TESTE",
        type: "de_escalation",
        count: 3,
      },
    ],
    interventions: {
      recorded: 8,
      byStatus: { a: 3, n: 3, s: 2 },
      hoursToOutcome: quantiles(5),
    },
    verdictDays: {
      conforming: 900,
      non_conforming: 200,
      not_evaluated: 100,
      expired: 34,
    },
  },
  consumption: {
    awareMix: { access: 0.612, watch: 0.3, reserve: 0.088 },
    dotBySubstance: [
      { idSubstance: 100, substance: "SUBSTANCIA TESTE", dot: 1234 },
    ],
    courseLengthDays: quantiles(7, 12),
    courseLengthBins: [{ label: "4-7", count: 10, share: 0.5 }],
    pastPlannedEndShare: 0.2,
    maxSimultaneous: { "1": 8, "2": 4 },
    routeShare: { iv: 0.7, oral: 0.3 },
    ivToOralSwitchShare: 0.25,
    ivToOralSwitchDay: quantiles(4),
    restartShare: 0.1,
    episodesPerAdmission: 1.25,
  },
  microbiology: {
    collectedBeforeStartShare: 0.6,
    positiveShare: 0.4,
    culturesCollected: 20,
    resistantInUseShare: 0.05,
    microorganisms: [
      { microorganism: "Escherichia coli teste", admissions: 3 },
    ],
  },
  outcomes: {
    lengthOfStayDays: quantiles(14),
    antimicrobialEndToDischargeDays: quantiles(3),
    stillInHospitalShare: 0.25,
    byAgeBand: [{ ageBand: "60-79", admissions: 12, dotPerAdmission: 9.5 }],
    bySex: { F: 7, M: 5 },
    diagnoses: [
      { idcid: "J18", name: "Pneumonia", admissions: 4, dotPerAdmission: 10 },
    ],
  },
};

const dayView = (date: string) => ({
  date,
  prescribed: 42,
  patients: 30,
  withRecord: 31,
  conforming: 25,
  nonConforming: 6,
  withoutRecord: 11,
  notEvaluated: 8,
  expired: 3,
  withoutRecordPastD3: 4,
  byDepartment: [
    {
      idDepartment: 5,
      department: "UTI Teste",
      prescribed: 42,
      conforming: 25,
      non_conforming: 6,
      not_evaluated: 8,
      expired: 3,
    },
  ],
  nonConformityReasons: [{ reason: "Espectro - Amplo demais", count: 6 }],
});

const isReport = (request: Request) =>
  request.method() === "POST" &&
  request.url().endsWith("/reports/consolidated/infection-control");

const isDay = (request: Request) => !!request.postDataJSON()?.day;

/** Answers the period or the day, as the private backend does. */
function mockReport(mockApi: any) {
  mockApi.override(ENDPOINT, (route: any) => {
    const params = route.request().postDataJSON();
    const data = params.day
      ? { day: dayView(params.day), updatedAt: UPDATED_AT }
      : { indicators, updatedAt: UPDATED_AT };

    return route.fulfill({ json: { status: "success", data } });
  });
}

const indicator = (page: Page, title: string) =>
  page.locator(".indicator").filter({
    has: page.locator(".indicator-title").getByText(title, { exact: true }),
  });

test("opens with the period up to yesterday and the day view of yesterday", async ({
  page,
  mockApi,
}) => {
  mockReport(mockApi);
  const period = page.waitForRequest((r) => isReport(r) && !isDay(r));
  const day = page.waitForRequest((r) => isReport(r) && isDay(r));

  await page.goto(PAGE_URL);

  await expect(
    page.getByRole("heading", {
      name: "Relatório: Controle de Infecção",
      level: 1,
    }),
  ).toBeVisible();

  const dayParams = (await day).postDataJSON();
  const periodParams = (await period).postDataJSON();
  expect(dayParams.day).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(dayParams.year).toBe(Number(dayParams.day.slice(0, 4)));
  expect(periodParams).toMatchObject({
    year: dayParams.year,
    start_date: `${dayParams.year}-01-01`,
    end_date: dayParams.day,
    id_department: [],
    segment: [],
    substance: [],
    aware_level: [],
    reviewer: [],
  });
  expect(periodParams.day).toBeUndefined();
});

test("shows the day view: prescribed, with and without a valid record", async ({
  page,
  mockApi,
}) => {
  mockReport(mockApi);

  await page.goto(PAGE_URL);

  const day = page.locator('[data-kb="reports.infectionControl.day"]');
  await expect(
    indicator(page, "Antimicrobianos prescritos").locator(".indicator-value"),
  ).toHaveText("42");
  await expect(day).toContainText("30 pacientes");
  await expect(day).toContainText("Com registro válido");
  await expect(day).toContainText("25 conformes · 6 não conformes");
  await expect(day).toContainText("8 nunca avaliados · 3 vencidos");
  await expect(
    indicator(page, "Sem registro após o D3").locator(".indicator-value"),
  ).toHaveText("4");

  const departments = page.locator(
    '[data-kb="reports.infectionControl.dayDepartments"]',
  );
  await expect(
    departments.getByRole("row", { name: /UTI Teste/ }),
  ).toContainText("42");
});

test("asks the day again when another day is picked", async ({
  page,
  mockApi,
}) => {
  mockReport(mockApi);
  const first = page.waitForRequest((r) => isReport(r) && isDay(r));
  await page.goto(PAGE_URL);
  const year = (await first).postDataJSON().year;
  await expect(
    indicator(page, "Antimicrobianos prescritos").locator(".indicator-value"),
  ).toHaveText("42");

  const picked = `${year}-01-02`;
  const next = page.waitForRequest(
    (r) => isReport(r) && isDay(r) && r.postDataJSON().day === picked,
  );
  const picker = page.locator("#infection-control-day");
  await picker.click();
  await picker.fill(`02/01/${year}`);
  await picker.press("Enter");

  expect((await next).postDataJSON()).toMatchObject({ day: picked, year });
  await expect(picker).toHaveValue(`02/01/${year}`);
});

test("shows the period indicators in the browser's number format", async ({
  page,
  mockApi,
}) => {
  mockReport(mockApi);

  await page.goto(PAGE_URL);

  const value = (title: string) =>
    indicator(page, title).first().locator(".indicator-value");

  await expect(value("Dias de terapia (DOT)")).toHaveText("1.234");
  await expect(value("DOT por 1.000 pacientes-dia")).toHaveText("617,0");
  await expect(value("DOT / LOT")).toHaveText("1,54");
  await expect(value("DOT do grupo Acesso")).toHaveText("61,2%");
  await expect(value("Cursos avaliados até o D3")).toHaveText("80,0%");
  await expect(value("Tempo até a 1ª revisão")).toHaveText("26,0 h");
  await expect(value("Revisões por atendimento")).toHaveText("3,5");
  await expect(value("Duração dos cursos")).toHaveText("7,0 dias");
  await expect(value("Dia da troca para oral")).toHaveText("D4,0");

  await expect(
    page
      .locator('[data-kb="reports.infectionControl.reviewers"]')
      .getByRole("row", { name: /Fulano Beltrano/ }),
  ).toContainText("25,0%");
  await expect(
    page
      .locator('[data-kb="reports.infectionControl.pendings"]')
      .getByRole("row", { name: /Avaliação vencida/ }),
  ).toContainText("75,0%");
  await expect(
    page.locator('[data-kb="reports.infectionControl.substitutions"]'),
  ).toContainText("Descalonamento");
  await expect(
    page.locator('[data-kb="reports.infectionControl.diagnoses"]'),
  ).toContainText("J18 - Pneumonia");
});

test("explains how each indicator is calculated", async ({ page, mockApi }) => {
  mockReport(mockApi);

  await page.goto(PAGE_URL);

  await indicator(page, "Avaliações conformes")
    .first()
    .getByLabel("Como é calculado")
    .hover();

  await expect(page.getByRole("tooltip")).toContainText(
    "Como é calculado: Avaliações registradas no período com parecer conforme",
  );
});

test("sends the chosen filters with the period", async ({ page, mockApi }) => {
  mockReport(mockApi);
  mockApi.override("GET /segments/departments", {
    json: {
      status: "success",
      data: [{ idSegment: 1, idDepartment: 5, label: "UTI Teste" }],
    },
  });

  await page.goto(PAGE_URL);
  await expect(
    indicator(page, "Dias de terapia (DOT)")
      .first()
      .locator(".indicator-value"),
  ).toHaveText("1.234");

  await openSelectById(page, "infection-control-department");
  await pickOption(page, "UTI Teste");
  await page.keyboard.press("Escape");

  const period = page.waitForRequest((r) => isReport(r) && !isDay(r));
  const day = page.waitForRequest((r) => isReport(r) && isDay(r));
  await page.locator(".gtm-btn-search").click();

  expect((await period).postDataJSON().id_department).toEqual([5]);
  expect((await day).postDataJSON().id_department).toEqual([5]);
  await expect(page.locator(".report-filter-list")).toContainText(
    "Setor: UTI Teste",
  );
});

test("warns when the report can't be loaded", async ({ page, mockApi }) => {
  mockApi.override(ENDPOINT, {
    status: 400,
    json: { status: "error", message: "Controle de infecção não habilitado" },
  });

  // the period notifies; the notice closes itself after a few seconds, so
  // wait for it from before the page opens
  const notified = page
    .locator(".ant-notification-notice-error")
    .filter({ hasText: "Controle de infecção não habilitado" })
    .first()
    .waitFor({ state: "attached" });
  await page.goto(PAGE_URL);
  await notified;

  // the day view says so in its own section
  await expect(page.locator(".ant-alert-error")).toContainText(
    "Controle de infecção não habilitado",
  );
  await expect(
    indicator(page, "Dias de terapia (DOT)")
      .first()
      .locator(".indicator-value"),
  ).toHaveText("-");
});
