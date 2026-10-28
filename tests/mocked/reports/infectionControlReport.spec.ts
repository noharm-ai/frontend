import type { Page, Request } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import { openSelectById, pickOption } from "../support/antd";

/**
 * Infection control report (/relatorios/consolidado/controle-infeccao,
 * src/features/reports/InfectionControlConsolidatedReport).
 *
 * POST /reports/consolidated/infection-control answers the indicators of a
 * period. The page asks the period from January 1st to yesterday, the last
 * complete day of the files, when it opens. Each section is a tab, and the
 * period summary is the one open at first. A department row drills down to
 * its admissions (`admissions_of`), and an admission to its antimicrobial
 * courses (`courses_of`).
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
    patientsOnAntimicrobials: 150,
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
      period: "2026-01",
      dot: 600,
      verdictDays: {
        conforming: 400,
        non_conforming: 100,
        not_evaluated: 80,
        expired: 20,
      },
    },
    {
      period: "2026-02",
      dot: 634,
      verdictDays: {
        conforming: 500,
        non_conforming: 100,
        not_evaluated: 20,
        expired: 14,
      },
    },
  ],
  daily: [
    {
      period: "2026-01-01",
      dot: 20,
      verdictDays: {
        conforming: 12,
        non_conforming: 4,
        not_evaluated: 3,
        expired: 1,
      },
    },
    {
      period: "2026-01-02",
      dot: 22,
      verdictDays: {
        conforming: 14,
        non_conforming: 4,
        not_evaluated: 3,
        expired: 1,
      },
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

const admissions = [
  {
    admissionNumber: 90001,
    followed: true,
    closedAt: null,
    segment: "Adulto",
    age: 71,
    sex: "M",
    idcid: "A41",
    diagnosis: "Sepse teste",
    antimicrobialStart: "2026-03-04T08:00:00",
    antimicrobialEnd: null,
    dot: 9,
    episodes: 1,
    reviews: 3,
    timeToFirstReviewHours: 20,
    lengthOfStayDays: null,
  },
  {
    admissionNumber: 90002,
    followed: false,
    closedAt: "2026-03-06T10:00:00",
    segment: "Adulto",
    age: 64,
    sex: "F",
    idcid: "J18",
    diagnosis: "Pneumonia",
    antimicrobialStart: "2026-03-01T08:00:00",
    antimicrobialEnd: "2026-03-06T08:00:00",
    dot: 5,
    episodes: 1,
    reviews: 2,
    timeToFirstReviewHours: 26,
    lengthOfStayDays: 12,
  },
];

const courses = [
  {
    course: 1,
    idSubstance: 100,
    substance: "SUBSTANCIA TESTE",
    awareLevel: 2,
    start: "2026-03-01T08:00:00",
    days: 5,
    plannedDays: 7,
    pastPlannedEnd: false,
    route: "EV",
    ivToOralDay: 4,
    ongoing: false,
    restart: false,
    department: "UTI Teste",
    evaluatedByD3: true,
    finalVerdict: "non_conforming",
    everNonConforming: true,
  },
  {
    course: 2,
    idSubstance: 200,
    substance: "OUTRA SUBSTANCIA TESTE",
    awareLevel: 1,
    start: "2026-03-05T08:00:00",
    days: 2,
    plannedDays: null,
    pastPlannedEnd: false,
    route: "VO",
    ivToOralDay: null,
    ongoing: true,
    restart: false,
    department: "UTI Teste",
    evaluatedByD3: null,
    finalVerdict: null,
    everNonConforming: false,
  },
];

const isReport = (request: Request) =>
  request.method() === "POST" &&
  request.url().endsWith("/reports/consolidated/infection-control");

const isAdmissions = (request: Request) =>
  isReport(request) && !!request.postDataJSON()?.admissions_of;

const isCourses = (request: Request) =>
  isReport(request) && !!request.postDataJSON()?.courses_of;

/** Answers the period, a department's admissions or an admission's courses, as the private backend does. */
function mockReport(mockApi: any) {
  mockApi.override(ENDPOINT, (route: any) => {
    const params = route.request().postDataJSON();
    const data = params.courses_of
      ? { courses, updatedAt: UPDATED_AT }
      : params.admissions_of
        ? { admissions, updatedAt: UPDATED_AT }
        : { indicators, updatedAt: UPDATED_AT };

    return route.fulfill({ json: { status: "success", data } });
  });
}

/** Opens a section of the report; the period summary is the one open at first. */
const openTab = (page: Page, name: string) =>
  page.getByRole("tab", { name, exact: true }).click();

const indicator = (page: Page, title: string) =>
  page.locator(".indicator").filter({
    has: page.locator(".indicator-title").getByText(title, { exact: true }),
  });

