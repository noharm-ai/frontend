import { test, expect } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";

/**
 * Culture tab of the exams card (src/features/culture/CultureTab).
 *
 * The card only grows a tab bar when the prescription payload carries
 * cultures, and a pending culture must be presented as a NoHarm prediction,
 * never as if it were the lab result.
 */

const CULTURES = [
  {
    drug: "AMICACINA",
    items: [
      {
        key: "SANGUE TOTAL#MICROORGANISMO TESTE#AMICACINA",
        idExamItem: 900001,
        microorganism: "Microorganismo Teste",
        material: "Sangue Total",
        // the backend reads "intermediário" as susceptible, but keeps the
        // wording in resultDetail because the group header does not say it
        result: "intermediário",
        resultType: "S",
        resultDetail: "intermediário",
        prediction: null,
        predictionType: null,
        probability: null,
        collectionDate: "2024-03-01T12:17:03",
        releaseDate: "2024-03-08T07:17:02",
      },
    ],
  },
  {
    drug: "GENTAMICINA",
    items: [
      {
        key: "SANGUE TOTAL#MICROORGANISMO TESTE#GENTAMICINA",
        idExamItem: 900001,
        microorganism: "Microorganismo Teste",
        material: "Sangue Total",
        result: null,
        resultType: null,
        resultDetail: null,
        prediction: "S",
        predictionType: "S",
        probability: 0.65,
        collectionDate: "2024-03-01T12:17:03",
        releaseDate: "2024-03-08T07:17:02",
      },
    ],
  },
  {
    // both a released result and a prediction of a newer, still pending
    // collection: the backend hands the result over first and the card must
    // read the drug by it, not by the prediction
    drug: "CEFEPIME",
    items: [
      {
        key: "SANGUE TOTAL#MICROORGANISMO TESTE#CEFEPIME#1",
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
      {
        key: "SANGUE TOTAL#MICROORGANISMO TESTE#CEFEPIME#2",
        idExamItem: 900002,
        microorganism: "Microorganismo Teste",
        material: "Sangue Total",
        result: null,
        resultType: null,
        resultDetail: null,
        prediction: "S",
        predictionType: "S",
        probability: 0.71,
        collectionDate: "2024-03-10T12:17:03",
        releaseDate: null,
      },
    ],
  },
  {
    drug: "OXACILINA",
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
];

const prescriptionWith = (patch: Record<string, unknown>) => {
  const fixture = loadFixture<{ data: Record<string, unknown> }>(
    "prescriptions/single-199.json",
  );
  fixture.data = { ...fixture.data, ...patch };
  return fixture;
};

test("culture tab lists the drugs and flags predictions", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWith({ cultures: CULTURES }),
  });

  await page.goto("/prescricao/199");

  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();

  // exams is the tab shown first
  await expect(page.getByRole("radio", { name: "Exames" })).toBeChecked();

  // antd Segmented keeps the radio input hidden behind its label
  await page
    .locator(".ant-segmented-item-label", { hasText: "Cultura" })
    .click();
  await expect(page.getByRole("radio", { name: "Cultura" })).toBeChecked();

  // the footer carries the newest release across every culture
  await expect(page.locator(".culture-last-release")).toHaveText(
    "liberação mais recente em 08/03/24 07:17",
  );

  // released results sit in their own group, predictions in the last one
  const resistant = page.locator(".culture-group-resistant");
  await expect(resistant).toContainText("Resistentes");
  await expect(resistant.locator(".culture-item")).toHaveText([
    "CEFEPIME",
    "OXACILINA",
  ]);

  // a result that is susceptible but does not read as a plain "Sensível"
  // keeps its own wording on the row
  const susceptible = page.locator(".culture-group-susceptible");
  await expect(susceptible).toContainText("Sensíveis");
  const intermediate = susceptible.locator(".culture-item", {
    hasText: "AMICACINA",
  });
  await expect(intermediate).toContainText("intermediário");

  // the pending culture shows the prediction, not a lab result
  const predicted = page.locator(".culture-group-prediction");
  await expect(predicted).toContainText("Predição NoHarm");
  // a drug that already has an antibiogram never shows up here, even with a
  // newer collection still pending
  await expect(
    predicted.locator(".culture-item", { hasText: "CEFEPIME" }),
  ).toHaveCount(0);
  const pending = predicted.locator(".culture-item", {
    hasText: "GENTAMICINA",
  });
  await expect(pending).toContainText("S");
  await expect(pending.locator(".anticon-robot")).toBeVisible();
});

test("card keeps no tabs when the patient has no cultures", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWith({ cultures: [] }),
  });

  await page.goto("/prescricao/199");

  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();
  await expect(page.getByRole("radio", { name: "Cultura" })).toBeHidden();
  await expect(page.getByRole("heading", { name: "Exames" })).toBeVisible();
});

test("the footer link opens the full culture report", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWith({ cultures: CULTURES }),
  });
  mockApi.override("GET /reports/culture", {
    json: { status: "success", data: [] },
  });

  await page.goto("/prescricao/199");
  await page
    .locator(".ant-segmented-item-label", { hasText: "Cultura" })
    .click();

  const card = page
    .locator(".ant-col", { has: page.getByRole("radio", { name: "Exames" }) })
    .first();
  await card.getByRole("button", { name: "Ver todos" }).click();

  // the same report the patient card's Relatórios tab opens
  await expect(
    page.getByRole("heading", { name: "Relatório: Culturas" }).first(),
  ).toBeVisible();
  expect(
    mockApi.requests.filter((r) => r.path === "/reports/culture"),
  ).not.toHaveLength(0);
});
