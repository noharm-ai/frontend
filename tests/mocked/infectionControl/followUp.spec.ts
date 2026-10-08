import { test, expect } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";

/**
 * Infection control follow-up (src/features/infectionControl).
 *
 * GET /infection-control/admission/:admissionNumber brings the follow-up of
 * the admission: its status (pending / revised / closed), the reasons it is
 * pending, the reviews and the evaluation of each antimicrobial course (keyed
 * by drug + course start, like the timeline). Users with
 * WRITE_INFECTION_CONTROL register reviews (POST /infection-control/review)
 * of a followed admission, and start following one that is not yet (POST
 * /infection-control/admission/:admissionNumber/follow).
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
const FOLLOW = "POST /infection-control/admission/:admissionNumber/follow";
const LIST = "POST /infection-control/admissions";
const EVALUATE_NOW = "Avaliar este antimicrobiano nesta revisão";
const WATCH_EXPIRY = /Quando a avaliação vencer/;
const WATCH_POSOLOGY = /Quando a posologia mudar/;

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
  await expect(box.getByTestId("follow-up-pendings-count")).toHaveText(
    "1 pendência",
  );
  await expect(box).toContainText("Não agendada");
  await expect(box).toContainText("Maria Teste");

  // the card only counts them; the reasons are listed in a modal
  await expect(box).not.toContainText("MEROPENEM 1 g SOL INJ sem avaliação");
  await box.getByRole("button", { name: "Ver pendências" }).click();
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
  await expect(
    page.getByRole("button", { name: "Registrar revisão" }),
  ).toHaveCount(0);

  // the review history opens from the follow-up, listing what each review
  // evaluated
  await box.getByRole("button", { name: "Ver histórico (1)" }).click();
  const history = page.getByRole("dialog");
  const review = history.getByTestId("review-item");
  await expect(review).toContainText("Paciente estável, manter vancomicina");
  await expect(review).toContainText("VANCOMICINA 500 mg SOL INJ");
  await expect(review).toContainText("Guiado por cultura");
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
  mockApi.override(FOLLOW_UP, {
    json: followUp({
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
  });

  await page.goto(PAGE_URL);

  const rows = page.getByTestId("course-row");
  await expect(rows).toHaveCount(2, { timeout: 15000 });
  await expect(
    rows.filter({ hasText: "MEROPENEM" }).getByTestId("course-evaluation"),
  ).toHaveCount(0);

  const marks = rows
    .filter({ hasText: "VANCOMICINA" })
    .getByTestId("course-evaluation");
  await expect(marks).toHaveCount(2);

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

  await expect(page.getByText("Avaliação conforme (vigência)")).toBeVisible();
});

test("leaves the follow-up out when the schema does not have it", async ({
  page,
}) => {
  // default handler: { enabled: false }
  await page.goto(PAGE_URL);

  await expect(page.getByTestId("course-row")).toHaveCount(2, {
    timeout: 15000,
  });
  await expect(page.getByTestId("follow-up")).toHaveCount(0);
  await expect(page.getByTestId("course-evaluation")).toHaveCount(0);
});

test("does not offer to review nor follow an admission not followed without permission", async ({
  page,
  mockApi,
}) => {
  mockApi.override(FOLLOW_UP, { json: notFollowed() });

  await page.goto(PAGE_URL);

  const box = page.getByTestId("follow-up");
  await expect(box.getByTestId("follow-up-status")).toHaveText(
    "Não acompanhado",
    { timeout: 15000 },
  );
  await expect(
    page.getByRole("button", { name: "Iniciar acompanhamento" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Registrar revisão" }),
  ).toHaveCount(0);
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
    const next = dialog.getByRole("button", { name: "Próximo" });
    const drug = dialog.getByTestId("review-drug");
    const evaluateBox = drug.getByRole("checkbox", { name: EVALUATE_NOW });
    const expiryBox = drug.getByRole("checkbox", { name: WATCH_EXPIRY });
    const posologyBox = drug.getByRole("checkbox", { name: WATCH_POSOLOGY });

    // one step per running drug, then the patient
    await expect(dialog.locator(".ant-steps-item")).toHaveCount(3);

    // step 1: the drug without an evaluation comes selected, with its timeline
    await expect(drug.getByRole("heading")).toHaveText("MEROPENEM 1 g SOL INJ");
    await expect(evaluateBox).toBeChecked();
    // expiry and a posology change send it back to pending unless unchecked
    await expect(expiryBox).toBeChecked();
    await expect(posologyBox).toBeChecked();
    const timeline = drug.getByTestId("review-timeline");
    await expect(timeline.getByTestId("course-row")).toHaveCount(1);
    // the step names the drug, its timeline shows only the day of treatment
    await expect(timeline.getByTestId("course-row")).toHaveText(/^D3/);

    // the conformity is required to move on
    const MEROPENEM_PLUS_7 = localDay(7, MEROPENEM_START);
    await next.click();
    await expect(drug.getByText("Campo obrigatório")).toHaveCount(1);
    await expect(drug.getByRole("heading")).toHaveText("MEROPENEM 1 g SOL INJ");

    // it starts at the course start and holds until the treatment ends,
    // unless chosen otherwise
    await expect(
      drug
        .getByRole("radiogroup", { name: "Inicia em" })
        .getByRole("radio", { checked: true }),
    ).toHaveAccessibleName(
      `Início do tratamento (${shownDate(MEROPENEM_START).slice(0, 5)})`,
    );
    const validity = drug.getByRole("radiogroup", {
      name: "Conformidade válida até",
    });
    await expect(
      validity.getByRole("radio", { checked: true }),
    ).toHaveAccessibleName(
      `Fim do tratamento (${shownDate(MEROPENEM_END).slice(0, 5)})`,
    );

    // the timeline plots the evaluation as it is filled: grey until the
    // verdict comes
    const draft = timeline.getByTestId("draft-evaluation");
    await expect(draft).toHaveClass(/undecided/);
    await drug.getByText("Não conforme").click();
    await expect(draft).toHaveClass(/non-conforming/);
    await validity
      .getByText(`+7 dias (${shownDate(MEROPENEM_PLUS_7).slice(0, 5)})`)
      .click();
    await draft.hover();
    await expect(page.getByRole("tooltip")).toContainText(
      "Nova avaliação (não salva)",
    );
    await expect(page.getByRole("tooltip")).toContainText(
      `Válida até ${shownDate(MEROPENEM_PLUS_7)}`,
    );
    // filling a field clears its error
    await expect(drug.getByText("Campo obrigatório")).toHaveCount(0);
    await drug
      .getByLabel("Observação", { exact: true })
      .fill("Espectro amplo demais");
    await next.click();

    // step 2: the evaluated drug shows its current evaluation, not selected
    await expect(drug.getByRole("heading")).toHaveText(
      "VANCOMICINA 500 mg SOL INJ",
    );
    await expect(evaluateBox).not.toBeChecked();
    await expect(drug).toContainText("Guiado por cultura");
    const vancomycinTimeline = drug.getByTestId("review-timeline");
    const current = vancomycinTimeline.getByTestId("course-evaluation");
    await expect(current).toHaveCount(1);
    await expect(current).not.toHaveClass(/past/);

    // evaluating it again previews the new one replacing the current from now
    await evaluateBox.check();
    await drug
      .locator(".drug-fields")
      .getByText("Conforme", { exact: true })
      .click();
    await expect(
      validity.getByRole("radio", { checked: true }),
    ).toHaveAccessibleName(
      `Fim do tratamento (${shownDate(VANCOMYCIN_END).slice(0, 5)})`,
    );
    await expect(
      vancomycinTimeline.getByTestId("draft-evaluation"),
    ).toHaveClass(/conforming/);
    await expect(current).toHaveClass(/past/);
    await evaluateBox.uncheck();
    await expect(
      vancomycinTimeline.getByTestId("draft-evaluation"),
    ).toHaveCount(0);
    await expect(current).not.toHaveClass(/past/);
    await next.click();

    // last step: what the review records, the next review and its notes
    const summary = dialog.getByTestId("review-summary");
    await expect(summary).toContainText(
      `Não conforme · desde ${shownDate(MEROPENEM_START)} · até ${shownDate(MEROPENEM_PLUS_7)}`,
    );
    await expect(summary).toContainText("Mantém a avaliação atual");
    await expect(next).toHaveCount(0);
    await expect(dialog.locator(".ant-steps-item").nth(2)).toHaveClass(
      /ant-steps-item-process/,
    );
    await dialog
      .getByLabel("Observações da revisão")
      .fill("Sugerido descalonamento");

    expect(sent).toBeNull();
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
    mockApi.override(FOLLOW_UP, { json: followUp() });
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
      .getByRole("button", { name: "Registrar revisão" })
      .click({ timeout: 15000 });

    const dialog = page.getByRole("dialog");
    const next = dialog.getByRole("button", { name: "Próximo" });
    const drug = dialog.getByTestId("review-drug");
    const fields = drug.locator(".drug-fields");
    const start = drug.getByRole("radiogroup", { name: "Inicia em" });
    const validity = drug.getByRole("radiogroup", {
      name: "Conformidade válida até",
    });
    const draft = drug.getByTestId("draft-evaluation");

    // meropenem: the defaults, from the course start to the treatment end
    await fields.getByText("Conforme", { exact: true }).click();
    await draft.hover();
    await expect(page.getByRole("tooltip")).toContainText("Vale desde");
    await next.click();

    // vancomycin: now, until a chosen day
    await expect(drug.getByRole("heading")).toHaveText(
      "VANCOMICINA 500 mg SOL INJ",
    );
    await drug.getByRole("checkbox", { name: EVALUATE_NOW }).check();
    await fields.getByText("Não conforme", { exact: true }).click();
    await start.getByText("Agora", { exact: true }).click();
    await validity.getByText("Outra data", { exact: true }).click();
    // a chosen day is required once picked
    await next.click();
    await expect(drug.getByText("Campo obrigatório")).toHaveCount(1);
    const until = drug.getByRole("textbox", {
      name: "Conformidade válida até",
    });
    await until.fill(shownDate(localDay(3)));
    // Enter takes the typed day and moves on
    await until.press("Enter");

    const summary = dialog.getByTestId("review-summary");
    await expect(summary).toContainText(
      `Conforme · desde ${shownDate(MEROPENEM_START)} · até ${shownDate(MEROPENEM_END)}`,
    );
    await expect(summary).toContainText(
      `Não conforme · até ${shownDate(localDay(3))}`,
    );
    await dialog.getByRole("button", { name: "Salvar" }).click();

    await expect(
      page.getByText("Revisão registrada com sucesso!"),
    ).toBeVisible();
    expect(sent.evaluations).toMatchObject([
      {
        idDrug: 11,
        validFrom: MEROPENEM_START,
        validUntil: `${MEROPENEM_END.slice(0, 10)}T23:59:59`,
      },
      {
        idDrug: 12,
        validFrom: null,
        validUntil: `${localDay(3)}T23:59:59`,
      },
    ]);
  });

  test("records a conformity whose validity is already over", async ({
    page,
    mockApi,
  }) => {
    // started 12 days ago, its prescription expired yesterday
    const OLD_START = hoursFromNow(-12 * 24);
    const OLD_END = hoursFromNow(-30);
    mockApi.override(TIMELINE, {
      json: {
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
      },
    });
    mockApi.override(FOLLOW_UP, {
      json: followUp({
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
    });
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
      .getByRole("button", { name: "Registrar revisão" })
      .click({ timeout: 15000 });

    const dialog = page.getByRole("dialog");
    const drug = dialog.getByTestId("review-drug");
    const start = drug.getByRole("radiogroup", { name: "Inicia em" });
    const validity = drug.getByRole("radiogroup", {
      name: "Conformidade válida até",
    });
    const treatmentEnd = validity.getByRole("radio", {
      name: /^Fim do tratamento/,
    });
    const plus7 = validity.getByRole("radio", { name: /^\+7 dias/ });
    const pastNotice = drug.getByTestId("review-end-past");
    await drug
      .locator(".drug-fields")
      .getByText("Conforme", { exact: true })
      .click();

    // from the course start to the treatment end, both past: recorded
    // already expired, which keeps the patient pending while it watches
    // the expiry
    await expect(treatmentEnd).toBeChecked();
    await expect(pastNotice).toContainText("o paciente continua pendente");
    await drug.getByRole("checkbox", { name: WATCH_EXPIRY }).uncheck();
    await expect(pastNotice).toHaveText(
      "Esta data já passou: a conformidade é registrada já vencida.",
    );
    await expect(plus7).toHaveAccessibleName(
      `+7 dias (${shownDate(localDay(7, OLD_START)).slice(0, 5)})`,
    );

    // starting now, the treatment end is behind it
    await start.getByText("Agora", { exact: true }).click();
    await expect(treatmentEnd).toBeDisabled();
    await dialog.getByRole("button", { name: "Próximo" }).click();
    await expect(
      drug.getByText("A validade deve terminar depois do início"),
    ).toBeVisible();
    await validity.getByText(/^\+7 dias/).click();
    await expect(
      drug.getByText("A validade deve terminar depois do início"),
    ).toHaveCount(0);
    await expect(pastNotice).toHaveCount(0);

    // back to the course start, 7 days from it are over too
    await start.getByText(/^Início do tratamento/).click();
    await expect(pastNotice).toBeVisible();
    await dialog.getByRole("button", { name: "Próximo" }).click();
    await dialog.getByRole("button", { name: "Salvar" }).click();

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
    mockApi.override(FOLLOW_UP, {
      json: vancomycinOnly([vancomycinEvaluation]),
    });
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
      .getByRole("button", { name: "Registrar revisão" })
      .click({ timeout: 15000 });

    const dialog = page.getByRole("dialog");
    const drug = dialog.getByTestId("review-drug");
    const validity = drug.getByRole("radiogroup", {
      name: "Conformidade válida até",
    });
    const current = drug
      .getByTestId("review-timeline")
      .getByTestId("course-evaluation");
    const historyNotice = drug.getByTestId("review-end-history");

    await drug.getByRole("checkbox", { name: EVALUATE_NOW }).check();
    await drug
      .locator(".drug-fields")
      .getByText("Não conforme", { exact: true })
      .click();
    // overlapping the current one, the new one replaces it
    await expect(current).toHaveClass(/past/);
    await expect(historyNotice).toHaveCount(0);

    // from the course start up to a day before the current one started
    await validity.getByText("Outra data", { exact: true }).click();
    const until = drug.getByRole("textbox", {
      name: "Conformidade válida até",
    });
    await until.fill(shownDate(PAST_END));
    await until.press("Enter");

    const summary = dialog.getByTestId("review-summary");
    await expect(summary).toContainText(
      `Não conforme · desde ${shownDate(VANCOMYCIN_START)} · até ${shownDate(PAST_END)} · só no histórico`,
    );

    // back on the drug: the current one stays in force
    await summary
      .getByRole("button", { name: "VANCOMICINA 500 mg SOL INJ" })
      .click();
    await expect(historyNotice).toContainText(
      `Termina antes da avaliação atual (desde ${shownDate(vancomycinEvaluation.validFrom)})`,
    );
    await expect(current).not.toHaveClass(/past/);
    await expect(drug.getByTestId("review-end-past")).toHaveCount(0);

    await dialog.getByRole("button", { name: "Próximo" }).click();
    await dialog.getByRole("button", { name: "Salvar" }).click();
    await expect(
      page.getByText("Revisão registrada com sucesso!"),
    ).toBeVisible();
    expect(sent.evaluations).toMatchObject([
      {
        idDrug: 12,
        conforming: false,
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
    await marks.nth(0).hover();
    await expect(page.getByRole("tooltip")).toContainText(
      `Registro retroativo, válida até ${shownDate(PAST_END)}`,
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
    const next = dialog.getByRole("button", { name: "Próximo" });
    // nothing selected: a review that only records the visit
    await dialog
      .getByTestId("review-drug")
      .getByRole("checkbox", { name: EVALUATE_NOW })
      .uncheck();
    await next.click();
    await next.click();
    await dialog.getByRole("button", { name: "Salvar" }).click();

    await expect(
      page.getByText("Antimicrobiano não está em uso neste atendimento"),
    ).toBeVisible();
    await expect(dialog).toBeVisible();
    await expect(page.getByTestId("follow-up-status")).toHaveText("Pendente");
  });

  test("selects the drug whose posology changed and keeps its trigger choice", async ({
    page,
    mockApi,
  }) => {
    // changed twice since the evaluation: the reason kept the first change,
    // the course has the posology prescribed now
    const POSOLOGY_CHANGE = hoursFromNow(-3);
    mockApi.override(TIMELINE, {
      json: {
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
      },
    });
    mockApi.override(FOLLOW_UP, {
      json: followUp({
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
    await page.getByRole("button", { name: "Ver pendências" }).click({
      timeout: 15000,
    });
    await expect(page.getByTestId("follow-up-pendings-list")).toContainText(
      "Posologia de VANCOMICINA 500 mg SOL INJ alterada",
    );
    await page.keyboard.press("Escape");

    // the conforming verdict no longer holds: the timeline band stops when
    // the posology changed, in the pending color
    const mark = page
      .getByTestId("course-row")
      .filter({ hasText: "VANCOMICINA" })
      .getByTestId("course-evaluation");
    await expect(mark).toHaveClass(/invalidated/);
    await expect(mark).not.toHaveClass(/past/);
    await expect(mark).toHaveCSS("background-color", "rgb(255, 169, 64)");
    await mark.hover();
    await expect(page.getByRole("tooltip")).toContainText(
      "Não vale mais desde",
    );
    await expect(page.getByRole("tooltip")).toContainText("posologia alterada");

    await page.getByRole("button", { name: "Registrar revisão" }).click();

    // evaluated before, but its posology changed: it comes selected, with
    // the triggers chosen last time (posology, not expiry)
    const dialog = page.getByRole("dialog");
    const drug = dialog.getByTestId("review-drug");
    await expect(
      drug.getByRole("checkbox", { name: EVALUATE_NOW }),
    ).toBeChecked();

    // the verdict on record shows it no longer holds, and why
    const tag = drug.getByTestId("evaluation-tag");
    await expect(tag).toHaveText("Conforme · posologia alterada");
    await expect(tag.locator("s")).toHaveText("Conforme");
    const current = drug.getByTestId("review-current-evaluation");
    await expect(current).toContainText(
      "Esta avaliação não vale mais e mantém o paciente pendente",
    );
    await expect(current).toContainText("Avaliada: 1 g · 12h/12h · IV");
    await expect(current).toContainText("Prescrita agora: 2 g · 6h/6h · IV");
    const posologyBox = drug.getByRole("checkbox", { name: WATCH_POSOLOGY });
    await expect(posologyBox).toBeChecked();
    const expiryBox = drug.getByRole("checkbox", { name: WATCH_EXPIRY });
    await expect(expiryBox).not.toBeChecked();

    await drug
      .locator(".drug-fields")
      .getByText("Conforme", { exact: true })
      .click();
    await drug
      .getByRole("radiogroup", { name: "Conformidade válida até" })
      .getByText(/^\+10 dias/)
      .click();
    await posologyBox.uncheck();
    await expiryBox.check();
    // from a chosen day; Enter takes it and moves on
    await drug
      .getByRole("radiogroup", { name: "Inicia em" })
      .getByText("Outra data", { exact: true })
      .click();
    const from = drug.getByRole("textbox", { name: "Inicia em" });
    await from.fill(shownDate(localDay(-1)));
    await from.press("Enter");
    await dialog.getByRole("button", { name: "Salvar" }).click();

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
    mockApi.override(FOLLOW_UP, {
      json: followUp({
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
    });

    await page.goto(PAGE_URL);
    await page
      .getByRole("button", { name: "Registrar revisão" })
      .click({ timeout: 15000 });

    const dialog = page.getByRole("dialog");
    const drug = dialog.getByTestId("review-drug");
    await expect(drug.getByTestId("evaluation-tag")).toHaveText(
      `Conforme · vencida em ${shownDate(expired.validUntil)}`,
    );
    await expect(drug.getByTestId("review-current-evaluation")).toContainText(
      `A validade terminou em ${shownDate(expired.validUntil)}`,
    );

    // leaving it out of the review does not keep a verdict that holds
    await drug.getByRole("checkbox", { name: EVALUATE_NOW }).uncheck();
    await dialog.getByRole("button", { name: "Próximo" }).click();
    await expect(dialog.getByTestId("review-summary")).toContainText(
      "Avaliação atual não vale mais · continua pendente",
    );
  });

  test("starts the follow-up of an admission not followed, then offers the review", async ({
    page,
    mockApi,
  }) => {
    mockApi.override(FOLLOW_UP, { json: notFollowed() });
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
    await expect(
      page.getByRole("button", { name: "Registrar revisão" }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "Iniciar acompanhamento" }).click();

    await expect(box.getByTestId("follow-up-status")).toHaveText("Pendente");
    await expect(box.getByTestId("follow-up-pendings-count")).toHaveText(
      "1 pendência",
    );
    await box.getByRole("button", { name: "Ver pendências" }).click();
    await expect(page.getByTestId("follow-up-pendings-list")).toContainText(
      "Paciente ainda não revisado",
    );
    await page.keyboard.press("Escape");
    expect(followed).toBe(1);
    await expect(
      page.getByRole("button", { name: "Iniciar acompanhamento" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Registrar revisão" }),
    ).toBeVisible();
  });

  test("does not start the follow-up without a running antimicrobial", async ({
    page,
    mockApi,
  }) => {
    mockApi.override(FOLLOW_UP, { json: notFollowed(false) });

    await page.goto(PAGE_URL);

    await expect(
      page.getByTestId("follow-up").getByTestId("follow-up-status"),
    ).toHaveText("Não acompanhado", { timeout: 15000 });
    await expect(
      page.getByRole("button", { name: "Iniciar acompanhamento" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Registrar revisão" }),
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
