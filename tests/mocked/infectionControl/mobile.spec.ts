import { test, expect } from "../support/mockApi";

/**
 * Infection control on phones (src/features/infectionControl): below the
 * `lg` breakpoint the worklist shows a card per patient in place of its
 * table, and the patient page lists the antimicrobial courses as cards, the
 * timeline one tap away.
 */

const ADMISSION = 9400;
const PATIENT_ID = 4340;

/** A naive ISO date some hours away from now, as the backend sends it */
const hoursFromNow = (hours: number) =>
  new Date(Date.now() + hours * 60 * 60 * 1000).toISOString().slice(0, 19);

const MEROPENEM_START = hoursFromNow(-48);
const VANCOMYCIN_START = hoursFromNow(-96);

const course = (overrides: Record<string, unknown>) => ({
  substance: null,
  atbLevel: null,
  cpoe: false,
  status: "active",
  plannedEnd: null,
  plannedDays: null,
  lastIdPrescription: "399",
  prescriptionCount: 2,
  gaps: [],
  regimens: [],
  ...overrides,
});

const evaluation = {
  id: "601",
  idReview: "51",
  idDrug: 12,
  idPrescription: "398",
  courseStart: VANCOMYCIN_START,
  conforming: true,
  notes: null,
  posology: {
    idPrescriptionDrug: "398001",
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

const pending = {
  id: "901",
  type: 2,
  origin: 1,
  idDrug: 11,
  idPrescription: "399",
  details: { drug: "MEROPENEM 1 g SOL INJ", courseStart: MEROPENEM_START },
  createdAt: hoursFromNow(-20),
};

const TIMELINE = {
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
      idPrescription: "399",
      bed: "7B",
      record: null,
      department: "UTI Adulto",
      segment: "Segmento Adulto",
      idSegment: 3,
    },
    courses: [
      course({
        idDrug: 11,
        drug: "MEROPENEM 1 g SOL INJ",
        start: MEROPENEM_START,
        end: hoursFromNow(24),
        days: 3,
        plannedDays: 7,
      }),
      course({
        idDrug: 12,
        drug: "VANCOMICINA 500 mg SOL INJ",
        start: VANCOMYCIN_START,
        end: hoursFromNow(30),
        days: 5,
      }),
    ],
    exams: [],
    alertExams: 0,
    followUp: {
      enabled: true,
      admissionNumber: ADMISSION,
      followed: true,
      status: 1,
      statusDate: hoursFromNow(-20),
      nextReviewDate: null,
      recalculatedAt: hoursFromNow(-20),
      pendings: [pending],
      reviews: [],
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
          evaluation,
          history: [evaluation],
        },
      ],
    },
  },
};

test.use({ viewport: { width: 390, height: 844 } });

test.beforeEach(({ mockApi }) => {
  mockApi.override("GET /names/:idPatient", {
    json: { status: "success", idPatient: PATIENT_ID, name: "Fulano Beltrano" },
  });
});

test("lists the followed patients as cards", async ({ page, mockApi }) => {
  mockApi.override("POST /infection-control/admissions", {
    json: {
      status: "success",
      data: {
        count: 1,
        admissions: [
          {
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
            pendings: [pending],
          },
        ],
      },
    },
  });

  await page.goto("/controle-infeccao");

  const card = page.getByTestId("worklist-card");
  await expect(card).toHaveCount(1, { timeout: 15000 });
  await expect(page.getByRole("table")).toHaveCount(0);
  await expect(card).toContainText("Fulano Beltrano");
  await expect(card).toContainText("UTI Adulto");
  await expect(card).toContainText("Pendente");
  await expect(card).toContainText("MEROPENEM 1 g SOL INJ sem avaliação");
  await expect(
    card.getByRole("link", { name: `${ADMISSION}`, exact: true }),
  ).toHaveAttribute("href", `/controle-infeccao/${ADMISSION}`);

  // nothing wider than the screen
  const scrollWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );
  expect(scrollWidth).toBeLessThanOrEqual(390);
});

test("lists the courses as cards, the timeline one tap away", async ({
  page,
  mockApi,
}) => {
  mockApi.override(
    "GET /infection-control/antimicrobial-timeline/:admissionNumber",
    { json: TIMELINE },
  );

  await page.goto(`/controle-infeccao/${ADMISSION}`);

  const cards = page.getByTestId("course-card");
  await expect(cards).toHaveCount(2, { timeout: 15000 });
  await expect(page.getByTestId("course-row")).toHaveCount(0);

  const meropenem = cards.filter({ hasText: "MEROPENEM" });
  await expect(meropenem).toContainText("Em uso");
  await expect(meropenem).toContainText("D3/7");
  await expect(meropenem.getByTestId("evaluation-tag")).toHaveText(
    "Sem avaliação",
  );
  await expect(
    cards.filter({ hasText: "VANCOMICINA" }).getByTestId("evaluation-tag"),
  ).toContainText("Conforme");

  // a card opens the details of its course
  await meropenem.click();
  const details = page.getByRole("dialog");
  await expect(details).toContainText("MEROPENEM 1 g SOL INJ");
  await details.locator("button.ant-btn", { hasText: "Fechar" }).click();
  await expect(details).toHaveCount(0);

  await page.getByText("Linha do tempo", { exact: true }).click();
  await expect(page.getByTestId("course-row")).toHaveCount(2);
  await expect(cards).toHaveCount(0);
});
