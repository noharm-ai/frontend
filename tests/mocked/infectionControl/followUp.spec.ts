import { test, expect } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";

/**
 * Infection control follow-up (src/features/infectionControl).
 *
 * GET /infection-control/admission/:admissionNumber brings the follow-up of
 * the admission: its status (pending / revised / closed), the reasons it is
 * pending, the reviews and the evaluation of each antimicrobial course (keyed
 * by drug + course start, like the timeline). Users with
 * WRITE_INFECTION_CONTROL register reviews (POST /infection-control/review).
 * /controle-infeccao lists the followed admissions
 * (POST /infection-control/admissions).
 */

const ADMISSION = 9300;
const PATIENT_ID = 4330;
const PAGE_URL = `/controle-infeccao/${ADMISSION}`;
const TIMELINE =
  "GET /infection-control/antimicrobial-timeline/:admissionNumber";
const FOLLOW_UP = "GET /infection-control/admission/:admissionNumber";
const REVIEW = "POST /infection-control/review";
const LIST = "POST /infection-control/admissions";

const BASE_PERMISSIONS = [
  "READ_BASIC_FEATURES",
  "WRITE_BASIC_FEATURES",
  "READ_PRESCRIPTION",
  "READ_SUPPORT",
];

/** A naive ISO date some hours away from now, as the backend sends it */
const hoursFromNow = (hours: number) =>
  new Date(Date.now() + hours * 60 * 60 * 1000).toISOString().slice(0, 19);

/** dd/mm/yyyy of a fixture date, as the page shows it (read as local time) */
const shownDate = (isoDate: string) =>
  isoDate.slice(0, 10).split("-").reverse().join("/");

const MEROPENEM_START = hoursFromNow(-48);
const VANCOMYCIN_START = hoursFromNow(-96);

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
        end: hoursFromNow(24),
        days: 3,
      }),
      course({
        idDrug: 12,
        drug: "VANCOMICINA 500 mg SOL INJ",
        start: VANCOMYCIN_START,
        end: hoursFromNow(24),
        days: 5,
      }),
    ],
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
  validUntil: hoursFromNow(5 * 24),
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
  mockApi.override(FOLLOW_UP, { json: followUp() });

  await page.goto(PAGE_URL);

  const box = page.getByTestId("follow-up");
  await expect(box).toBeVisible({ timeout: 15000 });
  await expect(box.getByTestId("follow-up-status")).toHaveText("Pendente");
  await expect(box.getByTestId("follow-up-pendings")).toContainText(
    "MEROPENEM 1 g SOL INJ sem avaliação",
  );
  await expect(box).toContainText("Não agendada");
  await expect(box).toContainText("Maria Teste");

  const cards = page.getByTestId("current-course");
  await expect(
    cards.filter({ hasText: "MEROPENEM" }).getByTestId("evaluation-tag"),
  ).toHaveText("Sem avaliação");
  await expect(
    cards.filter({ hasText: "VANCOMICINA" }).getByTestId("evaluation-tag"),
  ).toHaveText(`Conforme · até ${shownDate(vancomycinEvaluation.validUntil)}`);

  // the review history lists what each review evaluated
  const review = page.getByTestId("review-item");
  await expect(review).toContainText("Paciente estável, manter vancomicina");
  await expect(review).toContainText("VANCOMICINA 500 mg SOL INJ");
  await expect(review).toContainText("Guiado por cultura");

  // the default user cannot register reviews
  await expect(
    page.getByRole("button", { name: "Registrar revisão" }),
  ).toHaveCount(0);
});

test("leaves the follow-up out when the schema does not have it", async ({
  page,
}) => {
  // default handler: { enabled: false }
  await page.goto(PAGE_URL);

  await expect(page.getByTestId("current-course")).toHaveCount(2, {
    timeout: 15000,
  });
  await expect(page.getByTestId("follow-up")).toHaveCount(0);
  await expect(page.getByTestId("evaluation-tag")).toHaveCount(0);
});

test.describe("with WRITE_INFECTION_CONTROL", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page, mockApi }) => {
    await loginWithPermissions(page, mockApi, [
      ...BASE_PERMISSIONS,
      "WRITE_INFECTION_CONTROL",
    ]);
  });

  test("registers a review evaluating the drug without evaluation", async ({
    page,
    mockApi,
  }) => {
    mockApi.override(FOLLOW_UP, { json: followUp() });
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
      .getByRole("button", { name: "Registrar revisão" })
      .click({ timeout: 15000 });

    const dialog = page.getByRole("dialog");
    const drugs = dialog.getByTestId("review-drug");
    await expect(drugs).toHaveCount(2);

    // the drug without an evaluation comes selected, the evaluated one does not
    const meropenem = drugs.filter({ hasText: "MEROPENEM" });
    const vancomycin = drugs.filter({ hasText: "VANCOMICINA" });
    await expect(meropenem.getByRole("checkbox")).toBeChecked();
    await expect(vancomycin.getByRole("checkbox")).not.toBeChecked();

    // conformity and validity are required for a selected drug
    await dialog.getByRole("button", { name: "Salvar" }).click();
    await expect(meropenem.getByText("Campo obrigatório")).toHaveCount(2);
    expect(sent).toBeNull();

    await meropenem.getByText("Não conforme").click();
    await meropenem.getByLabel("Válida até").click();
    await page.getByText("7 dias", { exact: true }).click();
    await meropenem
      .getByLabel("Observação", { exact: true })
      .fill("Espectro amplo demais");
    await dialog
      .getByLabel("Observações da revisão")
      .fill("Sugerido descalonamento");

    await dialog.getByRole("button", { name: "Salvar" }).click();

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
          notes: "Espectro amplo demais",
        },
      ],
    });
    expect(sent.evaluations[0].validUntil).toMatch(/T23:59:59$/);

    // the page shows the follow-up the save returned
    await expect(dialog).toHaveCount(0);
    await expect(page.getByTestId("follow-up-status")).toHaveText("Revisado");
    await expect(page.getByTestId("follow-up-pendings")).toContainText(
      "Nenhuma pendência.",
    );
  });

  test("keeps the modal open and shows the error when the save fails", async ({
    page,
    mockApi,
  }) => {
    mockApi.override(FOLLOW_UP, { json: followUp() });
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
      .getByRole("button", { name: "Registrar revisão" })
      .click({ timeout: 15000 });

    const dialog = page.getByRole("dialog");
    // nothing selected: a review that only records the visit
    await dialog
      .getByTestId("review-drug")
      .filter({ hasText: "MEROPENEM" })
      .getByRole("checkbox")
      .uncheck();
    await dialog.getByRole("button", { name: "Salvar" }).click();

    await expect(
      page.getByText("Antimicrobiano não está em uso neste atendimento"),
    ).toBeVisible();
    await expect(dialog).toBeVisible();
    await expect(page.getByTestId("follow-up-status")).toHaveText("Pendente");
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

  test("lists the followed patients and filters them by status", async ({
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
    await expect(row.getByRole("link", { name: "Abrir" })).toHaveAttribute(
      "href",
      PAGE_URL,
    );

    const lists = () =>
      mockApi.requests
        .filter((r) => r.path === "/infection-control/admissions")
        .map((r) => JSON.parse(r.postData!));
    expect(lists()[0]).toMatchObject({ status: [1], offset: 0 });

    await page.getByText("Revisados", { exact: true }).click();
    await expect
      .poll(() => lists().at(-1))
      .toMatchObject({ status: [2], offset: 0 });
  });
});
