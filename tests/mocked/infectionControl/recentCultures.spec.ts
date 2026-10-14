import { test, expect } from "../support/mockApi";
import { loginWithFeatures } from "../support/featureLogin";

/**
 * Recent cultures of the infection control page (/controle-infeccao/:admissionNumber,
 * src/features/infectionControl/InfectionControlCultures).
 *
 * GET /infection-control/admission/:admissionNumber/cultures brings the latest
 * collection of each exam and material of the patient released in the last
 * 60 days. It is loaded apart from the timeline: a failure stays in its
 * section, which retries it alone. With the culture feature the cultures by
 * drug (GET /prescriptions/:id/cultures), the view the screening card has in
 * its culture tab, sit beside them.
 */

const ADMISSION = 9300;
const PATIENT_ID = 4330;
const PAGE_URL = `/controle-infeccao/${ADMISSION}`;
const ENDPOINT = "GET /infection-control/admission/:admissionNumber/cultures";

const hoursFromNow = (hours: number) =>
  new Date(Date.now() + hours * 60 * 60 * 1000).toISOString().slice(0, 19);

const timeline = {
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
      gender: "F",
      weight: 64,
      weightDate: hoursFromNow(-240),
      height: 165,
      idPrescription: null,
      bed: "3B",
      record: null,
      department: "UTI Adulto",
      segment: "Segmento Adulto",
      idSegment: 3,
    },
    courses: [],
    exams: [],
    alertExams: 0,
    followUp: { enabled: false, admissionNumber: ADMISSION },
  },
};

const culture = (overrides: Record<string, unknown>) => ({
  examName: "Hemocultura teste",
  material: "Sangue teste",
  collectionDate: hoursFromNow(-30),
  releaseDate: hoursFromNow(-6),
  gram: null,
  previousResult: null,
  microorganisms: [],
  ...overrides,
});

const cultures = (list: unknown[]) => ({
  status: "success",
  data: {
    admissionNumber: ADMISSION,
    releasedSince: hoursFromNow(-60 * 24),
    cultures: list,
  },
});

test.beforeEach(({ mockApi }) => {
  mockApi.override("GET /names/:idPatient", {
    json: { status: "success", idPatient: PATIENT_ID, name: "Maria Teste" },
  });
  mockApi.override(
    "GET /infection-control/antimicrobial-timeline/:admissionNumber",
    { json: timeline },
  );
});

test("shows the gram, microorganism and result of each culture", async ({
  page,
  mockApi,
}) => {
  mockApi.override(ENDPOINT, {
    json: cultures([
      culture({
        id: "1",
        gram: "Crescimento de bacilos gram negativos.",
        previousResult:
          '<div><label>RESULTADO: </label><span>Positivo</span></div><img src="x" onerror="window.__xss = true">',
        microorganisms: ["Microrganismo teste"],
      }),
      culture({
        id: "2",
        examName: "Urocultura teste",
        material: "Urina teste",
        previousResult: "Coleta aguardando liberação",
      }),
    ]),
  });

  await page.goto(PAGE_URL);

  const section = page.getByTestId("recent-cultures");
  await expect(
    page.getByRole("heading", { name: "Culturas", exact: true }),
  ).toBeVisible({ timeout: 15000 });
  await expect(section.locator("tbody tr.ant-table-row")).toHaveCount(2);

  const positive = section
    .locator("tbody tr.ant-table-row")
    .filter({ hasText: "Hemocultura teste" });
  await expect(positive.getByTestId("culture-gram")).toHaveText(
    "Crescimento de bacilos gram negativos.",
  );
  await expect(positive).toContainText("Sangue teste");
  await expect(positive).toContainText("Microrganismo teste");
  // the lab's HTML is laid out, never run
  await expect(positive.locator("label")).toHaveText("RESULTADO:");
  await expect(positive).toContainText("Positivo");
  await expect(positive.locator("img")).toHaveCount(0);
  expect(await page.evaluate(() => (window as any).__xss)).toBeUndefined();

  const pending = section
    .locator("tbody tr.ant-table-row")
    .filter({ hasText: "Urocultura teste" });
  await expect(pending).toContainText("Coleta aguardando liberação");
  await expect(pending.getByTestId("culture-gram")).toHaveCount(0);
});

test("says when there is no recent culture", async ({ page }) => {
  await page.goto(PAGE_URL);

  await expect(
    page.getByText("Nenhuma cultura liberada nos últimos 60 dias."),
  ).toBeVisible({ timeout: 15000 });
});