test("opens with the period up to yesterday, on the period summary", async ({
  page,
  mockApi,
}) => {
  mockReport(mockApi);
  const period = page.waitForRequest(isReport);

  await page.goto(PAGE_URL);

  await expect(
    page.getByRole("heading", {
      name: "Relatório: Controle de Infecção",
      level: 1,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("tab", { name: "Resumo do período", selected: true }),
  ).toBeVisible();

  const params = (await period).postDataJSON();
  expect(params.end_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  const year = Number(params.end_date.slice(0, 4));
  expect(params).toMatchObject({
    year,
    start_date: `${year}-01-01`,
    id_department: [],
    segment: [],
    substance: [],
    aware_level: [],
    reviewer: [],
  });
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
  await expect(value("Pacientes-dia")).toHaveText("2.000");
  await expect(value("Pacientes com antimicrobiano")).toHaveText("150");
  await expect(value("DOT / LOT")).toHaveText("1,54");
  await expect(value("DOT do grupo Acesso")).toHaveText("61,2%");
  await expect(value("Cursos avaliados até o D3")).toHaveText("80,0%");
  await expect(value("Tempo até a 1ª revisão")).toHaveText("26,0 h");

  await openTab(page, "Processo de revisão");
  await expect(value("Revisões por atendimento")).toHaveText("3,5");
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

  await openTab(page, "Adequação");
  await expect(
    page.locator('[data-kb="reports.infectionControl.substitutions"]'),
  ).toContainText("Descalonamento");

  await openTab(page, "Consumo");
  await expect(value("Duração dos cursos")).toHaveText("7,0 dias");
  await expect(value("Dia da troca para oral")).toHaveText("D4,0");

  await openTab(page, "Perfil e desfechos");
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

  const period = page.waitForRequest(isReport);
  await page.locator(".gtm-btn-search").click();

  expect((await period).postDataJSON().id_department).toEqual([5]);
  await expect(page.locator(".report-filter-list")).toContainText(
    "Setor: UTI Teste",
  );
});

test("a department row lists the admissions it counts, for the same period", async ({
  page,
  mockApi,
}) => {
  mockReport(mockApi);
  const period = page.waitForRequest(isReport);
  await page.goto(PAGE_URL);
  const periodParams = (await period).postDataJSON();

  const asked = page.waitForRequest(isAdmissions);
  await page
    .locator('[data-kb="reports.infectionControl.departments"]')
    .getByRole("row", { name: /UTI Teste/ })
    .click();

  expect((await asked).postDataJSON()).toEqual({
    ...periodParams,
    admissions_of: 5,
  });

  const modal = page.locator(
    '[data-kb="reports.infectionControl.departmentAdmissions"]',
  );
  await expect(page.getByText("Atendimentos: UTI Teste")).toBeVisible();
  const followed = modal.getByRole("row", { name: /90001/ });
  await expect(followed).toContainText("Em acompanhamento");
  await expect(followed).toContainText("71 anos · Masculino");
  await expect(followed).toContainText("A41 - Sepse teste");
  await expect(modal.getByRole("row", { name: /90002/ })).toContainText(
    "Encerrado em 06/03/26",
  );
  await expect(
    modal
      .getByRole("row", { name: /90002/ })
      .getByLabel("Abrir o acompanhamento do atendimento (dados atuais)"),
  ).toHaveAttribute("href", "/controle-infeccao/90002");
});

test("an admission lists its antimicrobial courses", async ({
  page,
  mockApi,
}) => {
  mockReport(mockApi);
  const period = page.waitForRequest(isReport);
  await page.goto(PAGE_URL);
  const year = (await period).postDataJSON().year;

  await page
    .locator('[data-kb="reports.infectionControl.departments"]')
    .getByRole("row", { name: /UTI Teste/ })
    .click();
  const modal = page.locator(
    '[data-kb="reports.infectionControl.departmentAdmissions"]',
  );

  const asked = page.waitForRequest(isCourses);
  await modal.getByRole("row", { name: /90002/ }).click();
  expect((await asked).postDataJSON()).toEqual({ year, courses_of: 90002 });

  const list = page.locator(
    '[data-kb="reports.infectionControl.admissionCourses"]',
  );
  await expect(list).toContainText("Antimicrobianos do atendimento 90002");
  const first = list.getByRole("row", { name: /^SUBSTANCIA TESTE/ });
  await expect(first).toContainText("Observe");
  await expect(first).toContainText("5 (7)");
  await expect(first).toContainText("D4");
  await expect(first).toContainText("Não conforme");
  await expect(first).toContainText("Já teve parecer não conforme");
  const running = list.getByRole("row", { name: /OUTRA SUBSTANCIA TESTE/ });
  await expect(running).toContainText("Em andamento");
  await expect(running).toContainText("Acesso");
});

test("the antimicrobials by record switch between months and days", async ({
  page,
  mockApi,
}) => {
  mockReport(mockApi);
  const errors: Error[] = [];
  page.on("pageerror", (error) => errors.push(error));

  await page.goto(PAGE_URL);

  const block = page.locator('[data-kb="reports.infectionControl.registry"]');
  await expect(block).toContainText("Situação dos antimicrobianos prescritos");
  await expect(block.locator(".ant-segmented-item-selected")).toHaveText(
    "Mensal",
  );
  await block.getByText("Diário", { exact: true }).click();
  await expect(block.locator(".ant-segmented-item-selected")).toHaveText(
    "Diário",
  );
  await expect(
    page.locator('[data-kb="reports.infectionControl.monthly"]'),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("warns when the report can't be loaded", async ({ page, mockApi }) => {
  mockApi.override(ENDPOINT, {
    status: 400,
    json: { status: "error", message: "Controle de infecção não habilitado" },
  });

  // the notice closes itself after a few seconds, so wait for it from before
  // the page opens
  const notified = page
    .locator(".ant-notification-notice-error")
    .filter({ hasText: "Controle de infecção não habilitado" })
    .first()
    .waitFor({ state: "attached" });
  await page.goto(PAGE_URL);
  await notified;
  await expect(
    indicator(page, "Dias de terapia (DOT)")
      .first()
      .locator(".indicator-value"),
  ).toHaveText("-");
});
