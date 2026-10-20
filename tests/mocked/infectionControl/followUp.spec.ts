import type { Locator, Page } from "@playwright/test";

import { test, expect, type MockApi } from "../support/mockApi";
import { loginWithAuth, loginWithPermissions } from "../support/featureLogin";
import { openSelect, pickMenuItem, pickOption } from "../support/antd";

/**
 * Infection control follow-up (src/features/infectionControl).
 *
 * GET /infection-control/antimicrobial-timeline/:admissionNumber brings, with
 * the timeline, the follow-up of the admission (GET
 * /infection-control/admission/:admissionNumber brings it alone, to retry it
 * when it failed): its status (pending / revised / closed), the reasons it is
 * pending, the reviews and the evaluation of each antimicrobial course (keyed
 * by drug + course start, like the timeline). Users with
 * WRITE_INFECTION_CONTROL register reviews (POST /infection-control/review)
 * of a followed admission, and start following one that is not yet (POST
 * /infection-control/admission/:admissionNumber/follow).
 * /controle-infeccao lists the followed admissions
 * (POST /infection-control/admissions); its menu entry needs
 * READ_INFECTION_CONTROL, READ_PRESCRIPTION alone does not reach it.
 */

const ADMISSION = 9300;
const PATIENT_ID = 4330;
const PAGE_URL = `/controle-infeccao/${ADMISSION}`;
const TIMELINE =
  "GET /infection-control/antimicrobial-timeline/:admissionNumber";
const FOLLOW_UP = "GET /infection-control/admission/:admissionNumber";
const REVIEW = "POST /infection-control/review";
const FOLLOW = "POST /infection-control/admission/:admissionNumber/follow";
const LIST = "POST /infection-control/admissions";
const SKIP = "Não avaliar agora";
const WATCH_EXPIRY = /Quando a avaliação vencer/;
const WATCH_POSOLOGY = /Quando a posologia mudar/;

// the intervention reasons; only the ones flagged for infection control can
// justify a non-conformity. A substitution or relationType 2 requires a
// substitute drug, relationType 1 takes one optionally
const REASONS = [
  {
    id: 31,
    name: "Espectro inadequado",
    parentId: 30,
    parentName: "Antimicrobiano",
    relationType: 0,
    infectionControl: true,
  },
  {
    id: 32,
    name: "Tempo de tratamento",
    parentId: null,
    parentName: null,
    relationType: 0,
    infectionControl: true,
  },
  {
    // a substitution: the substitute is required whatever its relationType
    id: 33,
    name: "Trocar antimicrobiano",
    parentId: null,
    parentName: null,
    relationType: 0,
    substitution: true,
    infectionControl: true,
  },
  {
    id: 5,
    name: "Duplicidade medicamentosa",
    parentId: null,
    parentName: null,
    relationType: 1,
    infectionControl: false,
  },
];

/** Picks a non-conformity reason of the drug being evaluated */
const pickReason = async (page: Page, drug: Locator, reason: string) => {
  await openSelect(drug.getByTestId("review-reasons"));
  await pickOption(page, reason);
  // the multiple select stays open: a click aside closes it (Escape would
  // close the review)
  await drug.getByRole("heading", { level: 3 }).click();
};

/** The header dropdown holding the secondary actions of the page */
const moreActions = (page: Page) =>
  page.getByRole("button", { name: "Mais ações" });

/** Opens the header's secondary actions and returns their popup */
const openMoreActions = async (page: Page) => {
  const popup = page.locator(".ant-dropdown:not(.ant-dropdown-hidden)");
  await moreActions(page).click({ timeout: 15000 });
  await expect(popup).toBeVisible();
  await expect(popup).not.toHaveClass(/-(enter|appear|leave)/);
  return popup;
};

/** Clicks one of the header's secondary actions, once the page is loaded */
const pickMoreAction = async (page: Page, action: string) => {
  await expect(moreActions(page)).toBeVisible({ timeout: 15000 });
  await pickMenuItem(page, moreActions(page), new RegExp(action));
};

const BASE_PERMISSIONS = [
  "READ_BASIC_FEATURES",
  "WRITE_BASIC_FEATURES",
  "READ_PRESCRIPTION",
  "READ_SUPPORT",
];

/** Opens the period of the evaluation, told in a line until changed */
const openValidity = (drug: Locator) =>
  drug
    .getByTestId("review-validity")
    .getByRole("button", { name: "Alterar" })
    .click();

/** A naive ISO date some hours away from now, as the backend sends it */
const hoursFromNow = (hours: number) =>
  new Date(Date.now() + hours * 60 * 60 * 1000).toISOString().slice(0, 19);

/** dd/mm/yyyy of a fixture date, as the page shows it (read as local time) */
const shownDate = (isoDate: string) =>
  isoDate.slice(0, 10).split("-").reverse().join("/");

/** yyyy-mm-dd of a day + offset days (today by default), in local time */
const localDay = (offset: number, from?: string) => {
  const date = from ? new Date(`${from.slice(0, 10)}T12:00:00`) : new Date();
  date.setDate(date.getDate() + offset);
  const pad = (n: number) => `${n}`.padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const MEROPENEM_START = hoursFromNow(-48);
const VANCOMYCIN_START = hoursFromNow(-96);
const MEROPENEM_END = hoursFromNow(24);
const VANCOMYCIN_END = hoursFromNow(30);

const course = (overrides: Record<string, unknown>) => ({
  substance: null,
  atbLevel: null,
  cpoe: false,
  status: "active",
  plannedEnd: null,
  plannedDays: null,
  lastIdPrescription: "299",
  prescriptionCount: 2,
  gaps: [],
  regimens: [],
  ...overrides,
});

const TIMELINE_DATA = {
  status: "success",
  data: {
    now: hoursFromNow(0),
    patient: {
      idPatient: `${PATIENT_ID}`,
      admissionNumber: ADMISSION,
      admissionDate: hoursFromNow(-240),
      dischargeDate: null,
      dischargeReason: null,
      birthdate: "1975-03-02T00:00:00",
      gender: "F",
      weight: 64,
      weightDate: hoursFromNow(-240),
      height: 162,
      idPrescription: "299",
      bed: "7B",
      record: null,
      department: "UTI Adulto",
      segment: "Segmento Adulto",
    },
    courses: [
      course({
        idDrug: 11,
        drug: "MEROPENEM 1 g SOL INJ",
        start: MEROPENEM_START,
        end: MEROPENEM_END,
        days: 3,
      }),
      course({
        idDrug: 12,
        drug: "VANCOMICINA 500 mg SOL INJ",
        start: VANCOMYCIN_START,
        end: VANCOMYCIN_END,
        days: 5,
      }),
    ],
    followUp: { enabled: false, admissionNumber: ADMISSION },
  },
};

const vancomycinEvaluation = {
  id: "501",
  idReview: "41",
  idDrug: 12,
  idPrescription: "298",
  courseStart: VANCOMYCIN_START,
  conforming: true,
  notes: "Guiado por cultura",
  posology: {
    idPrescriptionDrug: "298001",
    dose: 1,
    doseconv: 1,
    measureUnit: "g",
    frequency: "12h/12h",
    dailyFrequency: 2,
    route: "IV",
  },
  validFrom: hoursFromNow(-30),
  validUntil: hoursFromNow(5 * 24),
  triggers: [],
  status: 1,
  closedAt: null,
  closingType: null,
  createdAt: hoursFromNow(-30),
  createdBy: "Maria Teste",
};

const followUp = (overrides: Record<string, unknown> = {}) => ({
  status: "success",
  data: {
    enabled: true,
    admissionNumber: ADMISSION,
    followed: true,
    status: 1,
    statusDate: hoursFromNow(-20),
    nextReviewDate: null,
    recalculatedAt: hoursFromNow(-20),
    pendings: [
      {
        id: "801",
        type: 2,
        origin: 1,
        idDrug: 11,
        idPrescription: "299",
        details: {
          drug: "MEROPENEM 1 g SOL INJ",
          courseStart: MEROPENEM_START,
        },
        createdAt: hoursFromNow(-20),
      },
    ],
    reviews: [
      {
        id: "41",
        notes: "Paciente estável, manter vancomicina",
        nextReviewDate: null,
        createdAt: hoursFromNow(-30),
        createdBy: "Maria Teste",
      },
    ],
    courses: [
      {
        idDrug: 11,
        start: MEROPENEM_START,
        ongoing: true,
        evaluation: null,
        history: [],
      },
      {
        idDrug: 12,
        start: VANCOMYCIN_START,
        ongoing: true,
        evaluation: vancomycinEvaluation,
        history: [vancomycinEvaluation],
      },
    ],
    ...overrides,
  },
});

/** An admission not followed yet: no status, reasons nor reviews */
const notFollowed = (ongoing = true) =>
  followUp({
    followed: false,
    status: null,
    statusDate: null,
    recalculatedAt: null,
    pendings: [],
    reviews: [],
    courses: [
      {
        idDrug: 11,
        start: MEROPENEM_START,
        ongoing,
        evaluation: null,
        history: [],
      },
      {
        idDrug: 12,
        start: VANCOMYCIN_START,
        ongoing,
        evaluation: null,
        history: [],
      },
    ],
  });

/**
 * The page loads the follow-up inside the timeline response (null when it
 * failed on the server); FOLLOW_UP alone only answers its retry
 */
const mockPage = (
  mockApi: MockApi,
  followUpResponse: { data: unknown },
  timeline = TIMELINE_DATA,
) =>
  mockApi.override(TIMELINE, {
    json: {
      ...timeline,
      data: { ...timeline.data, followUp: followUpResponse.data },
    },
  });

test.beforeEach(({ mockApi }) => {
  mockApi.override("GET /names/:idPatient", {
    json: { status: "success", idPatient: PATIENT_ID, name: "Fulano Beltrano" },
  });
  mockApi.override(TIMELINE, { json: TIMELINE_DATA });
});

test("shows the follow-up status, its pending reasons and each drug's evaluation", async ({
  page,
  mockApi,
}) => {
  mockPage(mockApi, followUp());

  await page.goto(PAGE_URL);

  const box = page.getByTestId("follow-up");
  await expect(box).toBeVisible({ timeout: 15000 });
  await expect(box.getByTestId("follow-up-status")).toHaveText("Pendente");
  await expect(box.getByTestId("follow-up-pendings-count")).toHaveText(
    "1 pendência",
  );
  await expect(box).toContainText("Não agendada");
  await expect(box).toContainText("Maria Teste");

  // the card only counts them; the reasons are listed in a modal
  await expect(box).not.toContainText("MEROPENEM 1 g SOL INJ sem avaliação");
  await box.getByTestId("follow-up-pendings-count").click();
  const pendingsList = page.getByTestId("follow-up-pendings-list");
  await expect(pendingsList).toContainText(
    "MEROPENEM 1 g SOL INJ sem avaliação",
  );
  await page.keyboard.press("Escape");
  await expect(pendingsList).toHaveCount(0);

  // each drug's evaluation sits on its course in the timeline
  const rows = page.getByTestId("course-row");
  await expect(
    rows.filter({ hasText: "MEROPENEM" }).getByTestId("course-evaluation"),
  ).toHaveCount(0);
  await expect(
    rows.filter({ hasText: "VANCOMICINA" }).getByTestId("course-evaluation"),
  ).toHaveAttribute(
    "aria-label",
    `Conforme em ${shownDate(vancomycinEvaluation.createdAt)}`,
  );

  // the default user cannot register reviews
  await expect(page.getByRole("button", { name: "Revisar" })).toHaveCount(0);

  // the review history opens from the last review, listing what each review
  // evaluated
  await box.getByTestId("follow-up-last-review").click();
  const history = page.getByRole("dialog");
  const review = history.getByTestId("review-item");
  await expect(review).toContainText("Paciente estável, manter vancomicina");
  await expect(review).toContainText("VANCOMICINA 500 mg SOL INJ");
  await expect(review).toContainText("Guiado por cultura");
});

test("lists the reasons and the intervention of a non-conformity in the history", async ({
  page,
  mockApi,
}) => {
  const nonConforming = {
    ...vancomycinEvaluation,
    conforming: false,
    notes: "Sem cultura que justifique",
    interventionReasons: [
      { id: 31, name: "Antimicrobiano - Espectro inadequado" },
      { id: 32, name: "Tempo de tratamento" },
    ],
    substituteDrug: { id: 21, name: "CEFTRIAXONA 1 g SOL INJ" },
    interventions: [{ id: "7001", status: "s" }],
  };
  mockPage(
    mockApi,
    followUp({
      courses: [
        {
          idDrug: 12,
          start: VANCOMYCIN_START,
          ongoing: true,
          evaluation: nonConforming,
          history: [nonConforming],
        },
      ],
    }),
  );

  await page.goto(PAGE_URL);
  const box = page.getByTestId("follow-up");
  await expect(box).toBeVisible({ timeout: 15000 });

  await box.getByTestId("follow-up-last-review").click();
  const review = page.getByRole("dialog").getByTestId("review-item");
  await expect(review.getByTestId("review-evaluation-reasons")).toHaveText(
    "Motivos: Antimicrobiano - Espectro inadequado, Tempo de tratamento",
  );
  await expect(review.getByTestId("review-evaluation-substitute")).toHaveText(
    "Substituto: CEFTRIAXONA 1 g SOL INJ",
  );
  await expect(review.getByTestId("review-evaluation-intervention")).toHaveText(
    "Intervenção: Pendente",
  );
  await expect(review).toContainText("Sem cultura que justifique");
});

test("opens a printable report with every course and every review in detail", async ({
  page,
  mockApi,
}) => {
  const nonConforming = {
    ...vancomycinEvaluation,
    conforming: false,
    notes: "Sem cultura que justifique",
    triggers: [3, 6],
    interventionReasons: [{ id: 32, name: "Tempo de tratamento" }],
    substituteDrug: { id: 21, name: "CEFTRIAXONA 1 g SOL INJ" },
    interventions: [{ id: "7001", status: "s" }],
  };
  const timeline = {
    ...TIMELINE_DATA,
    data: {
      ...TIMELINE_DATA.data,
      courses: [
        TIMELINE_DATA.data.courses[0],
        course({
          idDrug: 12,
          drug: "VANCOMICINA 500 mg SOL INJ",
          substance: "VANCOMICINA",
          atbLevel: 2,
          start: VANCOMYCIN_START,
          end: VANCOMYCIN_END,
          days: 5,
          plannedDays: 7,
          regimens: [
            {
              start: VANCOMYCIN_START,
              end: VANCOMYCIN_END,
              dose: 1,
              measureUnit: "g",
              frequency: "12h/12h",
              route: "IV",
              doseWeight: "0,02 g/Kg",
              doseWeightDay: "0,03 g/Kg/dia",
              notes: "Infundir em 2 horas",
            },
          ],
          gaps: [{ start: hoursFromNow(-72), end: hoursFromNow(-60) }],
        }),
      ],
    },
  };
  mockPage(
    mockApi,
    followUp({
      courses: [
        {
          idDrug: 11,
          start: MEROPENEM_START,
          ongoing: true,
          evaluation: null,
          history: [],
        },
        {
          idDrug: 12,
          start: VANCOMYCIN_START,
          ongoing: true,
          evaluation: nonConforming,
          history: [nonConforming],
        },
      ],
    }),
    timeline,
  );

  await page.goto(PAGE_URL);
  const box = page.getByTestId("follow-up");
  await expect(box).toBeVisible({ timeout: 15000 });

  // the review history leads to the detailed report
  await box.getByTestId("follow-up-last-review").click();
  await page.getByTestId("history-open-report").click();

  const report = page.getByTestId("infection-control-report");
  await expect(report).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Relatório de controle de infecção" }),
  ).toBeVisible();
  await expect(report).toContainText("Fulano Beltrano");
  await expect(report).toContainText("MEROPENEM 1 g SOL INJ sem avaliação");

  // every course, with its posologies, gaps and evaluations
  const courses = report.getByTestId("report-course");
  await expect(courses).toHaveCount(2);
  const vancomycin = courses.filter({ hasText: "VANCOMICINA 500 mg" });
  await expect(vancomycin).toContainText("5 de 7 dias");
  await expect(vancomycin).toContainText("Observe");
  await expect(vancomycin).toContainText("0,02 g/Kg · 0,03 g/Kg/dia");
  await expect(vancomycin).toContainText("Infundir em 2 horas");
  await expect(vancomycin).toContainText("Intervalos sem prescrição (1)");
  await expect(vancomycin).toContainText("Avaliações (1)");
  await expect(courses.filter({ hasText: "MEROPENEM" })).toContainText(
    "Nenhuma avaliação registrada.",
  );

  // every review, with all it recorded on each drug
  const review = report.getByTestId("report-review");
  await expect(review).toHaveCount(1);
  await expect(review).toContainText("Maria Teste");
  await expect(review).toContainText("Paciente estável, manter vancomicina");
  const evaluation = review.getByTestId("report-evaluation");
  await expect(evaluation).toContainText("Não conforme");
  await expect(evaluation).toContainText("1 g · 12h/12h · IV");
  await expect(evaluation).toContainText(
    "Quando a avaliação vencer; Quando a posologia mudar",
  );
  await expect(evaluation).toContainText("Tempo de tratamento");
  await expect(evaluation).toContainText("CEFTRIAXONA 1 g SOL INJ");
  await expect(evaluation).toContainText("Pendente");
  await expect(evaluation).toContainText("Sem cultura que justifique");

  await expect(page.getByRole("button", { name: "Imprimir" })).toBeVisible();

  // also offered in the page header
  await page
    .getByRole("dialog")
    .filter({ has: report })
    .locator(".ant-modal-footer")
    .getByRole("button", { name: "Fechar" })
    .click();
  await expect(report).toHaveCount(0);
  await pickMoreAction(page, "Relatório");
  await expect(report).toBeVisible();
});

