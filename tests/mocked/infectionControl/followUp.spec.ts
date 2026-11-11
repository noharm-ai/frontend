import type { Locator, Page, Route } from "@playwright/test";

import { test, expect, type MockApi } from "../support/mockApi";
import { loginWithAuth, loginWithPermissions } from "../support/featureLogin";
import {
  openSelect,
  openSelectById,
  pickMenuItem,
  pickOption,
} from "../support/antd";
import { openMoreFilters } from "../support/advancedFilter";

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
 * /infection-control/admission/:admissionNumber/follow). A review may write a
 * clinical note, given one of the types of GET
 * /infection-control/clinical-note-types (none by default: no note). A note is
 * written only with MULTI_CLINICAL_NOTES, which the review tests tagged
 * @multiClinicalNotes log in with.
 * A review turns on, per drug, the schema's exam trigger rules of GET
 * /infection-control/exam-triggers (none by default); a result meeting one
 * sends the patient back to pending (reason 7). Who writes reviews adds,
 * changes and deletes the rules from the review (PUT
 * /infection-control/exam-triggers replaces the whole list and answers like
 * the GET).
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
const NOTE_TYPES = "GET /infection-control/clinical-note-types";
const FOLLOW = "POST /infection-control/admission/:admissionNumber/follow";
const LIST = "POST /infection-control/admissions";
const SKIP = "Não avaliar agora";
const WATCH_EXPIRY = /Quando a avaliação vencer/;
const WATCH_POSOLOGY = /Quando a posologia mudar/;

// the intervention reasons; only the ones flagged for infection control can
// justify a non-conformity. relationType 2 requires a substitute drug,
// relationType 1 takes one optionally; a substitution alone asks for none
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
    // a substitution without a relation: no substitute
    id: 32,
    name: "Tempo de tratamento",
    parentId: null,
    parentName: null,
    relationType: 0,
    substitution: true,
    infectionControl: true,
  },
  {
    id: 33,
    name: "Trocar antimicrobiano",
    parentId: null,
    parentName: null,
    relationType: 2,
    substitution: true,
    infectionControl: true,
  },
  {
    id: 34,
    name: "Alternativa terapêutica",
    parentId: null,
    parentName: null,
    relationType: 1,
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
  const reasons = drug.getByTestId("review-reasons");
  await openSelect(reasons);
  await pickOption(page, reason);
  await expect(reasons).toContainText(reason);
  // the multiple select stays open: a click aside closes it (Escape would
  // close the review)
  await drug.getByRole("heading", { level: 3 }).click();
};

/**
 * Tells why the drug being evaluated is given and its infection foci, both
 * asked for every drug evaluated
 */
const fillIndication = async (
  page: Page,
  drug: Locator,
  treatmentType = "Empírico",
  foci = ["Urinário"],
) => {
  await drug
    .getByRole("radiogroup", { name: "Tipo de tratamento" })
    .getByText(treatmentType, { exact: true })
    .click();
  for (const focus of foci) {
    await pickFocus(page, drug, focus);
  }
};

/** Picks one more infection focus of the drug being evaluated */
const pickFocus = async (page: Page, drug: Locator, focus: string) => {
  const foci = drug.getByTestId("review-infection-focus");
  await openSelect(foci);
  await pickOption(page, focus);
  await expect(foci).toContainText(focus);
  // the multiple select stays open: a click aside closes it (Escape would
  // close the review)
  await drug.getByRole("heading", { level: 3 }).click();
};

/**
 * Opens the review and waits out its zoom motion: a click landing in the
 * dialog while it still zooms in can be lost
 */
const openReview = async (page: Page) => {
  await page.getByRole("button", { name: "Revisar" }).click({ timeout: 15000 });
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).not.toHaveClass(/ant-zoom/);
};