test("a failure stays in its section and is retried alone", async ({
  page,
  mockApi,
}) => {
  mockApi.override(ENDPOINT, { status: 500, json: { status: "error" } });

  await page.goto(PAGE_URL);

  await expect(
    page.getByText("Não foi possível carregar as culturas."),
  ).toBeVisible({ timeout: 15000 });
  // the rest of the page is there
  await expect(page.getByText("64 kg")).toBeVisible();

  mockApi.override(ENDPOINT, {
    json: cultures([culture({ id: "1", gram: "Cocos gram positivos." })]),
  });
  const timelineRequests = mockApi.requests.filter((r) =>
    r.path.includes("antimicrobial-timeline"),
  ).length;

  await page
    .getByTestId("recent-cultures")
    .getByRole("button", { name: "Tentar novamente" })
    .click();

  await expect(page.getByTestId("culture-gram")).toHaveText(
    "Cocos gram positivos.",
  );
  expect(
    mockApi.requests.filter((r) => r.path.includes("antimicrobial-timeline"))
      .length,
  ).toBe(timelineRequests);
});

const HISTORY_ENDPOINT =
  "GET /infection-control/admission/:admissionNumber/cultures/:idCulture";

const LATEST = culture({
  id: "31",
  previousResult: "Coleta aguardando liberação",
});

const history = (list: unknown[]) => ({
  status: "success",
  data: {
    admissionNumber: ADMISSION,
    examName: "Hemocultura teste",
    material: "Sangue teste",
    cultures: list,
  },
});

test.describe("history of a culture", () => {
  test.beforeEach(({ mockApi }) => {
    mockApi.override(ENDPOINT, { json: cultures([LATEST]) });
  });

  test("a row opens every collection of its exam and material", async ({
    page,
    mockApi,
  }) => {
    mockApi.override(HISTORY_ENDPOINT, {
      json: history([
        LATEST,
        culture({
          id: "22",
          collectionDate: hoursFromNow(-200),
          releaseDate: hoursFromNow(-150),
          gram: "Crescimento de bacilos gram negativos.",
          previousResult:
            "<div><label>RESULTADO: </label><span>Positivo</span></div>",
          microorganisms: ["Microrganismo teste"],
        }),
        culture({
          id: "13",
          collectionDate: hoursFromNow(-2000),
          releaseDate: hoursFromNow(-1950),
          previousResult: "Negativo",
        }),
      ]),
    });

    await page.goto(PAGE_URL);
    const row = page
      .getByTestId("recent-cultures")
      .locator("tbody tr.ant-table-row");
    await expect(row).toHaveCount(1, { timeout: 15000 });

    const historyRequest = page.waitForRequest((r) =>
      r.url().endsWith(`/infection-control/admission/${ADMISSION}/cultures/31`),
    );
    await row.click();
    await historyRequest;

    const modal = page.getByTestId("culture-history");
    await expect(modal).toBeVisible();
    await expect(
      modal.getByRole("heading", { name: "Hemocultura teste" }),
    ).toBeVisible();
    await expect(modal).toContainText("Sangue teste");

    const rows = modal.locator("tbody tr.ant-table-row");
    await expect(rows).toHaveCount(3);
    // the clicked culture stands out among them
    await expect(rows.nth(0)).toHaveClass(/culture-current/);
    await expect(rows.nth(1)).not.toHaveClass(/culture-current/);
    await expect(rows.nth(1).getByTestId("culture-gram")).toHaveText(
      "Crescimento de bacilos gram negativos.",
    );
    await expect(rows.nth(1)).toContainText("Microrganismo teste");
    await expect(rows.nth(1).locator("label")).toHaveText("RESULTADO:");
    await expect(rows.nth(2)).toContainText("Negativo");

    await page.keyboard.press("Escape");
    await expect(modal).toBeHidden();
  });

  test("the keyboard opens it too", async ({ page }) => {
    await page.goto(PAGE_URL);
    const row = page
      .getByTestId("recent-cultures")
      .locator("tbody tr.ant-table-row");
    await expect(row).toHaveCount(1, { timeout: 15000 });

    await row.focus();
    await page.keyboard.press("Enter");

    await expect(page.getByTestId("culture-history")).toBeVisible();
  });

  test("a failed load says so and retries", async ({ page, mockApi }) => {
    mockApi.override(HISTORY_ENDPOINT, {
      status: 500,
      json: { status: "error" },
    });

    await page.goto(PAGE_URL);
    await page
      .getByTestId("recent-cultures")
      .locator("tbody tr.ant-table-row")
      .click({ timeout: 15000 });

    const modal = page.getByTestId("culture-history");
    await expect(
      modal.getByText("Não foi possível carregar as coletas desta cultura."),
    ).toBeVisible();

    mockApi.override(HISTORY_ENDPOINT, { json: history([LATEST]) });
    await modal.getByRole("button", { name: "Tentar novamente" }).click();

    await expect(modal.locator("tbody tr.ant-table-row")).toHaveCount(1);
  });
});