test("shows each conformity record on its course in the timeline", async ({
  page,
  mockApi,
}) => {
  // the vancomycin was first judged non-conforming, then conforming
  const replaced = {
    ...vancomycinEvaluation,
    id: "500",
    idReview: "40",
    conforming: false,
    notes: "Aguardar cultura",
    validFrom: hoursFromNow(-80),
    validUntil: hoursFromNow(48),
    status: 2,
    closedAt: vancomycinEvaluation.createdAt,
    closingType: 1,
    createdAt: hoursFromNow(-80),
  };
  mockPage(
    mockApi,
    followUp({
      courses: [
        {
          idDrug: 11,
          start: MEROPENEM_START,
          ongoing: true,
          evaluation: null,
          history: [],
        },
        {
          idDrug: 12,
          start: VANCOMYCIN_START,
          ongoing: true,
          evaluation: vancomycinEvaluation,
          history: [vancomycinEvaluation, replaced],
        },
      ],
    }),
  );

  await page.goto(PAGE_URL);

  const rows = page.getByTestId("course-row");
  await expect(rows).toHaveCount(2, { timeout: 15000 });
  await expect(
    rows.filter({ hasText: "MEROPENEM" }).getByTestId("course-evaluation"),
  ).toHaveCount(0);

  const marks = rows
    .filter({ hasText: "VANCOMICINA" })
    .getByTestId("course-evaluation");
  // the replaced one is left out until asked for
  await expect(marks).toHaveCount(1);
  const toggle = page.getByTestId("toggle-superseded");
  await expect(page.getByText("Avaliações substituídas (1)")).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  await toggle.click();
  await expect(marks).toHaveCount(2);
  await expect(toggle).toHaveAttribute("aria-checked", "true");

  // latest first, on the line right under the bar; the replaced one stays,
  // in a lighter tone, on the line below it
  await expect(marks.nth(0)).toHaveAttribute(
    "aria-label",
    `Conforme em ${shownDate(vancomycinEvaluation.createdAt)}`,
  );
  await expect(marks.nth(0)).not.toHaveClass(/past/);
  await expect(marks.nth(1)).toHaveAttribute(
    "aria-label",
    `Não conforme em ${shownDate(replaced.createdAt)}`,
  );
  await expect(marks.nth(1)).toHaveClass(/non-conforming/);
  await expect(marks.nth(1)).toHaveClass(/past/);

  const bar = (await rows
    .filter({ hasText: "VANCOMICINA" })
    .getByTestId("course-bar")
    .boundingBox())!;
  const latest = (await marks.nth(0).boundingBox())!;
  const older = (await marks.nth(1).boundingBox())!;
  expect(latest.y).toBeGreaterThan(bar.y + bar.height);
  expect(older.y).toBeGreaterThanOrEqual(latest.y + latest.height);

  await marks.nth(0).hover();
  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toContainText("por Maria Teste");
  await expect(tooltip).toContainText(
    `Válida até ${shownDate(vancomycinEvaluation.validUntil)}`,
  );
  await expect(tooltip).toContainText("Posologia avaliada: 1 g · 12h/12h · IV");
  await expect(tooltip).toContainText("Guiado por cultura");

  // the legend opens from the timeline header
  await page.getByRole("button", { name: "Legenda" }).click();
  await expect(page.getByText("Avaliação conforme (vigência)")).toBeVisible();
});

test("keeps consecutive conformity records on the same line", async ({
  page,
  mockApi,
}) => {
  // non-conforming from today on, and a past period recorded afterwards as
  // conforming up to the end of yesterday: one follows the other
  const current = {
    ...vancomycinEvaluation,
    conforming: false,
    validFrom: `${localDay(0)}T00:00:00`,
    validUntil: hoursFromNow(48),
    createdAt: hoursFromNow(-2),
  };
  const past = {
    ...vancomycinEvaluation,
    id: "502",
    idReview: "42",
    validFrom: hoursFromNow(-90),
    validUntil: `${localDay(-1)}T23:59:59`,
    status: 3,
    closedAt: hoursFromNow(-1),
    closingType: 4,
    createdAt: hoursFromNow(-1),
  };
  mockPage(
    mockApi,
    followUp({
      courses: [
        {
          idDrug: 11,
          start: MEROPENEM_START,
          ongoing: true,
          evaluation: null,
          history: [],
        },
        {
          idDrug: 12,
          start: VANCOMYCIN_START,
          ongoing: true,
          evaluation: current,
          history: [past, current],
        },
      ],
    }),
  );

  await page.goto(PAGE_URL);

  const marks = page
    .getByTestId("course-row")
    .filter({ hasText: "VANCOMICINA" })
    .getByTestId("course-evaluation");
  await expect(marks).toHaveCount(2, { timeout: 15000 });
  await expect(marks.nth(0)).not.toHaveClass(/non-conforming/);
  await expect(marks.nth(1)).toHaveClass(/non-conforming/);

  const pastBox = (await marks.nth(0).boundingBox())!;
  const currentBox = (await marks.nth(1).boundingBox())!;
  expect(currentBox.y).toBe(pastBox.y);
  expect(currentBox.x).toBeGreaterThanOrEqual(pastBox.x + pastBox.width - 1);
});

test("leaves the follow-up out when the schema does not have it", async ({
  page,
}) => {
  // TIMELINE_DATA: { enabled: false }
  await page.goto(PAGE_URL);

  await expect(page.getByTestId("course-row")).toHaveCount(2, {
    timeout: 15000,
  });
  await expect(page.getByTestId("follow-up")).toHaveCount(0);
  await expect(page.getByTestId("course-evaluation")).toHaveCount(0);
});

test("says so when the follow-up fails to load and can retry", async ({
  page,
  mockApi,
}) => {
  // the follow-up failed on the server: the timeline comes without it
  mockPage(mockApi, { data: null });
  let retried = 0;
  mockApi.override(FOLLOW_UP, async (route) => {
    retried += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(followUp()),
    });
  });

  await page.goto(PAGE_URL);

  // not taken for a schema without the follow-up: the timeline still shows,
  // next to the error
  const error = page.getByTestId("follow-up-error");
  await expect(error).toContainText(
    "Não foi possível carregar o acompanhamento do controle de infecção.",
    { timeout: 15000 },
  );
  await expect(page.getByTestId("course-row")).toHaveCount(2);

  // the retry loads the follow-up alone
  expect(retried).toBe(0);
  await error.getByRole("button", { name: "Tentar novamente" }).click();

  await expect(page.getByTestId("follow-up-status")).toHaveText("Pendente");
  await expect(error).toHaveCount(0);
  expect(retried).toBe(1);
});