/** From the patient step, on to the clinical note step and the save */
const saveReview = async (dialog: Locator) => {
  await dialog.getByRole("button", { name: "Próximo: evolução" }).click();
  await dialog.getByRole("button", { name: "Registrar revisão" }).click();
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
  treatmentType: 2,
  infectionFoci: [8, 4],
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
    idPrescription: "299",
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
  // with why the drug is given and the infection focus
  await expect(review.getByTestId("review-evaluation-indication")).toHaveText(
    "Indicação: Guiado por cultura · Corrente sanguínea / cateter, Abdominal",
  );
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

test("opens a printable report detailing the courses in use and every review", async ({
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
              end: hoursFromNow(-48),
              dose: 500,
              measureUnit: "mg",
              frequency: "12h/12h",
              route: "IV",
              notes: "Infundir em 1 hora",
            },
            {
              start: hoursFromNow(-48),
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
        course({
          idDrug: 13,
          drug: "CEFEPIMA 1 g SOL INJ",
          substance: "CEFEPIMA",
          status: "finished",
          start: hoursFromNow(-240),
          end: hoursFromNow(-120),
          days: 6,
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

  // every course in use, with its posologies, gaps and evaluations
  const courses = report.getByTestId("report-course");
  await expect(courses).toHaveCount(2);
  const vancomycin = courses.filter({ hasText: "VANCOMICINA 500 mg" });
  await expect(vancomycin).toContainText("5 de 7 dias");
  await expect(vancomycin).toContainText("Observe");
  await expect(vancomycin).toContainText("0,02 g/Kg · 0,03 g/Kg/dia");
  // the latest posology first, and only its notes
  const regimenRows = vancomycin.locator("table").first().locator("tbody tr");
  await expect(regimenRows.first()).toContainText("1 g");
  await expect(regimenRows.last()).toContainText("500 mg");
  await expect(vancomycin).toContainText("Infundir em 2 horas");
  await expect(vancomycin).not.toContainText("Infundir em 1 hora");
  await expect(vancomycin).toContainText("Intervalos sem prescrição (1)");
  await expect(vancomycin).toContainText("Avaliações (1)");
  await expect(courses.filter({ hasText: "MEROPENEM" })).toContainText(
    "Nenhuma avaliação registrada.",
  );

  // the finished course, only for how long it was taken
  await expect(courses.filter({ hasText: "CEFEPIMA" })).toHaveCount(0);
  const pastCourses = report.getByTestId("report-past-courses");
  await expect(pastCourses).toContainText("CEFEPIMA 1 g SOL INJ");
  await expect(pastCourses).toContainText("Encerrado");
  await expect(pastCourses).toContainText("6 dias");

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

test("adds the recent cultures and the exams the page shows to the report", async ({
  page,
  mockApi,
}) => {
  const exam = (key: string, value: Record<string, unknown>) => ({
    key,
    value: {
      value: null,
      unit: null,
      alert: false,
      date: hoursFromNow(-12),
      ref: null,
      initials: key.toUpperCase(),
      name: null,
      delta: null,
      ...value,
    },
  });
  mockApi.override(TIMELINE, {
    json: {
      ...TIMELINE_DATA,
      data: {
        ...TIMELINE_DATA.data,
        screeningPrescription: {
          idPrescription: "299",
          date: hoursFromNow(-24),
          agg: false,
        },
        exams: [
          exam("cr", { name: "Creatinina", value: 0.9, unit: "mg/dL" }),
          exam("pcr", { name: "PCR" }),
          exam("leuco", {
            name: "Leucócitos",
            value: 18500,
            unit: "/mm³",
            alert: true,
            ref: "4.000 a 11.000",
            delta: 25,
          }),
        ],
        alertExams: 1,
      },
    },
  });
  mockApi.override(
    "GET /infection-control/admission/:admissionNumber/cultures",
    {
      json: {
        status: "success",
        data: {
          admissionNumber: ADMISSION,
          releasedSince: hoursFromNow(-60 * 24),
          cultures: [
            {
              id: "1",
              examName: "Hemocultura teste",
              material: "Sangue teste",
              collectionDate: hoursFromNow(-30),
              releaseDate: hoursFromNow(-6),
              gram: "Cocos gram positivos em cachos, observados após 18 horas de incubação em meio aeróbio.",
              previousResult:
                "<div><label>RESULTADO: </label><span>Positivo</span></div>",
              microorganisms: ["Staphylococcus aureus"],
            },
          ],
        },
      },
    },
  );

  await page.goto(PAGE_URL);
  await expect(page.getByTestId("recent-culture")).toBeVisible({
    timeout: 15000,
  });
  await pickMoreAction(page, "Relatório");
  const report = page.getByTestId("infection-control-report");
  await expect(report).toBeVisible();

  // the cultures whole: the gram and the result are not cut on paper
  const cultures = report.getByTestId("report-cultures");
  await expect(cultures).toContainText("Culturas (1)");
  const culture = cultures.getByTestId("report-culture");
  await expect(culture).toContainText("Hemocultura teste");
  await expect(culture).toContainText("Sangue teste");
  await expect(culture).toContainText("Staphylococcus aureus");
  await expect(culture).toContainText("após 18 horas de incubação");
  await expect(culture).toContainText("RESULTADO: Positivo");

  // the exams of the screening prescription, the ones out of range first
  const exams = report.getByTestId("report-exams");
  await expect(exams).toContainText("Exames (3)");
  await expect(exams).toContainText("1 fora da referência");
  const rows = exams.getByTestId("report-exam");
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(0)).toContainText("Leucócitos");
  await expect(rows.nth(0)).toContainText("18.500 /mm³");
  // the reference is left out
  await expect(rows.nth(0)).not.toContainText("4.000 a 11.000");
  await expect(rows.nth(0)).toContainText("+25%");
  await expect(rows.nth(1)).toContainText("Creatinina");
  await expect(rows.nth(1)).toContainText("0,9 mg/dL");
  await expect(rows.nth(2)).toContainText("PCR");
});

test("says in the report when the cultures did not load", async ({
  page,
  mockApi,
}) => {
  mockApi.override(
    "GET /infection-control/admission/:admissionNumber/cultures",
    { status: 500, json: { status: "error" } },
  );

  await page.goto(PAGE_URL);
  await expect(
    page.getByText("Não foi possível carregar as culturas."),
  ).toBeVisible({ timeout: 15000 });
  await pickMoreAction(page, "Relatório");

  const cultures = page
    .getByTestId("infection-control-report")
    .getByTestId("report-cultures");
  await expect(cultures).toContainText("As culturas não foram carregadas.");
  await expect(cultures).not.toContainText("Nenhuma cultura liberada");
  await expect(cultures).not.toContainText("Culturas (0)");
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

// the exam trigger rules of the schema (GET /infection-control/exam-triggers)
const examRule = (overrides: Record<string, unknown>) => ({
  valueAbove: null,
  valueAtLeast: null,
  valueBelow: null,
  valueAtMost: null,
  variationAbove: null,
  variationAtLeast: null,
  variationBelow: null,
  variationAtMost: null,
  fromCourseDay: null,
  enabledByDefault: false,
  available: true,
  ...overrides,
});
// the schema's rules: a CRP rise with no results in the schema (on by
// default, to show an unavailable rule never comes on), a vancocinemia
// rise and a fever on by default, an eGFR fall off
const EXAM_RULES = [
  examRule({
    id: "pcr-rise",
    name: "PCR em elevação",
    examRef: "pcru",
    valueAbove: 50,
    variationAtLeast: 20,
    enabledByDefault: true,
    available: false,
  }),
  examRule({
    id: "van",
    name: "Vancocinemia",
    examRef: "van",
    valueAbove: 20,
    variationAbove: 30,
    enabledByDefault: true,
  }),
  examRule({
    id: "tfg",
    name: "TFG",
    examRef: "ckd21",
    valueBelow: 60,
    variationBelow: -25,
  }),
  examRule({
    id: "temp",
    name: "Temperatura",
    examRef: "temp",
    valueAbove: 38,
    fromCourseDay: 4,
    enabledByDefault: true,
  }),
];
const EXAMS = [
  { examRef: "pcru", name: "PCR", available: false },
  { examRef: "temp", name: "Temperatura", available: true },
  { examRef: "ckd", name: "CKD", available: true },
  { examRef: "ckd21", name: "CKD21", available: true },
  { examRef: "h_conleuc", name: "Leucócitos Absoluto", available: true },
  {
    examRef: "procalcitonina_adult",
    name: "Procalcitonina",
    available: true,
  },
  { examRef: "van", name: "Vancocinemia", available: true },
];

test.describe("with WRITE_INFECTION_CONTROL", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page, mockApi }, testInfo) => {
    await loginWithAuth(page, mockApi, {
      permissions: [...BASE_PERMISSIONS, "WRITE_INFECTION_CONTROL"],
      features: testInfo.tags.includes("@multiClinicalNotes")
        ? ["MULTI_CLINICAL_NOTES"]
        : [],
    });
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
    await openReview(page);

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
    await openReview(page);

    const dialog = page.getByRole("dialog");
    const next = dialog.getByRole("button", { name: "Próximo" });
    const drug = dialog.getByTestId("review-drug");
    const decisions = drug.getByRole("radiogroup", { name: "Avaliação" });
    const skip = decisions.getByRole("radio", { name: new RegExp(`^${SKIP}`) });
    const expiryBox = drug.getByRole("checkbox", { name: WATCH_EXPIRY });
    const posologyBox = drug.getByRole("checkbox", { name: WATCH_POSOLOGY });
    const hint = dialog.getByTestId("review-hint");

    // one step per running drug, then the patient and the clinical note
    await expect(dialog.getByTestId("review-rail-drug")).toHaveCount(2);
    await expect(dialog.getByTestId("review-rail-patient")).toHaveCount(1);
    await expect(dialog.getByTestId("review-rail-note")).toHaveCount(1);
    await expect(dialog.getByText("Etapa 1 de 4")).toBeVisible();

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
    // every drug evaluated tells why it is given and the infection focus,
    // optional for a prophylaxis only
    const focusHint = drug
      .getByTestId("review-infection-focus")
      .locator(".drug-notes-hint");
    await expect(next).toBeDisabled();
    await expect(hint).toHaveText("Informe o tipo de tratamento");
    const treatmentTypes = drug.getByRole("radiogroup", {
      name: "Tipo de tratamento",
    });
    await expect(
      treatmentTypes.locator(".ant-radio-button-wrapper"),
    ).toHaveText([
      "Empírico",
      "Guiado por cultura",
      "Profilaxia cirúrgica",
      "Profilaxia clínica",
    ]);
    await expect(
      treatmentTypes.getByRole("radio", { checked: true }),
    ).toHaveCount(0);
    await treatmentTypes
      .getByText("Profilaxia cirúrgica", { exact: true })
      .click();
    await expect(focusHint).toHaveText("opcional");
    await expect(hint).toHaveText("Informe o motivo da não conformidade");
    await treatmentTypes.getByText("Empírico", { exact: true }).click();
    await expect(focusHint).toHaveText("obrigatório");
    await expect(hint).toHaveText("Informe o foco infeccioso");
    await openSelect(drug.getByTestId("review-infection-focus"));
    await expect(
      page
        .locator(
          ".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option",
        )
        .first(),
    ).toHaveText("Respiratório inferior (pneumonia)");
    await pickOption(page, "Abdominal");
    await drug.getByRole("heading", { level: 3 }).click();
    // more than one focus can be told
    await pickFocus(page, drug, "Urinário");
    await expect(
      drug
        .getByTestId("review-infection-focus")
        .locator(".ant-select-selection-item"),
    ).toHaveText(["Abdominal", "Urinário"]);

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
      "Alternativa terapêutica",
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

    // an intervention on the drug is recorded by default
    const createIntervention = drug.getByRole("checkbox", {
      name: "Registrar intervenção no medicamento",
    });
    await expect(createIntervention).toBeChecked();
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

    await expect(drug.getByTestId("review-current-indication")).toHaveText(
      "Indicação: Guiado por cultura · Corrente sanguínea / cateter, Abdominal",
    );

    // evaluating it again previews the new one replacing the current from now,
    // with the indication on record filled
    await decisions.getByText("Conforme", { exact: true }).click();
    await expect(
      drug
        .getByRole("radiogroup", { name: "Tipo de tratamento" })
        .getByRole("radio", { checked: true }),
    ).toHaveAccessibleName("Guiado por cultura");
    await expect(
      drug
        .getByTestId("review-infection-focus")
        .locator(".ant-select-selection-item"),
    ).toHaveText(["Corrente sanguínea / cateter", "Abdominal"]);
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

    // patient step: the next review and its notes; the rail tells what the
    // review records for each drug
    const railDrugs = dialog.getByTestId("review-rail-drug");
    await expect(railDrugs.nth(0)).toContainText("Não conforme");
    await expect(railDrugs.nth(1)).toContainText("Mantém atual");
    await expect(next).toHaveText("Próximo: evolução");
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

    // the clinical note closes the review; without MULTI_CLINICAL_NOTES, none
    // can be written
    await next.click();
    await expect(dialog.getByText("Etapa 4 de 4")).toBeVisible();
    await expect(dialog.getByTestId("review-note-unavailable")).toHaveText(
      "A funcionalidade de evolução múltipla não está habilitada, por isso não é possível registrar evolução. A revisão será registrada sem evolução.",
    );
    // the text the review would write still shows, disabled
    const preview = dialog.getByTestId("review-note-preview");
    await expect(preview).toBeDisabled();
    await expect(preview).toHaveValue(/VANCOMICINA 500 mg SOL INJ/);
    await expect(preview).toHaveValue(/Sugerido descalonamento/);
    await expect(
      dialog.getByRole("radio", { name: "Registrar evolução" }),
    ).toBeDisabled();
    await expect(
      dialog.getByRole("radio", { name: "Não registrar" }),
    ).toBeChecked();

    expect(sent).toBeNull();
    await dialog.getByRole("button", { name: "Registrar revisão" }).click();

    await expect(
      page.getByText("Revisão registrada com sucesso!"),
    ).toBeVisible();
    expect(sent).toMatchObject({
      admissionNumber: ADMISSION,
      notes: "Sugerido descalonamento",
      nextReviewDate: null,
      clinicalNote: null,
      evaluations: [
        {
          idDrug: 11,
          conforming: false,
          interventionReasons: [31, 32],
          createIntervention: true,
          notes: "Espectro amplo demais",
          treatmentType: 1,
          infectionFoci: [4, 3],
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
    await openReview(page);

    const dialog = page.getByRole("dialog");
    const next = dialog.getByRole("button", { name: "Próximo" });
    const drug = dialog.getByTestId("review-drug");
    const decisions = drug.getByRole("radiogroup", { name: "Avaliação" });
    const start = drug.getByRole("radiogroup", { name: "Início" });
    const validity = drug.getByRole("radiogroup", { name: "Válida até" });
    const draft = drug.getByTestId("draft-evaluation");

    // meropenem: the defaults, from the course start to the treatment end
    await decisions.getByText("Conforme", { exact: true }).click();
    await fillIndication(page, drug);
    await draft.hover();
    // the verdict's own tooltip may still be fading out from the click
    await expect(
      page
        .getByRole("tooltip")
        .filter({ hasText: "Nova avaliação (não salva)" }),
    ).toContainText("Vale desde");
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
    await expect(dialog.getByTestId("review-rail-patient")).toHaveAttribute(
      "aria-current",
      "step",
    );
    await saveReview(dialog);

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
        // on by default for a non-conformity
        createIntervention: true,
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
    await openReview(page);

    const dialog = page.getByRole("dialog");
    const next = dialog.getByRole("button", { name: "Próximo" });
    const drug = dialog.getByTestId("review-drug");
    const heading = drug.getByRole("heading", { level: 3 });
    const substitute = drug.getByTestId("review-substitute");

    await drug
      .getByRole("radiogroup", { name: "Avaliação" })
      .getByText("Não conforme", { exact: true })
      .click();
    await fillIndication(page, drug);
    await drug.getByLabel("Justificativa", { exact: true }).fill("Descalonar");
    // a reason with no relation asks for no substitute, a substitution too
    await pickReason(page, drug, "Tempo de tratamento");
    await expect(substitute).toHaveCount(0);

    // an optional relation takes one, but moves on without it
    await pickReason(page, drug, "Alternativa terapêutica");
    await expect(substitute).toContainText("opcional");
    await expect(next).toBeEnabled();

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
    await saveReview(dialog);

    await expect(
      page.getByText("Revisão registrada com sucesso!"),
    ).toBeVisible();
    expect(sent.evaluations).toMatchObject([
      { idDrug: 11, interventionReasons: [32, 34, 33], substituteDrug: 21 },
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
    await openReview(page);

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
    // a prophylaxis moves on without a focus
    await drug
      .getByRole("radiogroup", { name: "Tipo de tratamento" })
      .getByText("Profilaxia clínica", { exact: true })
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
    await saveReview(dialog);

    await expect(
      page.getByText("Revisão registrada com sucesso!"),
    ).toBeVisible();
    expect(sent.evaluations).toMatchObject([
      {
        idDrug: 12,
        treatmentType: 4,
        infectionFoci: [],
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
    await openReview(page);

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
    // overlapping the current one, the new one replaces it, and records an
    // intervention by default
    await expect(
      drug.getByRole("checkbox", {
        name: "Registrar intervenção no medicamento",
      }),
    ).toBeChecked();
    await expect(current).toHaveClass(/past/);
    await expect(historyNotice).toHaveCount(0);

    // from the course start up to a day before the current one started
    await openValidity(drug);
    await validity.getByText("Outra data", { exact: true }).click();
    const until = drug.getByRole("textbox", { name: "Válida até" });
    await until.fill(shownDate(PAST_END));
    await until.press("Enter");

    await expect(dialog.getByTestId("review-rail-patient")).toHaveAttribute(
      "aria-current",
      "step",
    );

    // back on the drug: the current one stays in force
    await dialog
      .getByTestId("review-rail-drug")
      .filter({ hasText: "VANCOMICINA 500 mg SOL INJ" })
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
    await saveReview(dialog);
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

  test(
    "writes the clinical note of the review, started from what was reviewed",
    { tag: "@multiClinicalNotes" },
    async ({ page, mockApi }) => {
      mockPage(mockApi, followUp());
      mockApi.override(NOTE_TYPES, {
        json: {
          status: "success",
          data: [{ id: "CI", name: "Controle de infecção" }],
        },
      });
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
      await openReview(page);

      const dialog = page.getByRole("dialog");
      const next = dialog.getByRole("button", { name: "Próximo" });
      const drug = dialog.getByTestId("review-drug");

      // meropenem not conforming, vancomycin keeps its evaluation
      await drug
        .getByRole("radiogroup", { name: "Avaliação" })
        .getByText("Não conforme", { exact: true })
        .click();
      await fillIndication(page, drug, "Empírico", ["Abdominal", "Urinário"]);
      await drug
        .getByLabel("Justificativa", { exact: true })
        .fill("Espectro amplo demais");
      await pickReason(page, drug, "Espectro inadequado");
      await next.click();
      await next.click();
      await dialog
        .getByLabel("Observação sobre o paciente")
        .fill("Aguardar cultura");
      await next.click();

      // skipped unless chosen; then the only type there is comes picked, and the
      // text tells the review
      const step = dialog.getByTestId("review-clinical-note");
      await expect(step.getByTestId("review-note-skipped")).toBeVisible();
      await expect(dialog.getByTestId("review-rail-note")).toContainText(
        "Não registrar",
      );
      await step.getByText("Registrar evolução", { exact: true }).click();
      await expect(step.getByTestId("review-note-type")).toContainText(
        "Controle de infecção",
      );
      await expect(dialog.getByTestId("review-rail-note")).toContainText(
        "Registrar",
      );
      const note = step.getByTestId("review-note-text");
      await expect(note).toHaveValue(/^CONTROLE DE INFECÇÃO/);
      const text = await note.inputValue();
      for (const line of [
        "Paciente: Fulano Beltrano",
        "Atendimento: 9300 · Setor: UTI Adulto · Leito: 7B",
        "Antimicrobianos em uso:\n- MEROPENEM 1 g SOL INJ · D3\n- VANCOMICINA 500 mg SOL INJ · D5",
        "- MEROPENEM 1 g SOL INJ: Não conforme · Vigência",
        "  Indicação: Empírico · Abdominal, Urinário\n  Motivos: Antimicrobiano - Espectro inadequado",
        "  Justificativa: Espectro amplo demais",
        "- VANCOMICINA 500 mg SOL INJ: Mantém a avaliação atual",
        "Culturas recentes:\nNenhuma cultura liberada nos últimos 60 dias.",
        "Observação: Aguardar cultura",
        "Próxima revisão: Não agendada",
      ]) {
        expect(text).toContain(line);
      }
      expect(text).not.toContain("{{");

      // a new template is offered the variables of the review, not the
      // prescription's
      await pickMenuItem(
        page,
        step.locator(".gtm-bt-memorytext").first(),
        /Novo/,
      );
      const templateModal = page
        .getByRole("dialog")
        .filter({ hasText: "Nome do texto padrão" });
      await expect(
        templateModal.locator(".variables-group-list button"),
      ).toHaveText(["Paciente", "Revisão", "Culturas e exames", "Utilidades"]);
      await pickMenuItem(
        page,
        templateModal.getByRole("button", { name: /Revisão/ }),
        "Antimicrobianos em uso, com o dia de tratamento e a posologia",
      );
      await expect(templateModal.locator("textarea")).toHaveValue(
        "{{antimicrobianos}}",
      );
      await templateModal.getByRole("button", { name: "Cancelar" }).click();
      await expect(templateModal).toHaveCount(0);

      // the text is the user's to edit
      await note.fill(`${text}\nConduta: descalonar`);
      await dialog.getByRole("button", { name: "Registrar revisão" }).click();

      await expect(
        page.getByText("Revisão registrada com sucesso!"),
      ).toBeVisible();
      expect(sent.clinicalNote).toEqual({
        idClinicalNoteType: "CI",
        text: `${text}\nConduta: descalonar`,
      });
    },
  );

  test(
    "keeps the clinical note text in step with the review, until it is edited",
    { tag: "@multiClinicalNotes" },
    async ({ page, mockApi }) => {
      mockPage(mockApi, followUp());
      mockApi.override(NOTE_TYPES, {
        json: {
          status: "success",
          data: [{ id: "CI", name: "Controle de infecção" }],
        },
      });

      await page.goto(PAGE_URL);
      await openReview(page);

      const dialog = page.getByRole("dialog");
      const drug = dialog.getByTestId("review-drug");
      const toNote = () => dialog.getByTestId("review-rail-note").click();
      const toMeropenem = () =>
        dialog.getByTestId("review-rail-drug").first().click();
      const note = dialog.getByTestId("review-note-text");
      const outdated = dialog.getByTestId("review-note-outdated");

      // straight to the note: meropenem is not evaluated yet
      await toNote();
      await dialog.getByText("Registrar evolução", { exact: true }).click();
      await expect(note).toHaveValue(
        /- MEROPENEM 1 g SOL INJ: Avaliação não preenchida/,
      );
      await expect(dialog.getByTestId("review-hint")).toHaveText(
        "Conclua a avaliação de todos os antimicrobianos",
      );

      // evaluated afterwards, the untouched text follows
      await toMeropenem();
      await drug
        .getByRole("radiogroup", { name: "Avaliação" })
        .getByText("Conforme", { exact: true })
        .click();
      await toNote();
      await expect(note).toHaveValue(
        /- MEROPENEM 1 g SOL INJ: Conforme · Vigência/,
      );
      await expect(outdated).toHaveCount(0);

      // once edited, the text is the user's: a change to the review is only
      // told, and the text generated again on request
      const edited = `${await note.inputValue()}\nConduta: manter`;
      await note.fill(edited);
      await toMeropenem();
      await drug.getByText(SKIP, { exact: true }).click();
      await toNote();
      await expect(note).toHaveValue(edited);
      await expect(outdated).toBeVisible();
      await outdated.getByRole("button", { name: "Gerar novamente" }).click();
      await page.getByRole("button", { name: "Sim", exact: true }).click();
      await expect(note).toHaveValue(
        /- MEROPENEM 1 g SOL INJ: Permanece como “A avaliar”/,
      );
      await expect(note).not.toHaveValue(/Conduta: manter/);
      await expect(outdated).toHaveCount(0);
    },
  );

  test(
    "asks for the type and the text of the clinical note, which can be skipped",
    { tag: "@multiClinicalNotes" },
    async ({ page, mockApi }) => {
      mockPage(mockApi, followUp());
      mockApi.override(NOTE_TYPES, {
        json: {
          status: "success",
          data: [
            { id: "CI", name: "Controle de infecção" },
            { id: "FARM", name: "Farmácia clínica" },
          ],
        },
      });
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
      await openReview(page);

      const dialog = page.getByRole("dialog");
      const next = dialog.getByRole("button", { name: "Próximo" });
      const save = dialog.getByRole("button", { name: "Registrar revisão" });
      const hint = dialog.getByTestId("review-hint");
      await dialog
        .getByTestId("review-drug")
        .getByText(SKIP, { exact: true })
        .click();
      await next.click();
      await next.click();
      await next.click();

      // with more than one type, the user picks it
      const step = dialog.getByTestId("review-clinical-note");
      const note = step.getByTestId("review-note-text");
      await step.getByText("Registrar evolução", { exact: true }).click();
      await expect(note).toHaveValue(/^CONTROLE DE INFECÇÃO/);
      await expect(save).toBeDisabled();
      await expect(hint).toHaveText("Informe o tipo de evolução");
      await openSelect(step.getByTestId("review-note-type"));
      await pickOption(page, "Farmácia clínica");
      await expect(save).toBeEnabled();

      // and writes something
      await note.fill("");
      await expect(save).toBeDisabled();
      await expect(hint).toHaveText("Informe o texto da evolução");
      await step.getByTestId("review-note-default").click();
      await expect(note).toHaveValue(/^CONTROLE DE INFECÇÃO/);
      await expect(save).toBeEnabled();

      // or saves the review without a note
      await step.getByText("Não registrar", { exact: true }).click();
      await expect(step.getByTestId("review-note-skipped")).toHaveText(
        "A revisão será registrada sem evolução.",
      );
      await expect(dialog.getByTestId("review-rail-note")).toContainText(
        "Não registrar",
      );
      await save.click();

      await expect(
        page.getByText("Revisão registrada com sucesso!"),
      ).toBeVisible();
      expect(sent.clinicalNote).toBeNull();
    },
  );

  test(
    "offers no clinical note when the record has no prescription-day",
    { tag: "@multiClinicalNotes" },
    async ({ page, mockApi }) => {
      mockPage(mockApi, followUp({ idPrescription: null }));
      mockApi.override(NOTE_TYPES, {
        json: {
          status: "success",
          data: [{ id: "CI", name: "Controle de infecção" }],
        },
      });

      await page.goto(PAGE_URL);
      await openReview(page);

      const dialog = page.getByRole("dialog");
      await dialog.getByTestId("review-rail-note").click();
      await expect(dialog.getByTestId("review-note-unavailable")).toHaveText(
        "Este atendimento não tem prescrição para registrar a evolução. A revisão será registrada sem evolução.",
      );
      await expect(
        dialog.getByRole("radio", { name: "Registrar evolução" }),
      ).toBeDisabled();
    },
  );

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
    await openReview(page);

    const dialog = page.getByRole("dialog");
    const next = dialog.getByRole("button", { name: "Próximo" });
    // nothing evaluated: a review that only records the visit
    await dialog
      .getByTestId("review-drug")
      .getByText(SKIP, { exact: true })
      .click();
    await next.click();
    await next.click();
    await saveReview(dialog);

    await expect(
      page.getByText("Antimicrobiano não está em uso neste atendimento"),
    ).toBeVisible();
    await expect(dialog).toBeVisible();
    await expect(page.getByTestId("follow-up-status")).toHaveText("Pendente");
  });

  test("shows the posology, with its details in the drawer", async ({
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
                notes: "Infundir em 3 horas",
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
    await openReview(page);

    const dialog = page.getByRole("dialog");
    const drug = dialog.getByTestId("review-drug");
    await expect(drug.getByRole("heading", { level: 3 })).toHaveText(
      "MEROPENEM 1 g SOL INJ",
    );
    await expect(drug.getByText("2 FRASCO AMPOLA · 8h/8h · IV")).toBeVisible();
    // the dose by weight and the complement are in the drawer
    await expect(drug.getByText("31,25 mg/Kg")).toHaveCount(0);
    await drug.getByRole("button", { name: "+ detalhes" }).click();
    const prescription = page.getByTestId("review-prescription");
    await expect(prescription).toContainText(
      "0,03 FRASCO AMPOLA/Kg ou 31,25 mg/Kg",
    );
    await expect(prescription).toContainText(
      "0,09 FRASCO AMPOLA/Kg/Dia ou 93,75 mg/Kg/Dia",
    );
    await expect(
      prescription.getByTestId("review-prescription-complement"),
    ).toContainText("Infundir em 3 horas");
    await page.keyboard.press("Escape");
    await expect(prescription).toHaveCount(0);

    await drug
      .getByRole("radiogroup", { name: "Avaliação" })
      .getByText("Conforme", { exact: true })
      .click();
    await fillIndication(page, drug);
    await dialog.getByRole("button", { name: "Próximo" }).click();
    await expect(drug.getByRole("heading", { level: 3 })).toHaveText(
      "VANCOMICINA 500 mg SOL INJ",
    );
    await expect(drug.getByText("1 g · 12h/12h · IV")).toBeVisible();
    // the details are there even without a dose by weight or a complement
    await drug.getByRole("button", { name: "+ detalhes" }).click();
    await expect(prescription).toContainText("Via");
    await expect(prescription).not.toContainText("Dose/kg");
    await expect(
      prescription.getByTestId("review-prescription-complement"),
    ).toHaveCount(0);
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

    await openReview(page);

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
    await saveReview(dialog);

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

    await openReview(page);

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
    await expect(dialog.getByTestId("review-rail-drug")).toContainText(
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

  test.describe("exam triggers", () => {
    const UNIT = "ml/min/1.73";
    const BASELINE_DATE = hoursFromNow(-31);
    const RESULT_DATE = hoursFromNow(-4);
    const shownDateTime = (isoDate: string) =>
      `${shownDate(isoDate)} ${isoDate.slice(11, 16)}`;
    // an eGFR carries the creatinine it was calculated from
    const tfgBaseline = {
      examType: "ckd21",
      date: BASELINE_DATE,
      value: 72,
      unit: UNIT,
      rawValue: 1.1,
      rawUnit: "mg/dL",
    };
    // the eGFR rule and the CRP one turned on in the evaluation of the
    // vancomycin, and a rule the schema no longer has, recorded without a
    // baseline
    const recorded = ({
      enabledByDefault: _,
      available: __,
      ...condition
    }: ReturnType<typeof examRule>) => condition;
    const evaluatedRules = [
      { ...recorded(EXAM_RULES[2]), baseline: tfgBaseline },
      { ...recorded(EXAM_RULES[0]), baseline: null },
      {
        ...recorded(
          examRule({
            id: "gone",
            name: "Leucócitos",
            examRef: "h_conleuc",
            variationAbove: 50,
          }),
        ),
        baseline: null,
      },
    ];
    const withExamTriggers = {
      ...vancomycinEvaluation,
      examTriggers: evaluatedRules,
    };

    test.beforeEach(({ mockApi }) => {
      mockApi.override("GET /infection-control/exam-triggers", {
        json: { status: "success", data: { rules: EXAM_RULES, exams: EXAMS } },
      });
    });

    test("turns on the rules on by default for a new drug and the ones kept for a drug evaluated before", async ({
      page,
      mockApi,
    }) => {
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
              evaluation: withExamTriggers,
              history: [withExamTriggers],
            },
          ],
        }),
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
      await openReview(page);

      const dialog = page.getByRole("dialog");
      const drug = dialog.getByTestId("review-drug");
      const decisions = drug.getByRole("radiogroup", { name: "Avaliação" });
      const triggers = drug.getByTestId("review-triggers");
      const triggersCount = drug.getByTestId("review-triggers-count");
      const vancocinemia = drug.getByRole("checkbox", {
        name: /^Vancocinemia/,
      });
      const tfg = drug.getByRole("checkbox", { name: /^TFG/ });
      const fever = drug.getByRole("checkbox", { name: /^Temperatura/ });
      const crpRise = drug.getByRole("checkbox", { name: /^PCR em elevação/ });

      // the meropenem was never evaluated: the rules on by default, beside
      // the expiry and the posology
      await expect(drug.getByRole("heading", { level: 3 })).toHaveText(
        "MEROPENEM 1 g SOL INJ",
      );
      await decisions.getByText("Conforme", { exact: true }).click();
      await fillIndication(page, drug);
      await expect(triggersCount).toHaveText("4 ativos");
      await triggers.getByRole("button", { name: "Alterar" }).click();
      const rules = drug.getByTestId("review-exam-triggers");
      await expect(rules).toContainText("Gatilhos de exame");
      await expect(vancocinemia).toHaveAccessibleName(
        "Vancocinemia > 20 e variação > +30%",
      );
      await expect(tfg).toHaveAccessibleName("TFG < 60 e variação < -25%");
      await expect(fever).toHaveAccessibleName(
        "Temperatura > 38 a partir do D4",
      );
      // an inclusive variation
      await expect(crpRise).toHaveAccessibleName(
        "PCR em elevação > 50 e variação ≥ +20%",
      );
      // the schema has no CRP results: it never fires, so it is not turned
      // on, even when on by default, nor can it be
      await expect(crpRise).not.toBeChecked();
      await expect(crpRise).toBeDisabled();
      await expect(
        drug.getByTestId("review-exam-trigger-unavailable-pcr-rise"),
      ).toHaveText("PCR não configurado neste hospital: o gatilho não dispara");
      await expect(vancocinemia).toBeEnabled();
      await expect(vancocinemia).toBeChecked();
      await expect(tfg).not.toBeChecked();
      await expect(fever).toBeChecked();
      await fever.uncheck();
      await expect(triggersCount).toHaveText("3 ativos");

      await dialog.getByRole("button", { name: "Próximo" }).click();

      // the vancomycin keeps the rules it had that the schema still has; its
      // evaluation lists them with the result they compare with
      await expect(drug.getByRole("heading", { level: 3 })).toHaveText(
        "VANCOMICINA 500 mg SOL INJ",
      );
      const current = drug.getByTestId("review-current-evaluation");
      const recorded = current.getByTestId("evaluation-exam-trigger");
      await expect(recorded).toHaveCount(3);
      await expect(recorded.first()).toHaveText(
        `TFG < 60 e variação < -25% · Referência: 72 ${UNIT} em ${shownDateTime(BASELINE_DATE)} (creatinina 1,1 mg/dL)`,
      );
      // without a result at review time, a variation never fires
      await expect(recorded.last()).toHaveText(
        "Leucócitos variação > +50% · sem valor de referência: as condições de variação não disparam",
      );

      await decisions.getByText("Conforme", { exact: true }).click();
      await expect(triggersCount).toHaveText("2 ativos");
      await triggers.getByRole("button", { name: "Alterar" }).click();
      await expect(tfg).toBeChecked();
      await expect(vancocinemia).not.toBeChecked();
      await expect(fever).not.toBeChecked();
      // the CRP rule kept from before, though unmapped, can be turned off,
      // and then not on again
      await expect(crpRise).toBeChecked();
      await expect(crpRise).toBeEnabled();
      await crpRise.uncheck();
      await expect(crpRise).toBeDisabled();
      await expect(triggersCount).toHaveText("1 ativo");

      await dialog.getByRole("button", { name: "Próximo" }).click();
      await saveReview(dialog);

      await expect(
        page.getByText("Revisão registrada com sucesso!"),
      ).toBeVisible();
      expect(sent.evaluations).toMatchObject([
        { idDrug: 11, examTriggers: ["van"] },
        { idDrug: 12, examTriggers: ["tfg"] },
      ]);
    });

    test("shows the exam result that sent the patient back to pending and selects its drug", async ({
      page,
      mockApi,
    }) => {
      const tfgOnly = {
        ...vancomycinEvaluation,
        examTriggers: [evaluatedRules[0]],
      };
      mockPage(
        mockApi,
        followUp({
          pendings: [
            {
              id: "804",
              type: 7,
              origin: 2,
              idDrug: 12,
              idPrescription: "299",
              details: {
                drug: "VANCOMICINA 500 mg SOL INJ",
                courseStart: VANCOMYCIN_START,
                matches: [
                  {
                    id: "tfg",
                    name: "TFG",
                    examRef: "ckd21",
                    result: {
                      examType: "ckd21",
                      date: RESULT_DATE,
                      value: 52,
                      unit: UNIT,
                      rawValue: 1.9,
                      rawUnit: "mg/dL",
                    },
                    baseline: tfgBaseline,
                    variation: -27.78,
                  },
                ],
              },
              createdAt: hoursFromNow(-2),
            },
          ],
          courses: [
            {
              idDrug: 12,
              start: VANCOMYCIN_START,
              ongoing: true,
              evaluation: tfgOnly,
              history: [tfgOnly],
            },
          ],
        }),
      );

      await page.goto(PAGE_URL);
      await page.getByTestId("follow-up-pendings-count").click({
        timeout: 15000,
      });
      const pendingsList = page.getByTestId("follow-up-pendings-list");
      await expect(pendingsList).toContainText(
        "Resultado de exame de VANCOMICINA 500 mg SOL INJ",
      );
      const match = pendingsList.getByTestId("exam-result-match");
      await expect(match).toContainText("TFG");
      await expect(match).toContainText(
        `Resultado: 52 ${UNIT} em ${shownDateTime(RESULT_DATE)} (creatinina 1,9 mg/dL)`,
      );
      await expect(match).toContainText(
        `Referência: 72 ${UNIT} em ${shownDateTime(BASELINE_DATE)} (creatinina 1,1 mg/dL)`,
      );
      await expect(match).toContainText("Variação: -27,78%");
      await page.keyboard.press("Escape");
      await expect(pendingsList).toHaveCount(0);

      // the verdict no longer holds
      const mark = page
        .getByTestId("course-row")
        .filter({ hasText: "VANCOMICINA" })
        .getByTestId("course-evaluation");
      await expect(mark).toHaveClass(/invalidated/);
      await mark.hover();
      await expect(page.getByRole("tooltip")).toContainText(
        "resultado de exame",
      );
      await page.mouse.move(0, 0);

      // the drug is to be evaluated again, the drawer telling why
      await openReview(page);
      const dialog = page.getByRole("dialog");
      const drug = dialog.getByTestId("review-drug");
      const decisions = drug.getByRole("radiogroup", { name: "Avaliação" });
      await expect(decisions.getByRole("radio", { checked: true })).toHaveCount(
        0,
      );
      await drug.getByTestId("review-pendings-chip").click();
      const pendings = page.getByTestId("review-pendings");
      await expect(pendings).toContainText(
        "Um resultado de exame atingiu um gatilho:",
      );
      await expect(pendings.getByTestId("exam-result-match")).toContainText(
        "Variação: -27,78%",
      );
      await expect(
        pendings
          .getByTestId("review-current-evaluation")
          .getByTestId("evaluation-exam-trigger"),
      ).toContainText("TFG");
    });

    const EXAM_TRIGGERS = "GET /infection-control/exam-triggers";
    const SAVE_EXAM_TRIGGERS = "PUT /infection-control/exam-triggers";

    // a rule as the review sends it: without the availability, which the
    // backend works out
    const sentRule = ({
      available: _,
      ...fields
    }: ReturnType<typeof examRule>) => fields;

    /**
     * Answers the save of the rules with the ones sent, giving the new ones
     * an id, and returns what was sent
     */
    const mockSaveRules = (mockApi: MockApi) => {
      const sent: any[] = [];
      mockApi.override(SAVE_EXAM_TRIGGERS, async (route) => {
        const body = JSON.parse(route.request().postData()!);
        sent.push(body);
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            status: "success",
            data: {
              rules: body.rules.map((item: any, index: number) => ({
                available: true,
                ...item,
                id: item.id ?? `new${index}`,
              })),
              exams: EXAMS,
            },
          }),
        });
      });
      return sent;
    };

    /**
     * Picks the operator of a condition of the rule form ("value" or
     * "variation"): both selects offer the same ones, so the dropdown is
     * found by the listbox of the select (one may still be closing as the
     * other opens)
     */
    const pickOperator = async (
      page: Page,
      condition: "value" | "variation",
      operator: string,
    ) => {
      const id = `exam-trigger-${condition}-operator`;
      await openSelectById(page, id);
      const dropdown = page
        .locator(".ant-select-dropdown")
        .filter({ has: page.locator(`#${id}_list`) });
      // a click while it still slides in can be lost
      await expect(dropdown).not.toHaveClass(/-(enter|appear)/);
      await dropdown
        .locator(`.ant-select-item-option[title="${operator}"]`)
        .click();
      await expect(
        page.locator(".ant-select").filter({ has: page.locator(`#${id}`) }),
      ).toContainText(operator);
    };

    /** Opens the review on the drug and the choice of its triggers */
    const openTriggers = async (page: Page) => {
      await page.goto(PAGE_URL);
      await openReview(page);
      const drug = page.getByRole("dialog").getByTestId("review-drug");
      await drug
        .getByRole("radiogroup", { name: "Avaliação" })
        .getByText("Conforme", { exact: true })
        .click();
      await fillIndication(page, drug);
      await drug
        .getByTestId("review-triggers")
        .getByRole("button", { name: "Alterar" })
        .click();
      return drug;
    };

    test("adds, changes and deletes the rules from the review", async ({
      page,
      mockApi,
    }) => {
      mockPage(mockApi, followUp());
      const saved = mockSaveRules(mockApi);
      let sent: any = null;
      mockApi.override(REVIEW, async (route) => {
        sent = JSON.parse(route.request().postData()!);
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(followUp({ status: 2, pendings: [] })),
        });
      });

      const drug = await openTriggers(page);
      const dialog = page.getByRole("dialog");
      const rules = drug.getByTestId("review-exam-triggers");
      const ruleRow = (name: string) =>
        rules.getByTestId("review-exam-trigger-rule").filter({ hasText: name });
      const triggersCount = drug.getByTestId("review-triggers-count");
      const form = page.getByTestId("exam-trigger-form");
      // the expiry, the posology, the vancocinemia and the fever
      await expect(triggersCount).toHaveText("4 ativos");
      await expect(
        rules.getByRole("button", { name: "Editar regra" }),
      ).toHaveCount(4);

      // a new rule: a condition is required
      await rules.getByTestId("exam-trigger-add").click();
      await expect(form).toBeVisible();
      await expect(
        form.getByRole("button", { name: "Artigos da base de conhecimento" }),
      ).toBeVisible();
      // the value, the variation or both; the treatment day is optional
      await expect(form.getByTestId("exam-trigger-conditions")).toContainText(
        "Informe o valor, a variação ou ambos",
      );
      await expect(
        form.getByLabel("A partir do dia de tratamento (opcional)"),
      ).toBeVisible();
      await form.getByLabel("Nome").fill("TFG em queda");
      await openSelectById(page, "exam-trigger-exam");
      await pickOption(page, "CKD21");
      await form.getByRole("button", { name: "Salvar" }).click();
      await expect(form).toContainText(
        "Informe ao menos uma condição (valor ou variação)",
      );
      expect(saved).toHaveLength(0);

      // "< 60" and a fall of 25% or more: "≤ -25%"
      await pickOperator(page, "value", "<");
      await form.getByRole("spinbutton", { name: "Valor" }).fill("60");
      await pickOperator(page, "variation", "≤");
      await form.getByRole("spinbutton", { name: "Variação" }).fill("-25");
      await form.getByLabel("A partir do dia de tratamento").fill("2");
      await form.getByRole("button", { name: "Salvar" }).click();

      await expect(page.getByText("Gatilhos de exame salvos")).toBeVisible();
      await expect(form).toHaveCount(0);
      // sent with the ones there, without an id
      expect(saved[0]).toEqual({
        rules: [
          ...EXAM_RULES.map(sentRule),
          {
            name: "TFG em queda",
            examRef: "ckd21",
            valueAbove: null,
            valueAtLeast: null,
            valueBelow: 60,
            valueAtMost: null,
            variationAbove: null,
            variationAtLeast: null,
            variationBelow: null,
            variationAtMost: -25,
            fromCourseDay: 2,
            enabledByDefault: false,
          },
        ],
      });
      // added from the drug, it is on for it, though not on by default
      const added = drug.getByRole("checkbox", { name: /^TFG em queda/ });
      await expect(added).toHaveAccessibleName(
        "TFG em queda < 60 e variação ≤ -25% a partir do D2",
      );
      await expect(added).toBeChecked();
      await expect(triggersCount).toHaveText("5 ativos");

      // a change keeps the id
      await ruleRow("Vancocinemia")
        .getByRole("button", { name: "Editar regra" })
        .click();
      await expect(form.getByLabel("Nome")).toHaveValue("Vancocinemia");
      await expect(form.getByRole("spinbutton", { name: "Valor" })).toHaveValue(
        "20",
      );
      await form.getByRole("spinbutton", { name: "Valor" }).fill("25");
      await form.getByRole("button", { name: "Salvar" }).click();
      await expect(form).toHaveCount(0);
      expect(saved[1].rules[1]).toEqual({
        ...sentRule(EXAM_RULES[1]),
        valueAbove: 25,
      });
      await expect(
        drug.getByRole("checkbox", { name: /^Vancocinemia/ }),
      ).toHaveAccessibleName("Vancocinemia > 25 e variação > +30%");

      // Escape closes the form, not the review
      await ruleRow("Vancocinemia")
        .getByRole("button", { name: "Editar regra" })
        .click();
      await expect(form).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(form).toHaveCount(0);
      await expect(drug).toBeVisible();
      expect(saved).toHaveLength(2);

      // a rule left out of the list is deleted, and no longer sent on
      await ruleRow("Temperatura")
        .getByRole("button", { name: "Excluir" })
        .click();
      await page
        .locator(".ant-popconfirm")
        .getByRole("button", { name: "Excluir" })
        .click();
      await expect(ruleRow("Temperatura")).toHaveCount(0);
      expect(saved[2].rules.map((item: any) => item.id)).toEqual([
        "pcr-rise",
        "van",
        "tfg",
        "new4",
      ]);
      await expect(triggersCount).toHaveText("4 ativos");

      await dialog.getByRole("button", { name: "Próximo" }).click();
      await dialog.getByRole("button", { name: "Próximo" }).click();
      await saveReview(dialog);
      await expect(
        page.getByText("Revisão registrada com sucesso!"),
      ).toBeVisible();
      expect(sent.evaluations).toMatchObject([
        { idDrug: 11, examTriggers: ["van", "new4"] },
      ]);
    });

    test("keeps the rule form open with the backend message when its save fails", async ({
      page,
      mockApi,
    }) => {
      mockPage(mockApi, followUp());
      mockApi.override(SAVE_EXAM_TRIGGERS, {
        status: 400,
        json: {
          status: "error",
          code: "errors.invalidParams",
          message: "Gatilho de exame inválido: nome repetido",
        },
      });

      const drug = await openTriggers(page);
      await drug
        .getByTestId("review-exam-trigger-rule")
        .filter({ hasText: "TFG" })
        .getByRole("button", { name: "Editar regra" })
        .click();
      const form = page.getByTestId("exam-trigger-form");
      await form.getByLabel("Nome").fill("Vancocinemia");
      await form.getByRole("button", { name: "Salvar" }).click();

      await expect(
        page.getByText("Gatilho de exame inválido: nome repetido"),
      ).toBeVisible();
      await expect(form).toBeVisible();
      await expect(drug.getByRole("checkbox", { name: /^TFG/ })).toBeVisible();
    });

    test("shows the patient's current result of each rule's exam, in the list and in the rule form", async ({
      page,
      mockApi,
    }) => {
      mockPage(mockApi, followUp());
      let admissionNumber: string | null = null;
      mockApi.override(EXAM_TRIGGERS, async (route) => {
        admissionNumber = new URL(route.request().url()).searchParams.get(
          "admissionNumber",
        );
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            status: "success",
            data: {
              rules: EXAM_RULES,
              exams: EXAMS,
              current: {
                temp: null,
                ckd: null,
                ckd21: {
                  examType: "cr",
                  date: "2026-11-10T08:30:00",
                  value: 72,
                  unit: "mL/min/1.73m²",
                  rawValue: 1.1,
                  rawUnit: "mg/dL",
                },
                h_conleuc: null,
                procalcitonina_adult: null,
                van: null,
              },
            },
          }),
        });
      });

      const drug = await openTriggers(page);
      expect(admissionNumber).toBe(`${ADMISSION}`);

      // under each rule of the list; none for one the hospital doesn't
      // configure
      await expect(
        drug.getByTestId("review-exam-trigger-current-tfg"),
      ).toHaveText(
        "Resultado atual do paciente: 72 mL/min/1.73m² em 10/11/2026 08:30 (creatinina 1,1 mg/dL)",
      );
      await expect(
        drug.getByTestId("review-exam-trigger-current-temp"),
      ).toHaveText("Paciente sem resultado deste exame");
      await expect(
        drug.getByTestId("review-exam-trigger-current-pcr-rise"),
      ).toHaveCount(0);

      await drug.getByTestId("exam-trigger-add").click();
      const form = page.getByTestId("exam-trigger-form");
      const current = form.getByTestId("exam-trigger-form-current");

      // the baseline a review saved now would keep
      await openSelectById(page, "exam-trigger-exam");
      await pickOption(page, "CKD21");
      await expect(current).toHaveText(
        "Resultado atual do paciente: 72 mL/min/1.73m² em 10/11/2026 08:30 (creatinina 1,1 mg/dL)",
      );

      await openSelectById(page, "exam-trigger-exam");
      await pickOption(page, "Temperatura");
      await expect(current).toHaveText("Paciente sem resultado deste exame");

      // an exam the hospital doesn't configure has no result to show
      await openSelectById(page, "exam-trigger-exam");
      await pickOption(page, "PCR (não configurado)");
      await expect(
        form.getByTestId("exam-trigger-form-unavailable"),
      ).toHaveText("PCR não configurado neste hospital: o gatilho não dispara");
      await expect(current).toHaveCount(0);
    });

    test("does not change the rules when they could not be loaded", async ({
      page,
      mockApi,
    }) => {
      mockApi.override(EXAM_TRIGGERS, {
        status: 500,
        json: { status: "error", message: "erro" },
      });
      mockPage(
        mockApi,
        followUp({
          courses: [
            {
              idDrug: 12,
              start: VANCOMYCIN_START,
              ongoing: true,
              evaluation: withExamTriggers,
              history: [withExamTriggers],
            },
          ],
        }),
      );

      // the ones the evaluation keeps, which a save would replace the
      // schema's with
      const drug = await openTriggers(page);
      const rules = drug.getByTestId("review-exam-triggers");
      await expect(rules.getByRole("checkbox", { name: /^TFG/ })).toBeChecked();
      await expect(rules.getByTestId("exam-trigger-add")).toHaveCount(0);
      await expect(
        rules.getByRole("button", { name: "Editar regra" }),
      ).toHaveCount(0);
    });

    test("offers to add the first rule when the schema has none", async ({
      page,
      mockApi,
    }) => {
      mockApi.override(EXAM_TRIGGERS, {
        json: { status: "success", data: { rules: [], exams: EXAMS } },
      });
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

      const drug = await openTriggers(page);
      const dialog = page.getByRole("dialog");
      await expect(drug.getByTestId("review-triggers-count")).toHaveText(
        "2 ativos",
      );
      await expect(
        drug.getByRole("checkbox", { name: WATCH_EXPIRY }),
      ).toBeVisible();
      const rules = drug.getByTestId("review-exam-triggers");
      await expect(rules).toContainText("Nenhuma regra cadastrada");
      await expect(rules.getByTestId("exam-trigger-add")).toBeEnabled();

      await dialog.getByRole("button", { name: "Próximo" }).click();
      await dialog.getByRole("button", { name: "Próximo" }).click();
      await saveReview(dialog);
      await expect(
        page.getByText("Revisão registrada com sucesso!"),
      ).toBeVisible();
      expect(sent.evaluations).toMatchObject([
        { idDrug: 11, examTriggers: [] },
      ]);
    });
  });
});

test.describe("with READ_INFECTION_CONTROL only", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page, mockApi }) => {
    await loginWithPermissions(page, mockApi, [
      ...BASE_PERMISSIONS,
      "READ_INFECTION_CONTROL",
    ]);
    mockApi.override("GET /intervention/reasons", {
      json: { status: "success", data: REASONS },
    });
  });

  test("goes through the review but cannot save it", async ({
    page,
    mockApi,
  }) => {
    mockPage(mockApi, followUp());
    let saved = 0;
    mockApi.override(REVIEW, async (route) => {
      saved += 1;
      await route.fulfill({ status: 200, json: followUp() });
    });

    await page.goto(PAGE_URL);
    await openReview(page);

    const dialog = page.getByRole("dialog");
    const drug = dialog.getByTestId("review-drug");
    await drug
      .getByRole("radiogroup", { name: "Avaliação" })
      .getByText("Conforme", { exact: true })
      .click();
    await fillIndication(page, drug);
    await dialog
      .getByRole("button", { name: "Próximo antimicrobiano" })
      .click();
    await dialog.getByRole("button", { name: "Próximo: paciente" }).click();
    await dialog.getByRole("button", { name: "Próximo: evolução" }).click();

    await expect(dialog.getByText("Etapa 4 de 4")).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: "Registrar revisão" }),
    ).toBeDisabled();
    await expect(dialog.getByTestId("review-hint")).toHaveText(
      "Você não tem permissão para registrar revisões",
    );
    expect(saved).toBe(0);
  });

  test("turns the exam trigger rules on and off but does not change them", async ({
    page,
    mockApi,
  }) => {
    mockApi.override("GET /infection-control/exam-triggers", {
      json: { status: "success", data: { rules: EXAM_RULES, exams: EXAMS } },
    });
    mockPage(mockApi, followUp());

    await page.goto(PAGE_URL);
    await openReview(page);
    const drug = page.getByRole("dialog").getByTestId("review-drug");
    await drug
      .getByRole("radiogroup", { name: "Avaliação" })
      .getByText("Conforme", { exact: true })
      .click();
    await drug
      .getByTestId("review-triggers")
      .getByRole("button", { name: "Alterar" })
      .click();
    const rules = drug.getByTestId("review-exam-triggers");
    await expect(
      rules.getByRole("checkbox", { name: /^Vancocinemia/ }),
    ).toBeChecked();
    await expect(rules.getByTestId("exam-trigger-add")).toHaveCount(0);
    await expect(
      rules.getByRole("button", { name: "Editar regra" }),
    ).toHaveCount(0);
    await expect(rules.getByRole("button", { name: "Excluir" })).toHaveCount(0);
  });

  test("does not start the follow-up", async ({ page, mockApi }) => {
    mockPage(mockApi, notFollowed());

    await page.goto(PAGE_URL);

    await expect(
      page.getByTestId("follow-up").getByTestId("follow-up-status"),
    ).toHaveText("Não acompanhado", { timeout: 15000 });
    await expect(
      (await openMoreActions(page)).getByRole("menuitem", {
        name: "Iniciar acompanhamento",
      }),
    ).toHaveCount(0);
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

  // the statuses are checkboxes, always in sight: a click checks or unchecks one
  const toggleStatus = async (page: Page, status: string) => {
    await page
      .locator("#status")
      .getByRole("checkbox", { name: status, exact: true })
      .click();
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
    await toggleStatus(page, "Revisado");
    await pickOption(page, "#departments", "UTI Adulto");

    // pending reason and overdue review, under "see more"
    await openMoreFilters(page);
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
    await toggleStatus(page, "Pendente");
    await toggleStatus(page, "Revisado");
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
    await toggleStatus(page, "Encerrado");
    await openMoreFilters(page);
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

    // searched by admission number (under "see more"), every closed one of
    // them is listed
    await openMoreFilters(page);
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

    await openMoreFilters(page);
    await expect(page.locator("#closedDays")).toBeDisabled();
  });

  test("disables the filters closed patients never match", async ({ page }) => {
    await page.goto("/controle-infeccao");
    await expect(
      page.getByRole("heading", { name: "Controle de Infecção" }),
    ).toBeVisible({ timeout: 15000 });

    // only the closed ones
    await toggleStatus(page, "Encerrado");
    await toggleStatus(page, "Pendente");

    await openMoreFilters(page);
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
    await openMoreFilters(page);
    await pickOption(page, "#pendingTypes", "Antimicrobiano sem avaliação");
    await page.locator("#nonConforming").click();

    // then only the closed ones: the reason is disabled, and not sent
    await toggleStatus(page, "Encerrado");
    await toggleStatus(page, "Pendente");
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
    await openMoreFilters(page);
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
    await openMoreFilters(page);
    await page.getByText("Todas as linhas (E)", { exact: true }).click();
    await page.locator(".gtm-btn-search").click();
    await expect
      .poll(() => lists(mockApi).at(-1)?.antimicrobialsMatchAll)
      .toBe(true);

    // removing the first row keeps the other one
    await openMoreFilters(page);
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
    await openMoreFilters(page);
    await pickOption(page, "#pendingTypes", "Antimicrobiano sem avaliação");
    await page.locator(".gtm-btn-search").click();

    // the status stays behind: the next one is always a pending one
    await expect(link).toHaveAttribute(
      "href",
      `${PAGE_URL}?idDepartment=10&pendingTypes=2`,
    );
  });

  test.describe("by segment", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page, mockApi }) => {
      await loginWithAuth(page, mockApi, {
        permissions: BASE_PERMISSIONS,
        segments: [
          { id: 1, description: "Adulto", status: 1 },
          { id: 2, description: "Pediatria", status: 1 },
        ],
      });
      mockApi.override("GET /segments/departments", {
        json: {
          status: "success",
          data: [
            { idDepartment: 10, idSegment: 1, label: "UTI Adulto" },
            { idDepartment: 20, idSegment: 1, label: "Clínica Médica" },
            { idDepartment: 30, idSegment: 2, label: "UTI Pediátrica" },
          ],
        },
      });
      mockApi.override(LIST, {
        json: {
          status: "success",
          data: { count: 1, admissions: [admission] },
        },
      });
    });

    test("filters by segment, its departments only, and takes it to the patient page", async ({
      page,
      mockApi,
    }) => {
      await page.goto("/controle-infeccao");
      const link = page
        .getByRole("row", { name: new RegExp(`${ADMISSION}`) })
        .getByRole("link", { name: "Abrir" });
      await expect(link).toHaveAttribute("href", PAGE_URL, { timeout: 15000 });

      // status, segment and department up front: every status in sight, the
      // pending ones checked
      const statuses = page.locator("#status").getByRole("checkbox");
      await expect(statuses).toHaveCount(3);
      await expect(
        page.locator("#status").getByRole("checkbox", { name: "Pendente" }),
      ).toBeChecked();

      // a department of another segment is dropped when the segment is picked
      await pickOption(page, "#departments", "UTI Pediátrica");
      await pickOption(page, "#segments", "Adulto");
      await page.locator(".gtm-btn-search").click();
      await expect
        .poll(() => lists(mockApi).at(-1))
        .toMatchObject({ idSegment: [1], idDepartment: [] });

      // only the departments of the segment are offered
      await page.locator("#departments").click();
      const options = page.locator(
        ".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option",
      );
      await expect(options).toHaveText(["UTI Adulto", "Clínica Médica"]);
      await options.filter({ hasText: "UTI Adulto" }).click();
      await page.keyboard.press("Escape");
      await page.locator(".gtm-btn-search").click();

      await expect
        .poll(() => lists(mockApi).at(-1))
        .toMatchObject({ idSegment: [1], idDepartment: [10] });
      await expect(link).toHaveAttribute(
        "href",
        `${PAGE_URL}?idSegment=1&idDepartment=10`,
      );
    });
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
    await toggleStatus(page, "Pendente");
    await toggleStatus(page, "Revisado");
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

    await toggleStatus(page, "Revisado");

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
    const status = (name: string) =>
      page.locator("#status").getByRole("checkbox", { name, exact: true });
    await expect(status("Revisado")).toBeChecked();
    await expect(status("Pendente")).not.toBeChecked();
    await openMoreFilters(page);
    await expect(
      page.locator(".ant-select-selection-item", {
        hasText: "CEFEPIMA 2 g SOL INJ",
      }),
    ).toBeVisible();
    await expect(page.locator("#treatmentDayFrom-0")).toHaveValue("1");
    await expect(page.locator("#nonConforming")).toBeChecked();
  });
});

