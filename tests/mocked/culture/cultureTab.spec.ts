import { test, expect } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";

/**
 * Culture tab of the exams card (src/features/culture/CultureTab).
 *
 * The card always carries the tab bar, and a pending culture must be
 * presented as a NoHarm prediction, never as if it were the lab result.
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
        // the collection was released without an antibiogram: that is why the
        // card has a prediction for it at all, and the date must not be aged
        // on the row as if a result had come back
        releaseDate: "2024-03-11T08:20:00",
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
        // the collection was released to the lab but has no antibiogram yet:
        // a pending record carries a date of its own and must never be read
        // as the newest result
        releaseDate: "2024-03-12T09:41:00",
      },
    ],
  },
  {
    // the backend marks the cultures of the drugs the prescription carries
    drug: "OXACILINA",
    prescribed: true,
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

  // the card is behind a tab, so a resistant drug the patient is on has to be
  // announced by the tab itself — asserted before anything is clicked
  await expect(page.locator(".culture-tab-alert")).toBeVisible();

  // antd Segmented keeps the radio input hidden behind its label
  await page
    .locator(".ant-segmented-item-label", { hasText: "Cultura" })
    .click();
  await expect(page.getByRole("radio", { name: "Cultura" })).toBeChecked();

  // the footer carries the newest release across every culture, counting only
  // the records that have a result: CEFEPIME has a pending collection with a
  // newer date and it must not be the one shown
  await expect(page.locator(".culture-last-release")).toHaveText(
    "liberação mais recente em 08/03/24 07:17",
  );

  // resistant AND in use is the finding the card exists for, so it gets a
  // group of its own above every other one, and the row keeps nothing but the
  // drug name: the header already says the drug is in use
  const inUse = page.locator(".culture-group-resistantInUse");
  await expect(inUse).toContainText("Resistentes em uso");
  await expect(inUse.locator(".culture-item .name")).toHaveText(["OXACILINA"]);
  await expect(inUse.locator(".prescribed")).toHaveCount(0);
  await expect(page.locator(".culture-group").first()).toHaveClass(
    /culture-group-resistantInUse/,
  );

  // a resistant drug nobody prescribed stays in the plain group
  const resistant = page.locator(".culture-group-resistant");
  await expect(resistant).toContainText("Resistentes");
  await expect(resistant.locator(".culture-item .name")).toHaveText([
    "CEFEPIME",
  ]);

  // how old the released antibiogram is, next to the drug. The fixture dates
  // are fixed, so the badge is read by shape and not by value — and anything
  // older than 99 days is capped so it cannot widen the row. The bare number
  // said nothing on its own, so the row spells out that it is an elapsed time
  await expect(inUse.locator(".culture-age")).toHaveText(
    /^há (\d+[mhd]|99d\+)$/,
  );

  // and the date it is counted from is one hover away
  await inUse.locator(".culture-age").hover();
  await expect(
    page.getByText("Antibiograma liberado em 08/03/2024 07:17"),
  ).toBeVisible();

  // the row opens the details, which the hover shadow alone never said
  await expect(inUse.locator(".culture-item .details-hint")).toHaveCount(1);

  // the row is narrow, so the details are behind a click and read in a modal
  await inUse.locator(".culture-item", { hasText: "OXACILINA" }).click();
  const details = page.locator(".culture-details-modal");
  await expect(details.getByText("OXACILINA")).toBeVisible();
  await expect(
    details.getByText("Resistente e em uso nesta prescrição"),
  ).toBeVisible();
  await expect(details.getByText("Microorganismo Teste")).toBeVisible();
  // the row only carries the age of the release, the date itself is here —
  // with the hour, which is what tells two collections of the same day apart
  await expect(
    details.getByText("Data da liberação: 08/03/2024 07:17"),
  ).toBeVisible();
  await expect(
    details.getByText("Data da coleta: 01/03/2024 12:17"),
  ).toBeVisible();

  // the modal must be out of the way before the list is read again
  await page.keyboard.press("Escape");
  await expect(details).toBeHidden();

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
  // the pending collection carries a release date of its own, but no
  // antibiogram came back from it: ageing it on the row would state a result
  // the drug does not have
  await expect(pending.locator(".culture-age")).toHaveCount(0);

  // and the modal must not state a release either: the date the pending
  // collection carries is not an antibiogram coming back
  await pending.click();
  await expect(details.getByText("Predição NoHarm, acurácia")).toBeVisible();
  await expect(
    details.getByText("Data da coleta: 01/03/2024 12:17"),
  ).toBeVisible();
  await expect(details.getByText("Data da liberação")).toHaveCount(0);
});

test("the tab is not flagged when no resistant drug is in use", async ({
  page,
  mockApi,
}) => {
  // the same cultures, none of them a drug the prescription carries
  const notInUse = CULTURES.map((drug) => ({ ...drug, prescribed: false }));

  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWith({ cultures: notInUse }),
  });

  await page.goto("/prescricao/199");

  // antd hides the Segmented radio input behind its label
  await expect(
    page.locator(".ant-segmented-item-label", { hasText: "Cultura" }),
  ).toBeVisible();
  await expect(page.locator(".culture-tab-alert")).toHaveCount(0);
});

test("the tab is offered with no cultures and points at the full report", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWith({ cultures: [] }),
  });
  mockApi.override("GET /reports/culture", {
    json: { status: "success", data: [] },
  });

  await page.goto("/prescricao/199");

  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();

  // no culture in the window is still an answer, so the tab is there to give
  // it — and nothing flags a resistance the patient does not have
  await expect(
    page.locator(".ant-segmented-item-label", { hasText: "Exames" }),
  ).toBeVisible();
  await expect(page.locator(".culture-tab-alert")).toHaveCount(0);

  await page
    .locator(".ant-segmented-item-label", { hasText: "Cultura" })
    .click();
  await expect(page.getByRole("radio", { name: "Cultura" })).toBeChecked();

  await expect(
    page.getByText("Nenhum resultado positivo de cultura nos últimos 60 dias"),
  ).toBeVisible();
  // the 60 days are the DynamoDB retention, not the patient's history: the
  // message has to send the user to the report that holds the older results
  await expect(
    page.getByText("Resultados mais antigos podem existir"),
  ).toBeVisible();
  await expect(page.locator(".culture-last-release")).toHaveCount(0);

  const card = page
    .locator(".ant-col", { has: page.getByRole("radio", { name: "Exames" }) })
    .first();
  await card.getByRole("button", { name: "Ver todos" }).click();

  await expect(
    page.getByRole("heading", { name: "Relatório: Culturas" }).first(),
  ).toBeVisible();
  expect(
    mockApi.requests.filter((r) => r.path === "/reports/culture"),
  ).not.toHaveLength(0);
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