test.describe("by drug", () => {
  const TIMELINE_ENDPOINT =
    "GET /infection-control/antimicrobial-timeline/:admissionNumber";
  const withPrescription = (idPrescription: string | null) => ({
    status: "success",
    data: {
      ...timeline.data,
      patient: { ...timeline.data.patient, idPrescription },
    },
  });

  test("not offered without the culture feature", async ({ page, mockApi }) => {
    mockApi.override(TIMELINE_ENDPOINT, { json: withPrescription("199") });

    await page.goto(PAGE_URL);

    await expect(page.getByTestId("recent-cultures")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText("Por medicamento")).toHaveCount(0);
    await expect(page.getByTestId("cultures-by-drug")).toHaveCount(0);
  });

  test.describe("with the culture feature", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page, mockApi }) => {
      await loginWithFeatures(page, mockApi, ["CULTURE"]);
    });

    test("not offered without a prescription", async ({ page, mockApi }) => {
      mockApi.override(TIMELINE_ENDPOINT, { json: withPrescription(null) });

      await page.goto(PAGE_URL);

      await expect(page.getByTestId("recent-cultures")).toBeVisible({
        timeout: 15000,
      });
      await expect(page.getByText("Por medicamento")).toHaveCount(0);
    });

    test("is a tab beside the summary, flags a resistant drug in use and opens the full report", async ({
      page,
      mockApi,
    }) => {
      mockApi.override(TIMELINE_ENDPOINT, { json: withPrescription("199") });
      mockApi.override("GET /prescriptions/:id/cultures", {
        json: {
          status: "success",
          data: [
            {
              drug: "OXACILINA",
              prescribed: true,
              atbLevel: 1,
              items: [
                {
                  key: "SANGUE TOTAL#MICROORGANISMO TESTE#OXACILINA",
                  idExamItem: 900001,
                  microorganism: "Microorganismo Teste",
                  material: "Sangue Total",
                  result: "Resistente",
                  resultType: "R",
                  resultDetail: null,
                  prediction: null,
                  predictionType: null,
                  probability: null,
                  collectionDate: "2024-03-01T12:17:03",
                  releaseDate: "2024-03-08T07:17:02",
                },
              ],
            },
          ],
        },
      });

      const culturesRequest = page.waitForRequest((r) =>
        r.url().includes("/prescriptions/199/cultures"),
      );
      await page.goto(PAGE_URL);
      await culturesRequest;

      // one card: the summary by exam first, the cultures by drug a tab away.
      // They are loaded with the page, so the tab flags the resistant drug in
      // use before it is opened
      const byDrug = page.getByTestId("cultures-by-drug");
      await expect(page.getByTestId("recent-cultures")).toBeVisible({
        timeout: 15000,
      });
      await expect(page.getByRole("tab", { name: "Resumo" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(byDrug).toBeHidden();
      await expect(page.getByTestId("cultures-by-drug-alert")).toBeVisible();

      await page.getByRole("tab", { name: "Por medicamento" }).click();
      await expect(byDrug).toBeVisible();
      await expect(page.getByTestId("recent-cultures")).toBeHidden();
      await expect(
        byDrug.locator(".culture-item.culture-row-resistantInUse"),
      ).toHaveCount(1);
      await expect(
        page.getByText(/^Antibiograma de cada medicamento/),
      ).toBeVisible();

      // the full report, for the patient on the page
      mockApi.override("GET /reports/culture", {
        json: { status: "success", data: [] },
      });
      const reportRequest = page.waitForRequest(
        (r) =>
          r.url().includes("/reports/culture") &&
          new URL(r.url()).searchParams.get("idPatient") === `${PATIENT_ID}`,
      );
      // in the card's header, out of the by drug footer
      await expect(
        byDrug.getByRole("button", { name: "Ver todos" }),
      ).toHaveCount(0);
      await page
        .locator('[data-kb="infectionControl.cultures"]')
        .getByRole("button", { name: "Ver todos" })
        .click();
      await reportRequest;
      const report = page.getByRole("dialog");
      await expect(
        report.getByRole("heading", { name: "Relatório: Culturas" }),
      ).toBeVisible();
      // the patient is named on the printed report only
      await expect(report).toContainText("Maria Teste");
      await expect(report).toContainText("10/05/1980");
      await page.keyboard.press("Escape");
      await expect(report).toBeHidden();
    });
  });
});