test("does not offer to review nor follow an admission not followed without permission", async ({
  page,
  mockApi,
}) => {
  mockPage(mockApi, notFollowed());

  await page.goto(PAGE_URL);

  const box = page.getByTestId("follow-up");
  await expect(box.getByTestId("follow-up-status")).toHaveText(
    "Não acompanhado",
    { timeout: 15000 },
  );
  await expect(
    (await openMoreActions(page)).getByRole("menuitem", {
      name: "Iniciar acompanhamento",
    }),
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Revisar" })).toHaveCount(0);
});

test.describe("with WRITE_INFECTION_CONTROL", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page, mockApi }) => {
    await loginWithPermissions(page, mockApi, [
      ...BASE_PERMISSIONS,
      "WRITE_INFECTION_CONTROL",
    ]);
    mockApi.override("GET /intervention/reasons", {
      json: { status: "success", data: REASONS },
    });
  });

  test("shows the screening alerts of the drug being evaluated", async ({
    page,
    mockApi,
  }) => {
    const [meropenem, vancomycin] = TIMELINE_DATA.data.courses;
    mockPage(mockApi, followUp(), {
      ...TIMELINE_DATA,
      data: {
        ...TIMELINE_DATA.data,
        courses: [
          {
            ...meropenem,
            idSubstance: null,
            alerts: [
              {
                idPrescriptionDrug: "299001",
                key: "",
                type: "kidney",
                level: "medium",
                text: "Medicamento deve sofrer ajuste renal",
                handling: false,
              },
            ],
          },
          { ...vancomycin, idSubstance: null, alerts: [] },
        ],
      },
    });

    await page.goto(PAGE_URL);
    await page
      .getByRole("button", { name: "Revisar" })
      .click({ timeout: 15000 });

    const drug = page.getByRole("dialog").getByTestId("review-drug");
    await expect(drug.getByRole("heading", { level: 3 })).toHaveText(
      "MEROPENEM 1 g SOL INJ",
    );
    // a chip beside the drug counts them by level, the drawer lists them
    const chip = drug.getByTestId("review-alerts-chip");
    await expect(chip).toContainText("Alertas");
    await expect(chip.getByTestId("review-alerts-chip-medium")).toHaveText("1");
    await expect(drug.getByTestId("review-pendings-chip")).toHaveCount(0);
    await chip.click();
    const alerts = page.getByTestId("review-alerts");
    const alert = alerts.getByTestId("review-alert");
    await expect(alert).toContainText("Médio");
    await expect(alert).toContainText("Ajuste Renal");
    await expect(alert).toContainText("Medicamento deve sofrer ajuste renal");

    // Escape closes the drawer, not the review
    await page.keyboard.press("Escape");
    await expect(alerts).toHaveCount(0);
    await expect(drug).toBeVisible();
  });

  test("registers a review evaluating the drug without evaluation", async ({
    page,
    mockApi,
  }) => {
    mockPage(mockApi, followUp());
    let sent: any = null;
    mockApi.override(REVIEW, async (route) => {
      sent = JSON.parse(route.request().postData()!);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          followUp({ status: 2, statusDate: hoursFromNow(0), pendings: [] }),
        ),
      });
    });

    await page.goto(PAGE_URL);
    await page
      .getByRole("button", { name: "Revisar" })
      .click({ timeout: 15000 });

    const dialog = page.getByRole("dialog");
    const next = dialog.getByRole("button", { name: "Próximo" });
    const drug = dialog.getByTestId("review-drug");
    const decisions = drug.getByRole("radiogroup", { name: "Avaliação" });
    const skip = decisions.getByRole("radio", { name: new RegExp(`^${SKIP}`) });
    const expiryBox = drug.getByRole("checkbox", { name: WATCH_EXPIRY });
    const posologyBox = drug.getByRole("checkbox", { name: WATCH_POSOLOGY });
    const hint = dialog.getByTestId("review-hint");

    // one step per running drug, then the patient
    await expect(dialog.getByTestId("review-rail-drug")).toHaveCount(2);
    await expect(dialog.getByTestId("review-rail-patient")).toHaveCount(1);
    await expect(dialog.getByText("Etapa 1 de 3")).toBeVisible();

    // step 1: the drug without an evaluation is to be evaluated, with its
    // timeline
    await expect(drug.getByRole("heading", { level: 3 })).toHaveText(
      "MEROPENEM 1 g SOL INJ",
    );
    await expect(decisions.getByRole("radio", { checked: true })).toHaveCount(
      0,
    );
    await expect(dialog.getByTestId("review-rail-drug").first()).toContainText(
      "A avaliar",
    );
    const timeline = drug.getByTestId("review-timeline");
    await expect(timeline.getByTestId("course-row")).toHaveCount(1);
    // the step names the drug, its timeline shows only the day of treatment
    await expect(timeline.getByTestId("course-row")).toHaveText(/^D3/);

    // the verdict is required to move on
    const MEROPENEM_PLUS_7 = localDay(7, MEROPENEM_START);
    await expect(next).toBeDisabled();
    await expect(hint).toHaveText("Selecione uma avaliação para continuar");

    // the timeline plots the evaluation as it is filled: grey until the
    // verdict comes
    const draft = timeline.getByTestId("draft-evaluation");
    await expect(draft).toHaveClass(/undecided/);
    await decisions.getByText("Não conforme", { exact: true }).click();
    await expect(draft).toHaveClass(/non-conforming/);
    // what each verdict means is told on hover
    await decisions.getByText("Não conforme", { exact: true }).hover();
    await expect(page.getByRole("tooltip")).toHaveText("Exige justificativa");
    await page.mouse.move(0, 0);

    // it starts at the course start and holds until the treatment ends,
    // told in a line until chosen otherwise
    await expect(drug.getByTestId("review-validity")).toContainText(
      `Vigência da avaliação: ${shownDate(MEROPENEM_START).slice(0, 5)} → ${shownDate(MEROPENEM_END).slice(0, 5)}`,
    );
    await expect(drug.getByRole("radiogroup", { name: "Início" })).toHaveCount(
      0,
    );
    await openValidity(drug);
    await expect(
      drug
        .getByRole("radiogroup", { name: "Início" })
        .getByRole("radio", { checked: true }),
    ).toHaveAccessibleName(
      `Início do tratamento ${shownDate(MEROPENEM_START).slice(0, 5)}`,
    );
    const validity = drug.getByRole("radiogroup", { name: "Válida até" });
    await expect(
      validity.getByRole("radio", { checked: true }),
    ).toHaveAccessibleName(
      `Fim do tratamento ${shownDate(MEROPENEM_END).slice(0, 5)}`,
    );

    // expiry and a posology change send it back to pending unless unchecked,
    // counted until opened
    const triggersCount = drug.getByTestId("review-triggers-count");
    await expect(drug.getByTestId("review-triggers")).toContainText(
      "Gatilhos de pendência:",
    );
    await expect(triggersCount).toHaveText("2 ativos");
    await expect(expiryBox).toHaveCount(0);
    await drug
      .getByTestId("review-triggers")
      .getByRole("button", { name: "Alterar" })
      .click();
    await expect(expiryBox).toBeChecked();
    await expect(posologyBox).toBeChecked();
    await expiryBox.uncheck();
    await expect(triggersCount).toHaveText("1 ativo");
    await posologyBox.uncheck();
    await expect(triggersCount).toHaveText("Nenhum ativo");
    await expiryBox.check();
    await posologyBox.check();

    await validity.getByText("+7 dias", { exact: true }).click();
    await expect(drug.getByTestId("review-period")).toHaveText(
      `${shownDate(MEROPENEM_START).slice(0, 5)} → ${shownDate(MEROPENEM_PLUS_7).slice(0, 5)} · 8 dias`,
    );
    await draft.hover();
    await expect(page.getByRole("tooltip")).toContainText(
      "Nova avaliação (não salva)",
    );
    await expect(page.getByRole("tooltip")).toContainText(
      `Válida até ${shownDate(MEROPENEM_PLUS_7)}`,
    );
    // a non-conformity is given its reasons, among the ones enabled for
    // infection control
    await expect(next).toBeDisabled();
    await expect(hint).toHaveText("Informe o motivo da não conformidade");
    await openSelect(drug.getByTestId("review-reasons"));
    await expect(
      page.locator(
        ".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option",
      ),
    ).toHaveText([
      "Antimicrobiano - Espectro inadequado",
      "Tempo de tratamento",
      "Trocar antimicrobiano",
    ]);
    await drug.getByRole("heading", { level: 3 }).click();
    await pickReason(page, drug, "Antimicrobiano - Espectro inadequado");
    await pickReason(page, drug, "Tempo de tratamento");

    // and justified
    await expect(hint).toHaveText("Informe a justificativa");
    await drug
      .getByLabel("Justificativa", { exact: true })
      .fill("Espectro amplo demais");
    await expect(hint).toHaveCount(0);

    // an intervention on the drug is recorded only when asked
    const createIntervention = drug.getByRole("checkbox", {
      name: "Registrar intervenção no medicamento",
    });
    await expect(createIntervention).not.toBeChecked();
    await createIntervention.check();
    await expect(drug.getByTestId("review-create-intervention")).toContainText(
      "só pode ser alterada pelo controle de infecção",
    );
    await next.click();

    // step 2: the evaluated drug shows its current evaluation, kept
    await expect(drug.getByRole("heading", { level: 3 })).toHaveText(
      "VANCOMICINA 500 mg SOL INJ",
    );
    await expect(skip).toBeChecked();
    await expect(drug.getByTestId("review-skip-notice")).toContainText(
      "mantém a avaliação atual",
    );
    await expect(drug).toContainText("Guiado por cultura");
    const vancomycinTimeline = drug.getByTestId("review-timeline");
    const current = vancomycinTimeline.getByTestId("course-evaluation");
    await expect(current).toHaveCount(1);
    await expect(current).not.toHaveClass(/past/);

    // evaluating it again previews the new one replacing the current from now
    await decisions.getByText("Conforme", { exact: true }).click();
    await expect(drug.getByTestId("review-period")).toContainText(
      `→ ${shownDate(VANCOMYCIN_END).slice(0, 5)}`,
    );
    await expect(
      vancomycinTimeline.getByTestId("draft-evaluation"),
    ).toHaveClass(/conforming/);
    await expect(current).toHaveClass(/past/);
    await decisions.getByText(SKIP, { exact: true }).click();
    await expect(
      vancomycinTimeline.getByTestId("draft-evaluation"),
    ).toHaveCount(0);
    await expect(current).not.toHaveClass(/past/);
    await next.click();

    // last step: the next review, its notes and what the review records
    const summary = dialog.getByTestId("review-summary");
    await expect(summary).toContainText(
      `Vigência ${shownDate(MEROPENEM_START)} → ${shownDate(MEROPENEM_PLUS_7)} · 8 dias`,
    );
    await expect(summary).toContainText("Não conforme");
    await expect(summary).toContainText("Mantém a avaliação atual");
    await expect(next).toHaveCount(0);
    await expect(dialog.getByTestId("review-rail-patient")).toHaveAttribute(
      "aria-current",
      "step",
    );
    // both drugs are done
    await expect(
      dialog.getByTestId("review-rail-drug").locator(".anticon-check"),
    ).toHaveCount(2);
    await dialog
      .getByLabel("Observação sobre o paciente")
      .fill("Sugerido descalonamento");

    expect(sent).toBeNull();
    await dialog.getByRole("button", { name: "Registrar revisão" }).click();

    await expect(
      page.getByText("Revisão registrada com sucesso!"),
    ).toBeVisible();
    expect(sent).toMatchObject({
      admissionNumber: ADMISSION,
      notes: "Sugerido descalonamento",
      nextReviewDate: null,
      evaluations: [
        {
          idDrug: 11,
          conforming: false,
          interventionReasons: [31, 32],
          createIntervention: true,
          notes: "Espectro amplo demais",
          validFrom: MEROPENEM_START,
          // through the whole day
          validUntil: `${MEROPENEM_PLUS_7}T23:59:59`,
          triggers: [3, 6],
        },
      ],
    });

    // the page shows the follow-up the save returned
    await expect(dialog).toHaveCount(0);
    await expect(page.getByTestId("follow-up-status")).toHaveText("Revisado");
    await expect(page.getByTestId("follow-up-pendings")).toContainText(
      "Nenhuma pendência",
    );
  });

  test("chooses when an evaluation starts and until when it holds", async ({
    page,
    mockApi,
  }) => {
    mockPage(mockApi, followUp());
    let sent: any = null;
    mockApi.override(REVIEW, async (route) => {
      sent = JSON.parse(route.request().postData()!);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(followUp({ status: 2, pendings: [] })),
      });
    });

    await page.goto(PAGE_URL);
    await page
      .getByRole("button", { name: "Revisar" })
      .click({ timeout: 15000 });

    const dialog = page.getByRole("dialog");
    const next = dialog.getByRole("button", { name: "Próximo" });
    const drug = dialog.getByTestId("review-drug");
    const decisions = drug.getByRole("radiogroup", { name: "Avaliação" });
    const start = drug.getByRole("radiogroup", { name: "Início" });
    const validity = drug.getByRole("radiogroup", { name: "Válida até" });
    const draft = drug.getByTestId("draft-evaluation");

    // meropenem: the defaults, from the course start to the treatment end
    await decisions.getByText("Conforme", { exact: true }).click();
    await draft.hover();
    await expect(page.getByRole("tooltip")).toContainText("Vale desde");
    await next.click();

    // vancomycin: now, until a chosen day
    await expect(drug.getByRole("heading", { level: 3 })).toHaveText(
      "VANCOMICINA 500 mg SOL INJ",
    );
    await decisions.getByText("Não conforme", { exact: true }).click();
    await pickReason(page, drug, "Tempo de tratamento");
    await drug.getByLabel("Justificativa", { exact: true }).fill("Sem cultura");
    await openValidity(drug);
    await start.getByText("Agora", { exact: true }).click();
    await validity.getByText("Outra data", { exact: true }).click();
    // a chosen day is required once picked
    await expect(next).toBeDisabled();
    await expect(drug.getByTestId("review-period")).toHaveText(
      "Selecione as datas",
    );
    await expect(dialog.getByTestId("review-hint")).toHaveText(
      "Revise a vigência",
    );
    const until = drug.getByRole("textbox", { name: "Válida até" });
    await until.fill(shownDate(localDay(3)));
    // Enter takes the typed day and moves on
    await until.press("Enter");

    const summary = dialog.getByTestId("review-summary");
    await expect(summary).toContainText(
      new RegExp(
        `Vigência ${shownDate(MEROPENEM_START)} → ${shownDate(MEROPENEM_END)} · \\d+ dias?`,
      ),
    );
    await expect(summary).toContainText(
      `Vigência ${shownDate(localDay(0))} → ${shownDate(localDay(3))} · 4 dias`,
    );
    await dialog.getByRole("button", { name: "Registrar revisão" }).click();

    await expect(
      page.getByText("Revisão registrada com sucesso!"),
    ).toBeVisible();
    expect(sent.evaluations).toMatchObject([
      {
        idDrug: 11,
        // a conforming one has no reason
        interventionReasons: [],
        createIntervention: false,
        validFrom: MEROPENEM_START,
        validUntil: `${MEROPENEM_END.slice(0, 10)}T23:59:59`,
      },
      {
        idDrug: 12,
        interventionReasons: [32],
        createIntervention: false,
        validFrom: null,
        validUntil: `${localDay(3)}T23:59:59`,
      },
    ]);
  });

  test("asks for the substitute drug a reason requires", async ({
    page,
    mockApi,
  }) => {
    mockPage(mockApi, followUp());
    let sent: any = null;
    mockApi.override(REVIEW, async (route) => {
      sent = JSON.parse(route.request().postData()!);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(followUp({ status: 2, pendings: [] })),
      });
    });
    const searches: string[] = [];
    mockApi.override("GET /infection-control/antimicrobials", async (route) => {
      searches.push(new URL(route.request().url()).searchParams.get("q")!);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "success",
          data: [
            { id: 21, name: "CEFTRIAXONA 1 g SOL INJ" },
            { id: 22, name: "CEFEPIMA 2 g SOL INJ" },
          ],
        }),
      });
    });

    await page.goto(PAGE_URL);
    await page
      .getByRole("button", { name: "Revisar" })
      .click({ timeout: 15000 });

    const dialog = page.getByRole("dialog");
    const next = dialog.getByRole("button", { name: "Próximo" });
    const drug = dialog.getByTestId("review-drug");
    const heading = drug.getByRole("heading", { level: 3 });
    const substitute = drug.getByTestId("review-substitute");

    await drug
      .getByRole("radiogroup", { name: "Avaliação" })
      .getByText("Não conforme", { exact: true })
      .click();
    await drug.getByLabel("Justificativa", { exact: true }).fill("Descalonar");
    // a reason with no relation asks for no substitute
    await pickReason(page, drug, "Tempo de tratamento");
    await expect(substitute).toHaveCount(0);

    await pickReason(page, drug, "Trocar antimicrobiano");
    await expect(substitute).toContainText("obrigatório");
    await expect(next).toBeDisabled();
    await expect(dialog.getByTestId("review-hint")).toHaveText(
      "Informe o medicamento substituto",
    );

    // searched from the third letter, picked with Enter, which stays here
    const search = substitute.getByRole("combobox");
    await search.click();
    await search.pressSequentially("ce");
    await search.pressSequentially("f");
    await expect(
      page.locator(
        ".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option",
      ),
    ).toHaveCount(2);
    await search.press("Enter");
    await expect(substitute).toContainText("CEFTRIAXONA 1 g SOL INJ");
    await expect(heading).toHaveText("MEROPENEM 1 g SOL INJ");
    expect(searches).toEqual(["cef"]);

    await expect(next).toBeEnabled();
    await next.click();
    await expect(heading).toHaveText("VANCOMICINA 500 mg SOL INJ");
    await drug
      .getByRole("radiogroup", { name: "Avaliação" })
      .getByText("Conforme", { exact: true })
      .click();
    await next.click();
    await dialog.getByRole("button", { name: "Registrar revisão" }).click();

    await expect(
      page.getByText("Revisão registrada com sucesso!"),
    ).toBeVisible();
    expect(sent.evaluations).toMatchObject([
      { idDrug: 11, interventionReasons: [32, 33], substituteDrug: 21 },
      { idDrug: 12, interventionReasons: [], substituteDrug: null },
    ]);
  });

  test("records a conformity whose validity is already over", async ({
    page,
    mockApi,
  }) => {
    // started 12 days ago, its prescription expired yesterday
    const OLD_START = hoursFromNow(-12 * 24);
    const OLD_END = hoursFromNow(-30);
    const timeline = {
      ...TIMELINE_DATA,
      data: {
        ...TIMELINE_DATA.data,
        courses: [
          course({
            idDrug: 12,
            drug: "VANCOMICINA 500 mg SOL INJ",
            start: OLD_START,
            end: OLD_END,
            days: 12,
          }),
        ],
      },
    };
    mockPage(
      mockApi,
      followUp({
        courses: [
          {
            idDrug: 12,
            start: OLD_START,
            ongoing: true,
            evaluation: null,
            history: [],
          },
        ],
      }),
      timeline,
    );
    let sent: any = null;
    mockApi.override(REVIEW, async (route) => {
      sent = JSON.parse(route.request().postData()!);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(followUp()),
      });
    });

    await page.goto(PAGE_URL);
    await page
      .getByRole("button", { name: "Revisar" })
      .click({ timeout: 15000 });

    const dialog = page.getByRole("dialog");
    const drug = dialog.getByTestId("review-drug");
    const next = dialog.getByRole("button", { name: "Próximo" });
    const start = drug.getByRole("radiogroup", { name: "Início" });
    const validity = drug.getByRole("radiogroup", { name: "Válida até" });
    const treatmentEnd = validity.getByRole("radio", {
      name: /^Fim do tratamento/,
    });
    const plus7 = validity.getByRole("radio", { name: /^\+7 dias/ });
    const pastNotice = drug.getByTestId("review-end-past");
    await drug
      .getByRole("radiogroup", { name: "Avaliação" })
      .getByText("Conforme", { exact: true })
      .click();

    // from the course start to the treatment end, both past: recorded
    // already expired, which keeps the patient pending while it watches
    // the expiry
    await expect(pastNotice).toContainText("o paciente continua pendente");
    await openValidity(drug);
    await expect(treatmentEnd).toBeChecked();
    await drug
      .getByTestId("review-triggers")
      .getByRole("button", { name: "Alterar" })
      .click();
    await drug.getByRole("checkbox", { name: WATCH_EXPIRY }).uncheck();
    await expect(pastNotice).toHaveText(
      "Esta data já passou: a conformidade é registrada já vencida.",
    );
    await expect(plus7).toHaveAccessibleName(
      `+7 dias ${shownDate(localDay(7, OLD_START)).slice(0, 5)}`,
    );

    // starting now, the treatment end is behind it
    await start.getByText("Agora", { exact: true }).click();
    await expect(treatmentEnd).toBeDisabled();
    await expect(drug.getByTestId("review-period")).toHaveText(
      "Data final antes do início",
    );
    await expect(next).toBeDisabled();
    await validity.getByText("+7 dias", { exact: true }).click();
    await expect(drug.getByTestId("review-period")).toHaveText(/· 8 dias$/);
    await expect(pastNotice).toHaveCount(0);

    // back to the course start, 7 days from it are over too
    await start.getByText("Início do tratamento", { exact: true }).click();
    await expect(pastNotice).toBeVisible();
    await next.click();
    await dialog.getByRole("button", { name: "Registrar revisão" }).click();

    await expect(
      page.getByText("Revisão registrada com sucesso!"),
    ).toBeVisible();
    expect(sent.evaluations).toMatchObject([
      {
        idDrug: 12,
        validFrom: OLD_START,
        validUntil: `${localDay(7, OLD_START)}T23:59:59`,
        triggers: [6],
      },
    ]);
  });

  test("keeps the conformity in force when recording one over before it", async ({
    page,
    mockApi,
  }) => {
    const vancomycinOnly = (history: unknown[]) =>
      followUp({
        pendings: [],
        courses: [
          {
            idDrug: 12,
            start: VANCOMYCIN_START,
            ongoing: true,
            evaluation: vancomycinEvaluation,
            history,
          },
        ],
      });
    const PAST_END = localDay(-3);
    // as the backend saves it: straight to the history, closed as retroactive
    const retroactive = {
      ...vancomycinEvaluation,
      id: "502",
      idReview: "42",
      conforming: false,
      validFrom: VANCOMYCIN_START,
      validUntil: `${PAST_END}T23:59:59`,
      status: 3,
      closedAt: hoursFromNow(0),
      closingType: 4,
      createdAt: hoursFromNow(0),
    };
    mockPage(mockApi, vancomycinOnly([vancomycinEvaluation]));
    let sent: any = null;
    mockApi.override(REVIEW, async (route) => {
      sent = JSON.parse(route.request().postData()!);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          vancomycinOnly([retroactive, vancomycinEvaluation]),
        ),
      });
    });

    await page.goto(PAGE_URL);
    await page
      .getByRole("button", { name: "Revisar" })
      .click({ timeout: 15000 });

    const dialog = page.getByRole("dialog");
    const drug = dialog.getByTestId("review-drug");
    const validity = drug.getByRole("radiogroup", { name: "Válida até" });
    const current = drug
      .getByTestId("review-timeline")
      .getByTestId("course-evaluation");
    const historyNotice = drug.getByTestId("review-end-history");

    await drug
      .getByRole("radiogroup", { name: "Avaliação" })
      .getByText("Não conforme", { exact: true })
      .click();
    await pickReason(page, drug, "Tempo de tratamento");
    await drug
      .getByLabel("Justificativa", { exact: true })
      .fill("Sem indicação no período");
    // overlapping the current one, the new one replaces it, and may record
    // an intervention
    await drug
      .getByRole("checkbox", { name: "Registrar intervenção no medicamento" })
      .check();
    await expect(current).toHaveClass(/past/);
    await expect(historyNotice).toHaveCount(0);

    // from the course start up to a day before the current one started
    await openValidity(drug);
    await validity.getByText("Outra data", { exact: true }).click();
    const until = drug.getByRole("textbox", { name: "Válida até" });
    await until.fill(shownDate(PAST_END));
    await until.press("Enter");

    const summary = dialog.getByTestId("review-summary");
    await expect(summary).toContainText(
      new RegExp(
        `Vigência ${shownDate(VANCOMYCIN_START)} → ${shownDate(PAST_END)} · \\d+ dias? · só no histórico`,
      ),
    );

    // back on the drug: the current one stays in force
    await summary
      .getByRole("button", { name: "Editar VANCOMICINA 500 mg SOL INJ" })
      .click();
    await expect(historyNotice).toContainText(
      `Termina antes da avaliação atual (desde ${shownDate(vancomycinEvaluation.validFrom)})`,
    );
    // a record of the past records no intervention: it would land on the
    // drug prescribed now
    await expect(drug.getByTestId("review-create-intervention")).toHaveCount(0);
    await expect(current).not.toHaveClass(/past/);
    await expect(drug.getByTestId("review-end-past")).toHaveCount(0);
    // they do not overlap: one line for both
    const draftBox = (await drug
      .getByTestId("draft-evaluation")
      .boundingBox())!;
    const currentBox = (await current.boundingBox())!;
    expect(draftBox.y + draftBox.height / 2).toBeCloseTo(
      currentBox.y + currentBox.height / 2,
      0,
    );

    await dialog.getByRole("button", { name: "Próximo" }).click();
    await dialog.getByRole("button", { name: "Registrar revisão" }).click();
    await expect(
      page.getByText("Revisão registrada com sucesso!"),
    ).toBeVisible();
    expect(sent.evaluations).toMatchObject([
      {
        idDrug: 12,
        conforming: false,
        interventionReasons: [32],
        createIntervention: false,
        validFrom: VANCOMYCIN_START,
        validUntil: `${PAST_END}T23:59:59`,
      },
    ]);

    // the timeline keeps the current one and shows the retroactive record
    const marks = page
      .getByTestId("course-row")
      .filter({ hasText: "VANCOMICINA" })
      .getByTestId("course-evaluation");
    await expect(marks).toHaveCount(2);
    await expect(marks.nth(1)).not.toHaveClass(/past/);
    await expect(marks.nth(0)).toHaveClass(/past/);
    // on the same line, as they do not overlap
    const retroBox = (await marks.nth(0).boundingBox())!;
    const inForceBox = (await marks.nth(1).boundingBox())!;
    expect(retroBox.y).toBe(inForceBox.y);
    await marks.nth(0).hover();
    await expect(page.getByRole("tooltip")).toContainText(
      `Registro retroativo, válida até ${shownDate(PAST_END)}`,
    );
  });

  test("keeps the modal open and shows the error when the save fails", async ({
    page,
    mockApi,
  }) => {
    mockPage(mockApi, followUp());
    mockApi.override(REVIEW, {
      status: 400,
      json: {
        status: "error",
        message: "Antimicrobiano não está em uso neste atendimento",
        code: "errors.invalidParams",
      },
    });

    await page.goto(PAGE_URL);
    await page
      .getByRole("button", { name: "Revisar" })
      .click({ timeout: 15000 });

    const dialog = page.getByRole("dialog");
    const next = dialog.getByRole("button", { name: "Próximo" });
    // nothing evaluated: a review that only records the visit
    await dialog
      .getByTestId("review-drug")
      .getByText(SKIP, { exact: true })
      .click();
    await next.click();
    await next.click();
    await dialog.getByRole("button", { name: "Registrar revisão" }).click();

    await expect(
      page.getByText("Antimicrobiano não está em uso neste atendimento"),
    ).toBeVisible();
    await expect(dialog).toBeVisible();
    await expect(page.getByTestId("follow-up-status")).toHaveText("Pendente");
  });

  test("shows the posology with the dose per Kg, like the screening", async ({
    page,
    mockApi,
  }) => {
    const timeline = {
      ...TIMELINE_DATA,
      data: {
        ...TIMELINE_DATA.data,
        courses: [
          course({
            idDrug: 11,
            drug: "MEROPENEM 1 g SOL INJ",
            start: MEROPENEM_START,
            end: MEROPENEM_END,
            days: 3,
            regimens: [
              {
                start: MEROPENEM_START,
                end: MEROPENEM_END,
                dose: 2,
                measureUnit: "FRASCO AMPOLA",
                frequency: "8h/8h",
                route: "IV",
                doseWeight: "0,03 FRASCO AMPOLA/Kg ou 31,25 mg/Kg",
                doseWeightDay: "0,09 FRASCO AMPOLA/Kg/Dia ou 93,75 mg/Kg/Dia",
              },
            ],
          }),
          // no patient weight on record: no dose per Kg
          course({
            idDrug: 12,
            drug: "VANCOMICINA 500 mg SOL INJ",
            start: VANCOMYCIN_START,
            end: VANCOMYCIN_END,
            days: 5,
            regimens: [
              {
                start: VANCOMYCIN_START,
                end: VANCOMYCIN_END,
                dose: 1,
                measureUnit: "g",
                frequency: "12h/12h",
                route: "IV",
                doseWeight: null,
                doseWeightDay: null,
              },
            ],
          }),
        ],
      },
    };
    mockPage(mockApi, followUp(), timeline);

    await page.goto(PAGE_URL);
    await page
      .getByRole("button", { name: "Revisar" })
      .click({ timeout: 15000 });

    const dialog = page.getByRole("dialog");
    const drug = dialog.getByTestId("review-drug");
    await expect(drug.getByRole("heading", { level: 3 })).toHaveText(
      "MEROPENEM 1 g SOL INJ",
    );
    await expect(drug.getByText("2 FRASCO AMPOLA · 8h/8h · IV")).toBeVisible();
    // the dose by weight is shown on demand
    await expect(drug.getByTestId("review-dose-weight")).toHaveCount(0);
    await drug.getByRole("button", { name: "Dose/kg" }).click();
    await expect(drug.getByTestId("review-dose-weight")).toHaveText(
      "0,03 FRASCO AMPOLA/Kg ou 31,25 mg/Kg · 0,09 FRASCO AMPOLA/Kg/Dia ou 93,75 mg/Kg/Dia",
    );

    await drug
      .getByRole("radiogroup", { name: "Avaliação" })
      .getByText("Conforme", { exact: true })
      .click();
    await dialog.getByRole("button", { name: "Próximo" }).click();
    await expect(drug.getByRole("heading", { level: 3 })).toHaveText(
      "VANCOMICINA 500 mg SOL INJ",
    );
    await expect(drug.getByText("1 g · 12h/12h · IV")).toBeVisible();
    await expect(drug.getByTestId("review-dose-weight")).toHaveCount(0);
    await expect(drug.getByRole("button", { name: "Dose/kg" })).toHaveCount(0);
  });

  test("selects the drug whose posology changed and keeps its trigger choice", async ({
    page,
    mockApi,
  }) => {
    // changed twice since the evaluation: the reason kept the first change,
    // the course has the posology prescribed now
    const POSOLOGY_CHANGE = hoursFromNow(-3);
    const timeline = {
      ...TIMELINE_DATA,
      data: {
        ...TIMELINE_DATA.data,
        courses: [
          course({
            idDrug: 12,
            drug: "VANCOMICINA 500 mg SOL INJ",
            start: VANCOMYCIN_START,
            end: VANCOMYCIN_END,
            days: 5,
            regimens: [
              {
                start: VANCOMYCIN_START,
                end: POSOLOGY_CHANGE,
                dose: 1,
                measureUnit: "g",
                frequency: "12h/12h",
                route: "IV",
              },
              {
                start: POSOLOGY_CHANGE,
                end: VANCOMYCIN_END,
                dose: 2,
                measureUnit: "g",
                frequency: "6h/6h",
                route: "IV",
              },
            ],
          }),
        ],
      },
    };
    mockPage(
      mockApi,
      followUp({
        pendings: [
          {
            id: "802",
            type: 6,
            origin: 2,
            idDrug: 12,
            idPrescription: "300",
            details: {
              drug: "VANCOMICINA 500 mg SOL INJ",
              evaluated: vancomycinEvaluation.posology,
              current: {
                ...vancomycinEvaluation.posology,
                idPrescriptionDrug: "300001",
                dose: 2,
                doseconv: 2,
                frequency: "8h/8h",
                dailyFrequency: 3,
              },
            },
            createdAt: hoursFromNow(-2),
          },
        ],
        courses: [
          {
            idDrug: 12,
            start: VANCOMYCIN_START,
            ongoing: true,
            evaluation: { ...vancomycinEvaluation, triggers: [6] },
            history: [{ ...vancomycinEvaluation, triggers: [6] }],
          },
        ],
      }),
      timeline,
    );
    let sent: any = null;
    mockApi.override(REVIEW, async (route) => {
      sent = JSON.parse(route.request().postData()!);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(followUp({ status: 2, pendings: [] })),
      });
    });

    await page.goto(PAGE_URL);
    await page.getByTestId("follow-up-pendings-count").click({
      timeout: 15000,
    });
    await expect(page.getByTestId("follow-up-pendings-list")).toContainText(
      "Posologia de VANCOMICINA 500 mg SOL INJ alterada",
    );
    await page.keyboard.press("Escape");

    // the conforming verdict no longer holds: the timeline band stays green
    // up to when the posology changed, in the pending color from then on
    const mark = page
      .getByTestId("course-row")
      .filter({ hasText: "VANCOMICINA" })
      .getByTestId("course-evaluation");
    await expect(mark).toHaveClass(/invalidated/);
    await expect(mark).not.toHaveClass(/past/);
    await expect(mark).toHaveCSS("background-color", "rgb(56, 158, 13)");
    await expect(mark).toHaveCSS(
      "background-image",
      /linear-gradient\(to right, rgba\(0, 0, 0, 0\) \d+(\.\d+)?%, rgb\(255, 169, 64\)/,
    );
    await mark.hover();
    await expect(page.getByRole("tooltip")).toContainText(
      "Não vale mais desde",
    );
    await expect(page.getByRole("tooltip")).toContainText("posologia alterada");

    // a mark where it turned pending tells what changed
    const pendingMark = page
      .getByTestId("course-row")
      .filter({ hasText: "VANCOMICINA" })
      .getByTestId("evaluation-pending");
    await expect(pendingMark).toHaveCount(1);
    await pendingMark.hover();
    const pendingTooltip = page
      .getByRole("tooltip")
      .filter({ hasText: "Pendente desde" });
    await expect(pendingTooltip).toContainText("A posologia mudou");
    await expect(pendingTooltip).toContainText("Avaliada:");
    await expect(pendingTooltip).toContainText("Prescrita agora:");
    await page.mouse.move(0, 0);

    await page.getByRole("button", { name: "Revisar" }).click();

    // evaluated before, but its posology changed: it is to be evaluated,
    // with the triggers chosen last time (posology, not expiry)
    const dialog = page.getByRole("dialog");
    const drug = dialog.getByTestId("review-drug");
    const decisions = drug.getByRole("radiogroup", { name: "Avaliação" });
    await expect(decisions.getByRole("radio", { checked: true })).toHaveCount(
      0,
    );

    // the header leaves the verdict on record to the drawer
    await expect(drug.getByTestId("evaluation-tag")).toHaveCount(0);
    // a chip beside the drug counts the reasons, the drawer has the verdict
    // and why
    const chip = drug.getByTestId("review-pendings-chip");
    await expect(chip).toHaveText("1 pendência");
    await chip.click();
    const pendings = page.getByTestId("review-pendings");
    const current = pendings.getByTestId("review-current-evaluation");
    await expect(current).toContainText("Avaliação atual");
    await expect(current.locator("s")).toHaveText("Conforme");
    await expect(pendings).toContainText(
      "Esta avaliação não vale mais e mantém o paciente pendente",
    );
    await expect(pendings).toContainText("Avaliada: 1 g · 12h/12h · IV");
    await expect(pendings).toContainText("Prescrita agora: 2 g · 6h/6h · IV");
    await page.keyboard.press("Escape");
    await expect(pendings).toHaveCount(0);

    // the mini timeline shows it as the page does, even while the new one
    // being filled takes over from now on
    const modalMark = drug.getByTestId("course-evaluation");
    await expect(modalMark).toHaveClass(/invalidated/);
    await expect(modalMark).not.toHaveClass(/past/);
    await expect(drug.getByTestId("evaluation-pending")).toHaveCount(1);
    await drug.getByTestId("evaluation-pending").hover();
    await expect(
      page.getByRole("tooltip").filter({ hasText: "Pendente desde" }),
    ).toContainText("A posologia mudou");
    await page.mouse.move(0, 0);

    await decisions.getByText("Conforme", { exact: true }).click();
    const triggers = drug.getByTestId("review-triggers");
    await expect(triggers.getByTestId("review-triggers-count")).toHaveText(
      "1 ativo",
    );
    await triggers.getByRole("button", { name: "Alterar" }).click();
    const posologyBox = drug.getByRole("checkbox", { name: WATCH_POSOLOGY });
    await expect(posologyBox).toBeChecked();
    const expiryBox = drug.getByRole("checkbox", { name: WATCH_EXPIRY });
    await expect(expiryBox).not.toBeChecked();

    await openValidity(drug);
    await drug
      .getByRole("radiogroup", { name: "Válida até" })
      .getByText("+10 dias", { exact: true })
      .click();
    await posologyBox.uncheck();
    await expiryBox.check();
    // from a chosen day; Enter takes it and moves on
    await drug
      .getByRole("radiogroup", { name: "Início" })
      .getByText("Outra data", { exact: true })
      .click();
    const from = drug.getByRole("textbox", { name: "Início" });
    await from.fill(shownDate(localDay(-1)));
    await from.press("Enter");
    await dialog.getByRole("button", { name: "Registrar revisão" }).click();

    await expect(
      page.getByText("Revisão registrada com sucesso!"),
    ).toBeVisible();
    expect(sent.evaluations).toMatchObject([
      {
        idDrug: 12,
        conforming: true,
        validFrom: `${localDay(-1)}T00:00:00`,
        // 10 days from its start
        validUntil: `${localDay(9)}T23:59:59`,
        triggers: [3],
      },
    ]);
  });

  test("shows an expired evaluation no longer holds and keeps the patient pending when it is not evaluated again", async ({
    page,
    mockApi,
  }) => {
    const expired = {
      ...vancomycinEvaluation,
      validUntil: hoursFromNow(-6),
      triggers: [3],
    };
    mockPage(
      mockApi,
      followUp({
        pendings: [
          {
            id: "803",
            type: 3,
            origin: 2,
            idDrug: 12,
            idPrescription: null,
            details: { validUntil: expired.validUntil },
            createdAt: hoursFromNow(-5),
          },
        ],
        courses: [
          {
            idDrug: 12,
            start: VANCOMYCIN_START,
            ongoing: true,
            evaluation: expired,
            history: [expired],
          },
        ],
      }),
    );

    await page.goto(PAGE_URL);

    // the mark where it turned pending, at the end of its validity
    const pendingMark = page
      .getByTestId("course-row")
      .filter({ hasText: "VANCOMICINA" })
      .getByTestId("evaluation-pending");
    await pendingMark.hover({ timeout: 15000 });
    await expect(
      page.getByRole("tooltip").filter({ hasText: "Pendente desde" }),
    ).toContainText(`A validade terminou em ${shownDate(expired.validUntil)}`);
    await page.mouse.move(0, 0);

    await page
      .getByRole("button", { name: "Revisar" })
      .click({ timeout: 15000 });

    const dialog = page.getByRole("dialog");
    const drug = dialog.getByTestId("review-drug");
    await expect(drug.getByTestId("review-pendings-chip")).toHaveText(
      "1 pendência",
    );
    await drug.getByTestId("review-pendings-chip").click();
    const pendings = page.getByTestId("review-pendings");
    await expect(pendings).toContainText(
      `A validade terminou em ${shownDate(expired.validUntil)}`,
    );
    await page.keyboard.press("Escape");
    await expect(pendings).toHaveCount(0);

    // leaving it out of the review does not keep a verdict that holds
    await drug.getByText(SKIP, { exact: true }).click();
    await expect(drug.getByTestId("review-skip-notice")).toContainText(
      "continua pendente: a avaliação atual não vale mais",
    );
    await dialog.getByRole("button", { name: "Próximo" }).click();
    await expect(dialog.getByTestId("review-summary")).toContainText(
      "Continua pendente",
    );
  });

  test("starts the follow-up of an admission not followed, then offers the review", async ({
    page,
    mockApi,
  }) => {
    mockPage(mockApi, notFollowed());
    let followed = 0;
    mockApi.override(FOLLOW, async (route) => {
      followed += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          followUp({
            statusDate: hoursFromNow(0),
            reviews: [],
            pendings: [
              {
                id: "901",
                type: 1,
                origin: 5,
                idDrug: null,
                idPrescription: null,
                details: null,
                createdAt: hoursFromNow(0),
              },
            ],
            courses: [
              {
                idDrug: 11,
                start: MEROPENEM_START,
                ongoing: true,
                evaluation: null,
                history: [],
              },
              {
                idDrug: 12,
                start: VANCOMYCIN_START,
                ongoing: true,
                evaluation: null,
                history: [],
              },
            ],
          }),
        ),
      });
    });

    await page.goto(PAGE_URL);

    // not followed: no review, the follow-up is started instead
    const box = page.getByTestId("follow-up");
    await expect(box.getByTestId("follow-up-status")).toHaveText(
      "Não acompanhado",
      { timeout: 15000 },
    );
    await expect(page.getByRole("button", { name: "Revisar" })).toHaveCount(0);
    await pickMoreAction(page, "Iniciar acompanhamento");

    await expect(box.getByTestId("follow-up-status")).toHaveText("Pendente");
    await expect(box.getByTestId("follow-up-pendings-count")).toHaveText(
      "1 pendência",
    );
    await box.getByTestId("follow-up-pendings-count").click();
    await expect(page.getByTestId("follow-up-pendings-list")).toContainText(
      "Paciente ainda não revisado",
    );
    await page.keyboard.press("Escape");
    expect(followed).toBe(1);
    await expect(
      (await openMoreActions(page)).getByRole("menuitem", {
        name: "Iniciar acompanhamento",
      }),
    ).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Revisar" })).toBeVisible();
  });

  test("does not start the follow-up without a running antimicrobial", async ({
    page,
    mockApi,
  }) => {
    mockPage(mockApi, notFollowed(false));

    await page.goto(PAGE_URL);

    await expect(
      page.getByTestId("follow-up").getByTestId("follow-up-status"),
    ).toHaveText("Não acompanhado", { timeout: 15000 });
    await expect(
      (await openMoreActions(page)).getByRole("menuitem", {
        name: "Iniciar acompanhamento",
      }),
    ).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Revisar" })).toHaveCount(0);
  });
});

