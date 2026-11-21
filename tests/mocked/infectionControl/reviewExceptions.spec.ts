import { test, expect, type MockApi } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";
import { openMoreFilters } from "../support/advancedFilter";

/**
 * Antimicrobials exempt from the infection control review
 * (src/features/infectionControl/ReviewExceptions).
 *
 * Each schema keeps the antimicrobials whose courses need no review
 * (GET/PUT /infection-control/review-exceptions): substances, and drugs
 * without a substance. Anyone who sees the worklist reads the list; only the
 * infection control (WRITE_INFECTION_CONTROL) changes it. The patients running
 * only those antimicrobials leave the worklist unless the filter asks for
 * them, and an exempt course says it needs no review. The list tells when
 * and by whom it was changed (NoHarm for the NoHarm team) and shows the
 * version it replaced.
 */

const EXCEPTIONS = "GET /infection-control/review-exceptions";
const OPTIONS = "GET /infection-control/review-exceptions/options";
const SAVE = "PUT /infection-control/review-exceptions";
const LIST = "POST /infection-control/admissions";
const TIMELINE =
  "GET /infection-control/antimicrobial-timeline/:admissionNumber";

const ADMISSION = 9400;
const PATIENT_ID = 4340;

const BASE_PERMISSIONS = [
  "READ_BASIC_FEATURES",
  "WRITE_BASIC_FEATURES",
  "READ_PRESCRIPTION",
  "READ_SUPPORT",
];

const SAVED = {
  substances: [{ id: "9001", name: "ZZ CEFAZOLINA TESTE" }],
  drugs: [],
  updatedAt: "2026-11-01T10:00:00",
  updatedBy: "Fulano Beltrano",
  previous: {
    substances: [{ id: "9002", name: "ZZ AMICACINA TESTE" }],
    drugs: [],
    updatedAt: "2026-10-20T08:30:00",
    updatedBy: "NoHarm",
  },
};

const mockExceptions = (mockApi: MockApi) => {
  mockApi.override(EXCEPTIONS, { json: { status: "success", data: SAVED } });
  mockApi.override(OPTIONS, {
    json: {
      status: "success",
      data: {
        substances: [],
        drugs: [{ id: "77", name: "ZZ ANTIMICROBIANO SEM SUBSTANCIA" }],
      },
    },
  });
};

/** Opens the list from the worklist header */
const openExceptions = async (page: import("@playwright/test").Page) => {
  await page.goto("/controle-infeccao");
  await page
    .getByRole("button", { name: "Antimicrobianos sem revisão" })
    .click({ timeout: 15000 });
  const modal = page.getByTestId("review-exceptions");
  await expect(modal).toBeVisible();
  return modal;
};

test.describe("with WRITE_INFECTION_CONTROL", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page, mockApi }) => {
    await loginWithPermissions(page, mockApi, [
      ...BASE_PERMISSIONS,
      "READ_INFECTION_CONTROL",
      "WRITE_INFECTION_CONTROL",
    ]);
    mockExceptions(mockApi);
  });

  test("adds an antimicrobial and saves the whole list", async ({
    page,
    mockApi,
  }) => {
    mockApi.override(SAVE, {
      json: {
        status: "success",
        data: {
          ...SAVED,
          drugs: [{ id: "77", name: "ZZ ANTIMICROBIANO SEM SUBSTANCIA" }],
        },
      },
    });

    const modal = await openExceptions(page);
    await expect(modal).toContainText("ZZ CEFAZOLINA TESTE");

    await modal
      .getByRole("combobox", { name: "Buscar substância ou medicamento" })
      .fill("ZZ ANTI");
    await page
      .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
      .getByText("ZZ ANTIMICROBIANO SEM SUBSTANCIA", { exact: true })
      .click();
    await expect(modal).toContainText("ZZ ANTIMICROBIANO SEM SUBSTANCIA");

    await modal.getByRole("button", { name: "Salvar" }).click();

    await expect(page.getByText(/Lista salva/)).toBeVisible();
    const saved = mockApi.requests.filter(
      (r) =>
        r.method === "PUT" && r.path === "/infection-control/review-exceptions",
    );
    expect(saved).toHaveLength(1);
    expect(JSON.parse(saved[0].postData!)).toEqual({
      substances: [9001],
      drugs: [77],
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
    mockExceptions(mockApi);
  });

  test("shows who changed the list and the version it replaced", async ({
    page,
  }) => {
    const modal = await openExceptions(page);

    await expect(modal.getByTestId("review-exceptions-updated")).toContainText(
      "Alterada em 01/11/2026 10:00 por Fulano Beltrano",
    );
    await expect(modal).not.toContainText("ZZ AMICACINA TESTE");

    await modal.getByRole("button", { name: "Ver versão anterior" }).click();

    const previous = modal.getByTestId("review-exceptions-previous");
    await expect(previous).toContainText("ZZ AMICACINA TESTE");
    await expect(previous).toContainText(
      "Alterada em 20/10/2026 08:30 por NoHarm",
    );
    await expect(previous.locator(".ant-tag-close-icon")).toHaveCount(0);

    await modal.getByRole("button", { name: "Ocultar versão anterior" }).click();
    await expect(previous).toHaveCount(0);
  });

  test("reads the list but cannot change it", async ({ page }) => {
    const modal = await openExceptions(page);

    await expect(modal).toContainText("ZZ CEFAZOLINA TESTE");
    await expect(modal).toContainText(
      "Somente o controle de infecção pode alterar esta lista.",
    );
    await expect(modal.getByRole("combobox")).toHaveCount(0);
    await expect(modal.getByRole("button", { name: "Salvar" })).toHaveCount(0);
    await expect(modal.locator(".ant-tag-close-icon")).toHaveCount(0);
  });
});