test.describe("integration utilities", () => {
  const BACKFILL = "POST /infection-control/backfill";
  const BACKFILL_SUMMARY = "POST /infection-control/backfill-summary";
  const UTILITIES = '[data-kb="infectionControl.worklist.backfill"]';

  test.use({ storageState: { cookies: [], origins: [] } });

  const bodies = (mockApi: MockApi, path: string) =>
    mockApi.requests
      .filter((r) => r.path === path)
      .map((r) => JSON.parse(r.postData!));

  // two batches: the first one full, resumed after its last admission
  const batches = (counter: "created" | "filled") => {
    let call = 0;
    return async (route: Route) => {
      call += 1;
      await route.fulfill({
        json: {
          status: "success",
          data:
            call === 1
              ? { processed: 50, [counter]: 10, next: 9350 }
              : { processed: 7, [counter]: 2, next: null },
        },
      });
    };
  };

  test("are not offered without INTEGRATION_UTILS", async ({
    page,
    mockApi,
  }) => {
    await loginWithPermissions(page, mockApi, [
      ...BASE_PERMISSIONS,
      "READ_INFECTION_CONTROL",
    ]);
    await page.goto("/controle-infeccao");

    await expect(
      page.getByRole("heading", { name: "Controle de Infecção" }),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.locator(UTILITIES)).toHaveCount(0);
  });

  test.describe("with INTEGRATION_UTILS", () => {
    test.beforeEach(async ({ page, mockApi }) => {
      await loginWithPermissions(page, mockApi, [
        ...BASE_PERMISSIONS,
        "READ_INFECTION_CONTROL",
        "INTEGRATION_UTILS",
      ]);
      await page.goto("/controle-infeccao");
      await expect(page.locator(UTILITIES)).toBeVisible({ timeout: 15000 });
    });

    test("marks the utilities as maintainer only", async ({ page }) => {
      await expect(
        page.locator(UTILITIES).getByTestId("maintainer-badge"),
      ).toBeVisible();
    });

    test("follows the admissions on antimicrobials, batch after batch", async ({
      page,
      mockApi,
    }) => {
      mockApi.override(BACKFILL, batches("created"));
      const listsBefore = bodies(mockApi, "/infection-control/admissions");

      await pickMenuItem(
        page,
        page.locator(UTILITIES),
        /Acompanhar internações em uso de antimicrobianos/,
      );
      // nothing runs before it is confirmed
      expect(bodies(mockApi, "/infection-control/backfill")).toHaveLength(0);
      await page.getByRole("button", { name: "Executar" }).click();

      await expect(
        page.getByText(
          "57 internações processadas, 12 passaram a ser acompanhadas.",
        ),
      ).toBeVisible();
      expect(bodies(mockApi, "/infection-control/backfill")).toEqual([
        { after: 0 },
        { after: 9350 },
      ]);
      // the list is loaded again, with the admissions just followed
      expect(
        bodies(mockApi, "/infection-control/admissions").length,
      ).toBeGreaterThan(listsBefore.length);
    });

    test("fills the report summaries, batch after batch", async ({
      page,
      mockApi,
    }) => {
      mockApi.override(BACKFILL_SUMMARY, batches("filled"));

      await pickMenuItem(
        page,
        page.locator(UTILITIES),
        /Preencher resumos do relatório/,
      );
      await page.getByRole("button", { name: "Executar" }).click();

      await expect(
        page.getByText("57 internações processadas, 12 resumos preenchidos."),
      ).toBeVisible();
      expect(bodies(mockApi, "/infection-control/backfill-summary")).toEqual([
        { after: 0 },
        { after: 9350 },
      ]);
    });

    test("stops at the batch that fails and says what was done", async ({
      page,
      mockApi,
    }) => {
      let call = 0;
      mockApi.override(BACKFILL, async (route) => {
        call += 1;
        await route.fulfill(
          call === 1
            ? {
                json: {
                  status: "success",
                  data: { processed: 50, created: 10, next: 9350 },
                },
              }
            : {
                status: 500,
                json: { status: "error", message: "Falha no lote" },
              },
        );
      });

      await pickMenuItem(
        page,
        page.locator(UTILITIES),
        /Acompanhar internações em uso de antimicrobianos/,
      );
      await page.getByRole("button", { name: "Executar" }).click();

      await expect(page.getByText("Falha no lote")).toBeVisible();
      await expect(
        page.getByText(
          "Antes do erro: 50 internações processadas, 10 passaram a ser acompanhadas.",
        ),
      ).toBeVisible();
      expect(bodies(mockApi, "/infection-control/backfill")).toHaveLength(2);
    });
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
      "idSegment=1&idDepartment=10,20&pendingTypes=2&awareLevels=3" +
      `&antimicrobials=${encodeURIComponent(JSON.stringify(antimicrobials))}` +
      "&antimicrobialsMatchAll=1&overdueReview=1&nonConforming=1";

    await page.goto(`${PAGE_URL}?${search}`);
    await pickMoreAction(page, NEXT);

    expect(lists(mockApi)[0]).toMatchObject({
      status: [1],
      idSegment: [1],
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