test.describe("worklist", () => {
  const admission = {
    admissionNumber: ADMISSION,
    idPatient: `${PATIENT_ID}`,
    birthdate: "1975-03-02T00:00:00",
    gender: "F",
    admissionDate: hoursFromNow(-240),
    bed: "7B",
    department: "UTI Adulto",
    status: 1,
    statusDate: hoursFromNow(-20),
    nextReviewDate: hoursFromNow(-2),
    earliestValidUntil: hoursFromNow(5 * 24),
    pendings: followUp().data.pendings,
  };

  const lists = (mockApi: {
    requests: { path: string; postData?: string | null }[];
  }) =>
    mockApi.requests
      .filter((r) => r.path === "/infection-control/admissions")
      .map((r) => JSON.parse(r.postData!));

  const pickOption = async (page: Page, field: string, option: string) => {
    await page.locator(field).click();
    await page
      .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
      .getByText(option, { exact: true })
      .click();
    await page.keyboard.press("Escape");
  };

  test("lists the followed patients, the pending ones by default", async ({
    page,
    mockApi,
  }) => {
    mockApi.override(LIST, {
      json: { status: "success", data: { count: 1, admissions: [admission] } },
    });

    await page.goto("/controle-infeccao");

    await expect(
      page.getByRole("heading", { name: "Controle de Infecção" }),
    ).toBeVisible({ timeout: 15000 });

    const row = page.getByRole("row", { name: new RegExp(`${ADMISSION}`) });
    await expect(row).toContainText("Fulano Beltrano");
    await expect(row).toContainText("UTI Adulto");
    await expect(row).toContainText("Pendente");
    await expect(row).toContainText("MEROPENEM 1 g SOL INJ sem avaliação");
    await expect(page.locator(".list-count")).toHaveText(/Pacientes\s*1/);

    // up to 500 at once, paged in the browser
    expect(lists(mockApi)[0]).toMatchObject({
      status: [1],
      limit: 500,
      offset: 0,
    });
    await expect(page.getByText(/A lista foi limitada/)).toHaveCount(0);
  });

  test("warns when the list was limited", async ({ page, mockApi }) => {
    mockApi.override(LIST, {
      json: {
        status: "success",
        data: { count: 734, admissions: [admission] },
      },
    });

    await page.goto("/controle-infeccao");

    await expect(
      page.getByText("A lista foi limitada em 500 registros."),
    ).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByText(/734 pacientes atendem aos filtros/),
    ).toBeVisible();
  });

  test("says when more match than the backend counted", async ({
    page,
    mockApi,
  }) => {
    mockApi.override(LIST, {
      json: {
        status: "success",
        data: { count: 5000, countLimited: true, admissions: [admission] },
      },
    });

    await page.goto("/controle-infeccao");

    await expect(
      page.getByText(/Mais de 5000 pacientes atendem aos filtros/),
    ).toBeVisible({ timeout: 15000 });
  });

  test("searches the loaded list by patient name or admission", async ({
    page,
    mockApi,
  }) => {
    const other = {
      ...admission,
      admissionNumber: ADMISSION + 1,
      idPatient: `${PATIENT_ID + 1}`,
    };
    mockApi.override(LIST, {
      json: {
        status: "success",
        data: { count: 2, admissions: [admission, other] },
      },
    });
    const names: Record<string, string> = {
      [PATIENT_ID]: "Fulano Beltrano",
      [PATIENT_ID + 1]: "Maria Teste",
    };
    mockApi.override("GET /names/:idPatient", (route) => {
      const idPatient = new URL(route.request().url()).pathname
        .split("/")
        .pop()!;
      return route.fulfill({
        json: { status: "success", idPatient, name: names[idPatient] },
      });
    });

    await page.goto("/controle-infeccao");
    const rows = page.locator(".ant-table-tbody tr.ant-table-row");
    await expect(rows).toHaveCount(2, { timeout: 15000 });
    await expect(page.getByText("Maria Teste")).toBeVisible();
    const listsBefore = lists(mockApi).length;

    const search = page.getByPlaceholder(
      "Buscar por paciente ou nº atendimento",
    );
    // case and accents do not matter
    await search.fill("MARÍA");
    await expect(rows).toHaveCount(1);
    await expect(rows).toContainText("Maria Teste");
    await expect(page.locator(".list-count")).toHaveText(/1 \/ 2/);

    await search.fill(`${ADMISSION}`);
    await expect(rows).toHaveCount(1);
    await expect(rows).toContainText("Fulano Beltrano");

    await search.fill("Ciclano");
    await expect(page.getByText("Nenhum paciente encontrado.")).toBeVisible();

    await search.fill("");
    await expect(rows).toHaveCount(2);

    // the search never goes to the backend
    expect(lists(mockApi).length).toBe(listsBefore);
  });

  test("pages the list in the browser, 50 patients per page", async ({
    page,
    mockApi,
  }) => {
    const admissions = Array.from({ length: 120 }, (_, index) => ({
      ...admission,
      admissionNumber: ADMISSION + index,
    }));
    mockApi.override(LIST, {
      json: { status: "success", data: { count: 120, admissions } },
    });

    await page.goto("/controle-infeccao");
    const rows = page.locator(".ant-table-tbody tr.ant-table-row");
    await expect(rows).toHaveCount(50, { timeout: 15000 });
    await expect(rows.first()).toContainText(`${ADMISSION}`);
    const listsBefore = lists(mockApi).length;

    // above and below the list
    const pagers = page.locator(".ant-table-pagination");
    await expect(pagers).toHaveCount(2);

    await pagers.last().getByTitle("3", { exact: true }).click();
    await expect(rows).toHaveCount(20);
    await expect(rows.first()).toContainText(`${ADMISSION + 100}`);

    // a search starts again from the first page
    await page
      .getByPlaceholder("Buscar por paciente ou nº atendimento")
      .fill(`${ADMISSION + 1}`);
    await expect(rows.first()).toContainText(`${ADMISSION + 1}`);

    // the pages never go to the backend
    expect(lists(mockApi).length).toBe(listsBefore);
  });

  test("opens the patient in a new tab, keeping the worklist", async ({
    page,
    mockApi,
  }) => {
    mockApi.override(LIST, {
      json: { status: "success", data: { count: 1, admissions: [admission] } },
    });

    await page.goto("/controle-infeccao");

    const row = page.getByRole("row", { name: new RegExp(`${ADMISSION}`) });
    for (const link of [
      row.getByRole("link", { name: "Abrir" }),
      row.getByRole("link", { name: `${ADMISSION}`, exact: true }),
    ]) {
      await expect(link).toHaveAttribute("href", PAGE_URL);
      await expect(link).toHaveAttribute("target", "_blank");
    }

    const [patientPage] = await Promise.all([
      page.context().waitForEvent("page"),
      row.getByRole("link", { name: "Abrir" }).click(),
    ]);
    await expect(patientPage).toHaveURL(new RegExp(`${PAGE_URL}$`));
    await expect(page).toHaveURL(/\/controle-infeccao$/);
    await patientPage.close();
  });

  test("filters by status, department, pending reason and the other filters", async ({
    page,
    mockApi,
  }) => {
    mockApi.override("GET /segments/departments", {
      json: {
        status: "success",
        data: [
          { idDepartment: 10, idSegment: 1, label: "UTI Adulto" },
          { idDepartment: 20, idSegment: 1, label: "Clínica Médica" },
        ],
      },
    });

    await page.goto("/controle-infeccao");
    await expect(
      page.getByRole("heading", { name: "Controle de Infecção" }),
    ).toBeVisible({ timeout: 15000 });
    await expect.poll(() => lists(mockApi).length).toBeGreaterThan(0);

    // status and department, always in sight
    await pickOption(page, "#status", "Revisado");
    await pickOption(page, "#departments", "UTI Adulto");

    // pending reason and overdue review, under "see more"
    await page.getByRole("button", { name: /Ver mais/ }).click();
    await page.waitForTimeout(800);
    await pickOption(page, "#pendingTypes", "Antimicrobiano sem avaliação");
    await page.locator("#overdueReview").click();

    await page.locator(".gtm-btn-search").click();

    await expect
      .poll(() => lists(mockApi).at(-1))
      .toMatchObject({
        status: [1, 2],
        limit: 500,
        offset: 0,
        idDepartment: [10],
        pendingTypes: [2],
        admissionNumbers: [],
        overdueReview: true,
      });

    // no status picked: every status
    await pickOption(page, "#status", "Pendente");
    await pickOption(page, "#status", "Revisado");
    await page.locator(".gtm-btn-search").click();
    await expect
      .poll(() => lists(mockApi).at(-1))
      .toMatchObject({ status: [1, 2, 3], idDepartment: [10] });

    // reset goes back to the pending ones, without the other filters
    await page.locator(".gtm-btn-reset").click();
    await expect
      .poll(() => lists(mockApi).at(-1))
      .toMatchObject({
        status: [1],
        idDepartment: [],
        pendingTypes: [],
        overdueReview: false,
      });
  });

  test("lists the closed ones within the period chosen", async ({
    page,
    mockApi,
  }) => {
    await page.goto("/controle-infeccao");
    await expect(
      page.getByRole("heading", { name: "Controle de Infecção" }),
    ).toBeVisible({ timeout: 15000 });
    await expect.poll(() => lists(mockApi).length).toBeGreaterThan(0);

    // the last 30 days by default, only asked for when the closed are listed
    expect(lists(mockApi)[0]).toMatchObject({ status: [1], closedDays: 30 });
    const closedWindow = page.getByText(
      /A busca inclui somente os pacientes encerrados nos últimos/,
    );
    await expect(closedWindow).toHaveCount(0);

    // the period is under "see more"
    await pickOption(page, "#status", "Encerrado");
    await page.getByRole("button", { name: /Ver mais/ }).click();
    await page.waitForTimeout(800);
    await pickOption(page, "#closedDays", "90 dias");
    await page.locator(".gtm-btn-search").click();

    await expect
      .poll(() => lists(mockApi).at(-1))
      .toMatchObject({ status: [1, 3], closedDays: 90 });
    // the list says how far back the closed ones go
    await expect(
      page.getByText(
        /A busca inclui somente os pacientes encerrados nos últimos 90 dias/,
      ),
    ).toBeVisible();

    // searched by admission number, every closed one of them is listed
    await page.locator("#admissionNumbers").fill(String(ADMISSION));
    await page.keyboard.press("Enter");
    await page.locator(".gtm-btn-search").click();
    await expect
      .poll(() => lists(mockApi).at(-1))
      .toMatchObject({ admissionNumbers: [ADMISSION] });
    await expect(closedWindow).toHaveCount(0);
  });

  test("disables the period when the closed ones are not listed", async ({
    page,
  }) => {
    await page.goto("/controle-infeccao");
    await expect(
      page.getByRole("heading", { name: "Controle de Infecção" }),
    ).toBeVisible({ timeout: 15000 });

    await page.getByRole("button", { name: /Ver mais/ }).click();
    await page.waitForTimeout(800);
    await expect(page.locator("#closedDays")).toBeDisabled();
  });

  test("disables the filters closed patients never match", async ({ page }) => {
    await page.goto("/controle-infeccao");
    await expect(
      page.getByRole("heading", { name: "Controle de Infecção" }),
    ).toBeVisible({ timeout: 15000 });

    // only the closed ones
    await pickOption(page, "#status", "Encerrado");
    await pickOption(page, "#status", "Pendente");

    await page.getByRole("button", { name: /Ver mais/ }).click();
    await page.waitForTimeout(800);
    await expect(
      page.getByText(/Pacientes encerrados não têm antimicrobianos em uso/),
    ).toBeVisible();
    await expect(page.locator("#awareLevels")).toBeDisabled();
    await expect(page.locator("#pendingTypes")).toBeDisabled();
    await expect(page.locator("#nonConforming")).toBeDisabled();
    // a review date can still be overdue
    await expect(page.locator("#overdueReview")).toBeEnabled();
  });

  test("leaves out the disabled filters with only the closed ones", async ({
    page,
    mockApi,
  }) => {
    await page.goto("/controle-infeccao");
    await expect(
      page.getByRole("heading", { name: "Controle de Infecção" }),
    ).toBeVisible({ timeout: 15000 });

    // a pending reason picked for the pending ones
    await page.getByRole("button", { name: /Ver mais/ }).click();
    await page.waitForTimeout(800);
    await pickOption(page, "#pendingTypes", "Antimicrobiano sem avaliação");
    await page.locator("#nonConforming").click();

    // then only the closed ones: the reason is disabled, and not sent
    await pickOption(page, "#status", "Encerrado");
    await pickOption(page, "#status", "Pendente");
    await page.locator(".gtm-btn-search").click();

    await expect
      .poll(() => lists(mockApi).at(-1))
      .toMatchObject({
        status: [3],
        pendingTypes: [],
        nonConforming: false,
        antimicrobials: [],
        awareLevels: [],
      });
  });

  test("asks for more filters when the search took too long", async ({
    page,
    mockApi,
  }) => {
    mockApi.override(LIST, {
      status: 400,
      json: {
        status: "error",
        message: "A busca demorou demais. Utilize mais filtros",
        code: "errors.queryTimeout",
      },
    });

    await page.goto("/controle-infeccao");

    await expect(
      page.getByText(
        "A busca demorou demais. Utilize mais filtros para direcionar a sua análise.",
      ),
    ).toBeVisible({ timeout: 15000 });
  });

  test("filters by the antimicrobials running, each on its treatment day", async ({
    page,
    mockApi,
  }) => {
    const searches: string[] = [];
    mockApi.override("GET /infection-control/antimicrobials", async (route) => {
      searches.push(new URL(route.request().url()).searchParams.get("q")!);
      await route.fulfill({
        json: {
          status: "success",
          data: [
            { id: 21, name: "CEFTRIAXONA 1 g SOL INJ" },
            { id: 22, name: "CEFEPIMA 2 g SOL INJ" },
          ],
        },
      });
    });
    mockApi.override("GET /substance/find", {
      json: {
        status: "success",
        data: [{ sctid: 9070001, name: "CEFTRIAXONA" }],
      },
    });

    await page.goto("/controle-infeccao");
    await expect(
      page.getByRole("heading", { name: "Controle de Infecção" }),
    ).toBeVisible({ timeout: 15000 });
    await expect.poll(() => lists(mockApi).length).toBeGreaterThan(0);

    // under "see more": the antimicrobial, searched from the third letter
    await page.getByRole("button", { name: /Ver mais/ }).click();
    await page.waitForTimeout(800);
    // a row searches drugs or substances; the empty one keeps the choice
    const criteria = page.getByTestId("antimicrobial-criteria");
    await criteria.locator("label", { hasText: "Substância" }).click();
    await expect(page.locator("#substances-0")).toBeVisible();
    await expect(page.locator("#drugs-0")).toHaveCount(0);
    await criteria.locator("label", { hasText: "Medicamento" }).click();
    const drugs = page.locator("#drugs-0");
    await drugs.click();
    await drugs.pressSequentially("cef");
    await page
      .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
      .getByText("CEFEPIMA 2 g SOL INJ", { exact: true })
      .click();
    await page.keyboard.press("Escape");
    expect(searches).toEqual(["cef"]);
    // on its first day
    await page.locator("#treatmentDayFrom-0").fill("1");
    await page.locator("#treatmentDayTo-0").fill("1");

    // and another one, by its substance, on its second day; a row searches
    // drugs or substances, so switching drops the drug picked first
    await page
      .getByRole("button", { name: "Adicionar antimicrobiano" })
      .click();
    const otherDrugs = page.locator("#drugs-1");
    await otherDrugs.click();
    await otherDrugs.pressSequentially("cef");
    await expect.poll(() => searches).toEqual(["cef", "cef"]);
    await page
      .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
      .getByText("CEFTRIAXONA 1 g SOL INJ", { exact: true })
      .click();
    await page.keyboard.press("Escape");
    await criteria.locator("label", { hasText: "Substância" }).nth(1).click();
    await expect(page.locator("#drugs-1")).toHaveCount(0);
    const substances = page.locator("#substances-1");
    await substances.click();
    await substances.pressSequentially("cef");
    await page
      .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
      .getByText("CEFTRIAXONA", { exact: true })
      .click();
    await page.keyboard.press("Escape");
    await page.locator("#treatmentDayFrom-1").fill("2");
    await page.locator("#treatmentDayTo-1").fill("2");
    // a new row waits for the last one to ask for something
    await page
      .getByRole("button", { name: "Adicionar antimicrobiano" })
      .click();
    await expect(
      page.getByRole("button", { name: "Adicionar antimicrobiano" }),
    ).toBeDisabled();

    // with two rows, any of them will do unless every one is asked for
    await expect(
      page.getByRole("radio", { name: "Qualquer linha (OU)" }),
    ).toBeChecked();

    // AWaRe and non-conformity
    await pickOption(page, "#awareLevels", "Reserva");
    await page.locator("#nonConforming").click();

    await page.locator(".gtm-btn-search").click();

    await expect
      .poll(() => lists(mockApi).at(-1))
      .toMatchObject({
        status: [1],
        // the empty row is left out
        antimicrobials: [
          {
            idDrug: [22],
            idSubstance: [],
            treatmentDayFrom: 1,
            treatmentDayTo: 1,
          },
          {
            idDrug: [],
            idSubstance: [9070001],
            treatmentDayFrom: 2,
            treatmentDayTo: 2,
          },
        ],
        antimicrobialsMatchAll: false,
        awareLevels: [3],
        nonConforming: true,
      });
    // the chosen antimicrobial keeps its name
    await expect(
      page.locator(".ant-select-selection-item", {
        hasText: "CEFEPIMA 2 g SOL INJ",
      }),
    ).toBeVisible();

    // every row, then (the search closed "see more")
    await page.getByRole("button", { name: /Ver mais/ }).click();
    await page.waitForTimeout(800);
    await page.getByText("Todas as linhas (E)", { exact: true }).click();
    await page.locator(".gtm-btn-search").click();
    await expect
      .poll(() => lists(mockApi).at(-1)?.antimicrobialsMatchAll)
      .toBe(true);

    // removing the first row keeps the other one
    await page.getByRole("button", { name: /Ver mais/ }).click();
    await page.waitForTimeout(800);
    await page
      .getByTestId("antimicrobial-criteria")
      .getByRole("button", { name: "Remover" })
      .first()
      .click();
    await page.locator(".gtm-btn-search").click();
    await expect
      .poll(() => lists(mockApi).at(-1)?.antimicrobials)
      .toEqual([
        {
          idDrug: [],
          idSubstance: [9070001],
          treatmentDayFrom: 2,
          treatmentDayTo: 2,
        },
      ]);

    // reset drops them
    await page.locator(".gtm-btn-reset").click();
    await expect
      .poll(() => lists(mockApi).at(-1))
      .toMatchObject({
        antimicrobials: [],
        awareLevels: [],
        nonConforming: false,
      });
  });

  test("takes the filters to the patient page, for its next pending patient", async ({
    page,
    mockApi,
  }) => {
    mockApi.override("GET /segments/departments", {
      json: {
        status: "success",
        data: [{ idDepartment: 10, idSegment: 1, label: "UTI Adulto" }],
      },
    });
    mockApi.override(LIST, {
      json: { status: "success", data: { count: 1, admissions: [admission] } },
    });

    await page.goto("/controle-infeccao");
    const link = page
      .getByRole("row", { name: new RegExp(`${ADMISSION}`) })
      .getByRole("link", { name: "Abrir" });
    await expect(link).toHaveAttribute("href", PAGE_URL, { timeout: 15000 });

    await pickOption(page, "#departments", "UTI Adulto");
    await page.getByRole("button", { name: /Ver mais/ }).click();
    await page.waitForTimeout(800);
    await pickOption(page, "#pendingTypes", "Antimicrobiano sem avaliação");
    await page.locator(".gtm-btn-search").click();

    // the status stays behind: the next one is always a pending one
    await expect(link).toHaveAttribute(
      "href",
      `${PAGE_URL}?idDepartment=10&pendingTypes=2`,
    );
  });

  test("keeps the filter picked last when an earlier list answers late", async ({
    page,
    mockApi,
  }) => {
    // the pending list answers only after the revised one
    let answerPending = () => {};
    const pendingHeld = new Promise<void>((resolve) => {
      answerPending = resolve;
    });
    mockApi.override(LIST, async (route) => {
      const { status } = JSON.parse(route.request().postData()!);
      if (status[0] === 1) {
        await pendingHeld;
        return route.fulfill({
          json: {
            status: "success",
            data: { count: 1, admissions: [admission] },
          },
        });
      }
      return route.fulfill({
        json: { status: "success", data: { count: 0, admissions: [] } },
      });
    });

    await page.goto("/controle-infeccao");
    await expect(
      page.getByRole("heading", { name: "Controle de Infecção" }),
    ).toBeVisible({ timeout: 15000 });

    // pending (held) -> revised
    await pickOption(page, "#status", "Pendente");
    await pickOption(page, "#status", "Revisado");
    await page.locator(".gtm-btn-search").click();
    const empty = page.getByText("Nenhum paciente encontrado.");
    await expect(empty).toBeVisible();

    const latePending = page.waitForResponse(
      (response) =>
        response.url().endsWith("/infection-control/admissions") &&
        JSON.parse(response.request().postData()!).status[0] === 1,
    );
    answerPending();
    await latePending;

    await expect(empty).toBeVisible();
    await expect(
      page.getByRole("row", { name: new RegExp(`${ADMISSION}`) }),
    ).toHaveCount(0);
  });

  // the saved filters belong to the user: the memory kind carries its id
  const SAVED_FILTERS = "infection_control_list_1";
  const savedFiltersButton = (page: Page) =>
    page.locator("button:has(.anticon-filter)");

  test("saves the filters in use, for the user to apply again", async ({
    page,
    mockApi,
  }) => {
    mockApi.override(`PUT /memory/unique/${SAVED_FILTERS}`, {
      json: { status: "success", data: 1 },
    });

    await page.goto("/controle-infeccao");
    await expect(
      page.getByRole("heading", { name: "Controle de Infecção" }),
    ).toBeVisible({ timeout: 15000 });
    await expect.poll(() => lists(mockApi).length).toBeGreaterThan(0);

    await pickOption(page, "#status", "Revisado");

    await pickMenuItem(page, savedFiltersButton(page), /Salvar filtro atual/);
    const modal = page.locator(".ant-modal:visible");
    await modal.locator("input").fill("Revisados e pendentes");
    await modal.getByRole("button", { name: "Salvar" }).click();
    await expect(modal).toBeHidden();

    const saves = mockApi.requests.filter(
      (r) => r.method === "PUT" && r.path === `/memory/unique/${SAVED_FILTERS}`,
    );
    expect(saves).toHaveLength(1);
    expect(JSON.parse(saves[0].postData!)).toEqual({
      value: [
        {
          name: "Revisados e pendentes",
          data: expect.objectContaining({
            status: [1, 2],
            antimicrobials: [],
          }),
          active: true,
        },
      ],
    });
  });

  test("applies a saved filter, showing its values", async ({
    page,
    mockApi,
  }) => {
    mockApi.override(`GET /memory/${SAVED_FILTERS}`, {
      json: {
        status: "success",
        data: [
          {
            key: 1,
            value: [
              {
                name: "Cefepima no D1",
                data: {
                  status: [2],
                  idDepartment: [],
                  pendingTypes: [],
                  admissionNumbers: [],
                  overdueReview: false,
                  antimicrobials: [
                    {
                      type: "drug",
                      drugs: [{ value: 22, label: "CEFEPIMA 2 g SOL INJ" }],
                      substances: [],
                      treatmentDays: { from: 1, to: 1 },
                    },
                  ],
                  antimicrobialsMatchAll: false,
                  awareLevels: [],
                  nonConforming: true,
                },
                active: true,
              },
            ],
          },
        ],
      },
    });

    await page.goto("/controle-infeccao");
    await expect(
      page.getByRole("heading", { name: "Controle de Infecção" }),
    ).toBeVisible({ timeout: 15000 });
    await expect.poll(() => lists(mockApi).length).toBeGreaterThan(0);

    await pickMenuItem(page, savedFiltersButton(page), /Abrir filtros salvos/);
    const modal = page.locator(".ant-modal:visible");
    await expect(modal.getByText("Cefepima no D1")).toBeVisible();
    await modal.getByRole("button", { name: /Aplicar/ }).click();
    await expect(modal).toBeHidden();

    await expect
      .poll(() => lists(mockApi).at(-1))
      .toMatchObject({
        status: [2],
        antimicrobials: [
          {
            idDrug: [22],
            idSubstance: [],
            treatmentDayFrom: 1,
            treatmentDayTo: 1,
          },
        ],
        nonConforming: true,
      });

    // the filter card shows what was applied
    await expect(
      page.locator(".ant-select-selection-item", { hasText: "Revisado" }),
    ).toBeVisible();
    await expect(
      page.locator(".ant-select-selection-item", { hasText: "Pendente" }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: /Ver mais/ }).click();
    await page.waitForTimeout(800);
    await expect(
      page.locator(".ant-select-selection-item", {
        hasText: "CEFEPIMA 2 g SOL INJ",
      }),
    ).toBeVisible();
    await expect(page.locator("#treatmentDayFrom-0")).toHaveValue("1");
    await expect(page.locator("#nonConforming")).toBeChecked();
  });
});