test("lists the patients without review only when asked", async ({
  page,
  mockApi,
}) => {
  await page.goto("/controle-infeccao");
  await expect(
    page.getByRole("heading", { name: "Controle de Infecção" }),
  ).toBeVisible({ timeout: 15000 });

  const lists = () =>
    mockApi.requests
      .filter((r) => r.path === "/infection-control/admissions")
      .map((r) => JSON.parse(r.postData!));
  await expect
    .poll(() => lists()[0])
    .toMatchObject({ includeNotRequired: false });

  await openMoreFilters(page);
  await page.locator("#includeNotRequired").click();
  await page.locator(".gtm-btn-search").click();

  await expect
    .poll(() => lists().at(-1))
    .toMatchObject({ includeNotRequired: true });
});

/** The page of an admission running one course exempt from review */
const mockExemptCourse = (mockApi: MockApi) => {
  const now = Date.now();
  const hoursFromNow = (hours: number) =>
    new Date(now + hours * 60 * 60 * 1000).toISOString().slice(0, 19);
  const start = hoursFromNow(-48);

  mockApi.override("GET /names/:idPatient", {
    json: { status: "success", idPatient: PATIENT_ID, name: "Fulano Beltrano" },
  });
  mockApi.override(LIST, {
    json: { status: "success", data: { count: 0, admissions: [] } },
  });
  mockApi.override(TIMELINE, {
    json: {
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
        },
        courses: [
          {
            idDrug: 21,
            drug: "ZZ CEFAZOLINA 1 g SOL INJ",
            substance: null,
            atbLevel: null,
            cpoe: false,
            status: "active",
            start,
            end: hoursFromNow(24),
            plannedEnd: null,
            plannedDays: null,
            days: 3,
            lastIdPrescription: "399",
            prescriptionCount: 2,
            gaps: [],
            regimens: [],
          },
        ],
        followUp: {
          enabled: true,
          admissionNumber: ADMISSION,
          followed: true,
          status: 2,
          statusDate: hoursFromNow(-20),
          nextReviewDate: null,
          recalculatedAt: hoursFromNow(-20),
          idPrescription: "399",
          pendings: [],
          reviews: [],
          courses: [
            {
              idDrug: 21,
              start,
              ongoing: true,
              reviewRequired: false,
              evaluation: null,
              history: [],
            },
          ],
        },
      },
    },
  });
};

test("an exempt course says it needs no review", async ({ page, mockApi }) => {
  mockExemptCourse(mockApi);

  await page.goto(`/controle-infeccao/${ADMISSION}`);

  const row = page.getByTestId("course-row");
  await expect(row).toContainText("ZZ CEFAZOLINA 1 g SOL INJ", {
    timeout: 15000,
  });
  await expect(row.getByTestId("course-exempt")).toHaveText(
    "Revisão não obrigatória",
  );
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("an exempt course card says it needs no review", async ({
    page,
    mockApi,
  }) => {
    mockExemptCourse(mockApi);

    await page.goto(`/controle-infeccao/${ADMISSION}`);

    const card = page.getByTestId("course-card");
    await expect(card).toContainText("ZZ CEFAZOLINA 1 g SOL INJ", {
      timeout: 15000,
    });
    await expect(card.getByTestId("course-exempt")).toHaveText(
      "Revisão não obrigatória",
    );
    // nobody has to evaluate it: no "not evaluated" verdict
    await expect(card.getByTestId("evaluation-tag")).toHaveCount(0);
  });
});