test.describe("next pending", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  const NEXT = "Próximo pendente";

  /** The pending admissions of the worklist, in its order */
  const mockPendings = (mockApi: MockApi, admissionNumbers: number[]) =>
    mockApi.override(LIST, {
      json: {
        status: "success",
        data: {
          count: admissionNumbers.length,
          admissions: admissionNumbers.map((admissionNumber) => ({
            admissionNumber,
            idPatient: null,
            birthdate: null,
            gender: null,
            admissionDate: null,
            bed: null,
            department: null,
            status: 1,
            statusDate: hoursFromNow(-20),
            nextReviewDate: null,
            earliestValidUntil: null,
            pendings: [],
          })),
        },
      },
    });

  const lists = (mockApi: MockApi) =>
    mockApi.requests
      .filter((r) => r.path === "/infection-control/admissions")
      .map((r) => JSON.parse(r.postData!));

  test.beforeEach(async ({ page, mockApi }) => {
    await loginWithPermissions(page, mockApi, [
      ...BASE_PERMISSIONS,
      "READ_INFECTION_CONTROL",
    ]);
    mockPage(mockApi, followUp());
  });

  test("goes to the pending patient after this one in the worklist", async ({
    page,
    mockApi,
  }) => {
    mockPendings(mockApi, [ADMISSION - 1, ADMISSION, ADMISSION + 7]);

    await page.goto(PAGE_URL);
    await pickMoreAction(page, NEXT);

    await expect(page).toHaveURL(
      new RegExp(`/controle-infeccao/${ADMISSION + 7}$`),
    );
    await expect(moreActions(page)).toBeVisible({ timeout: 15000 });
    await expect(
      (await openMoreActions(page)).getByRole("menuitem", { name: NEXT }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    // the pending ones only, without the worklist filters
    expect(lists(mockApi)[0]).toMatchObject({
      status: [1],
      idDepartment: [],
      pendingTypes: [],
      admissionNumbers: [],
      overdueReview: false,
      limit: 500,
      offset: 0,
    });

    // back to the start of the worklist, for the ones skipped before
    mockPendings(mockApi, [ADMISSION - 1, ADMISSION, ADMISSION + 7]);
    await pickMoreAction(page, NEXT);
    await expect(page).toHaveURL(
      new RegExp(`/controle-infeccao/${ADMISSION - 1}$`),
    );
  });

  test("goes to the first one when this patient is no longer pending", async ({
    page,
    mockApi,
  }) => {
    // just reviewed: out of the pending ones
    mockPendings(mockApi, [ADMISSION + 3, ADMISSION + 5]);

    await page.goto(PAGE_URL);
    await pickMoreAction(page, NEXT);

    await expect(page).toHaveURL(
      new RegExp(`/controle-infeccao/${ADMISSION + 3}$`),
    );
  });

  test("stays when no other patient is pending", async ({ page, mockApi }) => {
    mockPendings(mockApi, [ADMISSION]);

    await page.goto(PAGE_URL);
    await pickMoreAction(page, NEXT);

    await expect(
      page.getByText("Não há outro paciente pendente."),
    ).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${PAGE_URL}$`));
  });

  test("keeps to the worklist filters the page was opened with", async ({
    page,
    mockApi,
  }) => {
    mockPendings(mockApi, [ADMISSION, ADMISSION + 2]);
    const antimicrobials = [
      {
        idDrug: [21],
        idSubstance: [],
        treatmentDayFrom: 7,
        treatmentDayTo: null,
      },
    ];
    const search =
      "idDepartment=10,20&pendingTypes=2&awareLevels=3" +
      `&antimicrobials=${encodeURIComponent(JSON.stringify(antimicrobials))}` +
      "&antimicrobialsMatchAll=1&overdueReview=1&nonConforming=1";

    await page.goto(`${PAGE_URL}?${search}`);
    await pickMoreAction(page, NEXT);

    expect(lists(mockApi)[0]).toMatchObject({
      status: [1],
      idDepartment: [10, 20],
      pendingTypes: [2],
      admissionNumbers: [],
      overdueReview: true,
      antimicrobials,
      antimicrobialsMatchAll: true,
      awareLevels: [3],
      nonConforming: true,
    });
    // and takes them along to the next one
    await expect(page).toHaveURL(
      `/controle-infeccao/${ADMISSION + 2}?${new URLSearchParams(search)}`,
    );
  });

  test("is not offered without the follow-up", async ({ page, mockApi }) => {
    mockPage(mockApi, { data: { enabled: false, admissionNumber: ADMISSION } });

    await page.goto(PAGE_URL);

    await expect(page.getByTestId("course-row")).toHaveCount(2, {
      timeout: 15000,
    });
    await expect(
      (await openMoreActions(page)).getByRole("menuitem", { name: NEXT }),
    ).toHaveCount(0);
  });
});

test.describe("next pending without READ_INFECTION_CONTROL", () => {
  test("is not offered", async ({ page, mockApi }) => {
    mockPage(mockApi, followUp());

    await page.goto(PAGE_URL);

    await expect(page.getByTestId("follow-up")).toBeVisible({
      timeout: 15000,
    });
    await expect(
      (await openMoreActions(page)).getByRole("menuitem", {
        name: "Próximo pendente",
      }),
    ).toHaveCount(0);
  });
});

test.describe("menu", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  const MENU_ITEM = "#gtm-lnk-controle-infeccao";

  test("opens the worklist with READ_INFECTION_CONTROL", async ({
    page,
    mockApi,
  }) => {
    await loginWithAuth(page, mockApi, {
      features: ["INFECTION_CONTROL"],
      permissions: [...BASE_PERMISSIONS, "READ_INFECTION_CONTROL"],
    });

    await page.locator(MENU_ITEM).click();

    await expect(page).toHaveURL(/\/controle-infeccao$/);
    await expect(
      page.getByRole("heading", { name: "Controle de Infecção" }),
    ).toBeVisible({ timeout: 15000 });
  });

  test("is not offered with READ_PRESCRIPTION alone", async ({
    page,
    mockApi,
  }) => {
    await loginWithAuth(page, mockApi, {
      features: ["INFECTION_CONTROL"],
      permissions: BASE_PERMISSIONS,
    });

    await expect(page.locator("#gtm-lnk-intervencoes")).toBeVisible();
    await expect(page.locator(MENU_ITEM)).toHaveCount(0);
  });
});
