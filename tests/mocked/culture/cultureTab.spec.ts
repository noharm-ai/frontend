import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";
import { loginWithFeatures } from "../support/featureLogin";

/**
 * Culture tab of the exams card (src/features/culture/CultureTab).
 *
 * The card always carries the tab bar, and a pending culture must be
 * presented as a NoHarm prediction, never as if it were the lab result.
 *
 * The cultures are not part of the prescription payload: the prescription
 * only carries their summary (cultureStats), and the list is fetched from
 * GET /prescriptions/:id/cultures when the tab is opened.
 */

// the culture card and its alerts are behind a schema feature
// (models/Feature.CULTURE), and the shared storage state of the mocked suite
// has no feature at all, so these tests log in with it on. The card without
// the feature is covered by cultureFeature.spec.ts
test.use({ storageState: { cookies: [], origins: [] } });

test.beforeEach(async ({ page, mockApi }) => {
  await loginWithFeatures(page, mockApi, ["CULTURE"]);
});

const CULTURES = [
  {
    drug: "AMICACINA",
    // the substance was never placed on the AWaRe scale: the row says nothing
    // rather than carrying a badge that classifies it by guess
    atbLevel: null,
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
    // an older backend, or a drug the antibiogram could not map to a
    // substance: the field is not there at all
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
    atbLevel: 2,
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
    // a predicted resistance: still a pending collection, so it must not be
    // read in the same group as a released resistant antibiogram
    drug: "VANCOMICINA",
    atbLevel: 3,
    items: [
      {
        key: "SANGUE TOTAL#MICROORGANISMO TESTE#VANCOMICINA",
        idExamItem: 900001,
        microorganism: "Microorganismo Teste",
        material: "Sangue Total",
        result: null,
        resultType: null,
        resultDetail: null,
        prediction: "R",
        predictionType: "R",
        probability: 0.82,
        collectionDate: "2024-03-01T12:17:03",
        releaseDate: "2024-03-11T08:20:00",
      },
    ],
  },
  {
    // the backend marks the cultures of the drugs the prescription carries
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
];

const CULTURES_PATH = "/prescriptions/199/cultures";

const prescriptionWith = (patch: Record<string, unknown>) => {
  const fixture = loadFixture<{ data: Record<string, unknown> }>(
    "prescriptions/single-199.json",
  );
  fixture.data = { ...fixture.data, ...patch };
  return fixture;
};

const cultureRequests = (mockApi: { requests: { path: string }[] }) =>
  mockApi.requests.filter((r) => r.path === CULTURES_PATH);

const openCultureTab = async (page: Page) => {
  // antd Segmented keeps the radio input hidden behind its label
  await page
    .locator(".ant-segmented-item-label", { hasText: "Cultura" })
    .click();
  await expect(page.getByRole("radio", { name: "Cultura" })).toBeChecked();
};

test("culture tab lists the drugs and flags predictions", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWith({ cultureStats: { resistantInUse: 1 } }),
  });
  mockApi.override("GET /prescriptions/:id/cultures", {
    json: { status: "success", data: CULTURES },
  });

  await page.goto("/prescricao/199");

  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();

  // exams is the tab shown first
  await expect(page.getByRole("radio", { name: "Exames" })).toBeChecked();

  // the card is behind a tab, so a resistant drug the patient is on has to be
  // announced by the tab itself — asserted before anything is clicked, and
  // read from the summary the prescription carries: the cultures themselves
  // are not loaded until the tab is opened, that is the point of the summary
  await expect(page.locator(".culture-tab-alert")).toBeVisible();
  expect(cultureRequests(mockApi)).toHaveLength(0);

  await openCultureTab(page);
  await expect.poll(() => cultureRequests(mockApi).length).toBe(1);

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

  // the predictions are folded away under the released results: a pending
  // collection is not a lab result, and nothing of it is on screen until the
  // fold is opened
  const toggle = page.locator(".culture-predictions-toggle");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toContainText("Ver predições NoHarm (2)");
  // what the fold hides is why it is worth opening: the predicted resistances
  // are counted on the closed toggle
  await expect(toggle.locator(".toggle-alert")).toHaveText(
    "1 com predição de resistência",
  );
  await expect(page.locator(".culture-group-predictionResistant")).toHaveCount(
    0,
  );
  await expect(
    page.locator(".culture-group-predictionSusceptible"),
  ).toHaveCount(0);
  // the card holds released results, so it does not claim the lab returned
  // nothing
  await expect(page.locator(".culture-no-released")).toHaveCount(0);

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(toggle).toContainText("Ocultar predições NoHarm");
  await expect(toggle.locator(".toggle-alert")).toHaveCount(0);
  // the released groups above can fill the scroll area on their own: what the
  // click opened has to be on screen, not below the fold it just opened
  await expect(
    page.locator(".culture-group-predictionResistant .culture-item"),
  ).toBeInViewport({ ratio: 1 });

  // the pending culture shows the prediction, not a lab result, and the
  // predictions are split like the results: the header says what was
  // predicted, so the row no longer repeats the letter
  const predictedResistant = page.locator(".culture-group-predictionResistant");
  await expect(predictedResistant).toContainText(
    "Predição NoHarm: resistentes",
  );
  await expect(predictedResistant.locator(".culture-item .name")).toHaveText([
    "VANCOMICINA",
  ]);
  // and it stays out of the released resistant group
  await expect(resistant.locator(".culture-item .name")).toHaveText([
    "CEFEPIME",
  ]);
  const predicted = page.locator(".culture-group-predictionSusceptible");
  await expect(predicted).toContainText("Predição NoHarm: sensíveis");
  await expect(predicted.locator(".culture-item .name")).toHaveText([
    "GENTAMICINA",
  ]);
  // a drug that already has an antibiogram never shows up here, even with a
  // newer collection still pending
  await expect(
    predicted.locator(".culture-item", { hasText: "CEFEPIME" }),
  ).toHaveCount(0);
  const pending = predicted.locator(".culture-item", {
    hasText: "GENTAMICINA",
  });
  await expect(pending.locator(".name")).toHaveText("GENTAMICINA");
  await expect(pending.locator(".marker")).toHaveText("");
  await expect(pending.locator(".anticon-robot")).toBeVisible();
  // the pending collection carries a release date of its own, but no
  // antibiogram came back from it: ageing it on the row would state a result
  // the drug does not have
  await expect(pending.locator(".culture-age")).toHaveCount(0);

  // the modal says outright that the lab result is pending, and keeps the
  // prediction in a block of its own, so it is never read as the result
  await pending.click();
  await expect(details.locator(".culture-result-pending")).toContainText(
    "Resultado: Resultado laboratorial pendente",
  );
  const prediction = details.locator(".culture-prediction");
  await expect(prediction).toHaveClass(/culture-prediction-S/);
  await expect(prediction.locator(".prediction-title")).toHaveText(
    "Predição NoHarm",
  );
  await expect(prediction.locator(".prediction-value")).toHaveText(
    "Sensível · Acurácia: 65%",
  );
  await expect(
    details.getByText("Data da coleta: 01/03/2024 12:17"),
  ).toBeVisible();
  // and it must not state a release either: the date the pending collection
  // carries is not an antibiogram coming back
  await expect(details.getByText("Data da liberação")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(details).toBeHidden();

  // a drug with a released antibiogram and a newer pending collection shows
  // both, each as its own block: the released result with its date, the
  // pending one with the prediction set apart
  await resistant.locator(".culture-item", { hasText: "CEFEPIME" }).click();
  const blocks = details.locator(".culture-detail-item");
  await expect(blocks).toHaveCount(2);
  await expect(blocks.nth(0)).toContainText("Resultado: Resistente");
  await expect(blocks.nth(0)).toContainText(
    "Data da liberação: 08/03/2024 07:17",
  );
  await expect(blocks.nth(0).locator(".culture-prediction")).toHaveCount(0);
  await expect(blocks.nth(1)).toContainText("Resultado laboratorial pendente");
  await expect(blocks.nth(1).locator(".culture-prediction")).toHaveClass(
    /culture-prediction-S/,
  );
});

test("the card states the AWaRe classification of each drug", async ({
  page,
  mockApi,
}) => {
  // how aggressive the antimicrobial is (substancia.tp_nivel_atb): the reading
  // of an antibiogram is which drug to reach for, and the WHO AWaRe group is
  // part of that answer
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWith({ cultureStats: { resistantInUse: 1 } }),
  });
  mockApi.override("GET /prescriptions/:id/cultures", {
    json: { status: "success", data: CULTURES },
  });

  await page.goto("/prescricao/199");
  await openCultureTab(page);

  const row = (drug: string) =>
    page.locator(".culture-item", { hasText: drug });

  // the row has no room for the word: it carries the dot and the initial of
  // the group, and the drug name keeps the space it needs to identify the row
  await expect(row("OXACILINA").locator(".culture-aware")).toHaveText("A");
  await expect(row("CEFEPIME").locator(".culture-aware")).toHaveText("O");

  // the level is stated on the row of a prediction too: the classification is
  // a property of the drug, not of the antibiogram
  await page.locator(".culture-predictions-toggle").click();
  await expect(row("VANCOMICINA").locator(".culture-aware")).toHaveText("R");

  // an unclassified substance, and one the backend did not send the field for,
  // carry no badge: the column is curated apart from the card and a grey badge
  // on every row would say nothing
  await expect(row("AMICACINA").locator(".culture-aware")).toHaveCount(0);
  await expect(row("GENTAMICINA").locator(".culture-aware")).toHaveCount(0);

  // the word the letter stands for is one hover away, and nothing more: what
  // the scale means is left to the modal, which has the room to say it
  await row("OXACILINA").locator(".culture-aware").hover();
  await expect(page.getByText("Classificação AWaRe: Acesso")).toBeVisible();
  await expect(
    page.getByText("Acesso é o menos agressivo, Reserva o mais agressivo"),
  ).toHaveCount(0);

  // the modal has the room the row had not: there an unclassified drug is
  // said to be unclassified instead of being left silent
  await row("AMICACINA").click();
  const details = page.locator(".culture-details-modal");
  await expect(details.locator(".culture-aware-detail")).toContainText(
    "Classificação AWaRe: Sem classificação",
  );
  // and the sentence that explains the scale stays out of it: the drug is not
  // on the scale, so there is nothing for it to explain
  await expect(details.locator(".culture-aware-hint")).toHaveCount(0);

  await page.keyboard.press("Escape");
  await expect(details).toBeHidden();

  await row("OXACILINA").click();
  await expect(details.locator(".culture-aware-detail")).toContainText(
    "Classificação AWaRe: Acesso",
  );
  await expect(details.locator(".culture-aware-hint")).toContainText(
    "Acesso é o menos agressivo, Reserva o mais agressivo",
  );
});

test("the card states a not recommended antimicrobial", async ({
  page,
  mockApi,
}) => {
  // the WHO group apart from the scale (substancia.tp_nivel_atb = 4): the row
  // carries its badge and the modal names it, instead of reading it as
  // unclassified
  const notRecommended = CULTURES.map((drug) =>
    drug.drug === "OXACILINA" ? { ...drug, atbLevel: 4 } : drug,
  );

  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWith({ cultureStats: { resistantInUse: 1 } }),
  });
  mockApi.override("GET /prescriptions/:id/cultures", {
    json: { status: "success", data: notRecommended },
  });

  await page.goto("/prescricao/199");
  await openCultureTab(page);

  const row = page.locator(".culture-item", { hasText: "OXACILINA" });
  await expect(row.locator(".culture-aware")).toHaveText("N");
  await expect(row.locator(".culture-aware")).toHaveClass(/culture-aware-4/);

  await row.click();
  const details = page.locator(".culture-details-modal");
  await expect(details.locator(".culture-aware-detail")).toContainText(
    "Classificação AWaRe: Não recomendado",
  );
  await expect(details.locator(".culture-aware-value-4")).toBeVisible();
  await expect(details.locator(".culture-aware-hint")).toBeVisible();
});

test("with no released result the card says so and folds the predictions", async ({
  page,
  mockApi,
}) => {
  // every collection of this patient is still pending: the card holds nothing
  // but predictions, which is the reading that must not be mistaken for an
  // antibiogram
  const pendingOnly = CULTURES.filter((drug) =>
    drug.items.every((item) => !item.result),
  );

  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWith({ cultureStats: { resistantInUse: 0 } }),
  });
  mockApi.override("GET /prescriptions/:id/cultures", {
    json: { status: "success", data: pendingOnly },
  });

  await page.goto("/prescricao/199");
  await openCultureTab(page);

  // the answer the card owes the user, before the prediction that stands in
  // for the result it has not got
  const noReleased = page.locator(".culture-no-released");
  await expect(noReleased).toContainText(
    "Nenhum resultado laboratorial liberado",
  );
  await expect(noReleased).toContainText(
    "Enquanto o antibiograma não é liberado, a NoHarm gera uma predição",
  );
  // and it is not the empty state: the patient does have cultures
  await expect(
    page.getByText("Nenhum resultado positivo de cultura"),
  ).toHaveCount(0);
  // nothing was released, so the footer has no release to date either
  await expect(page.locator(".culture-last-release")).toHaveCount(0);

  // the predictions themselves are one click away
  const toggle = page.locator(".culture-predictions-toggle");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(".culture-item")).toHaveCount(0);

  await toggle.click();
  await expect(
    page.locator(".culture-group-predictionResistant .culture-item .name"),
  ).toHaveText(["VANCOMICINA"]);
  await expect(
    page.locator(".culture-group-predictionSusceptible .culture-item .name"),
  ).toHaveText(["GENTAMICINA"]);

  // and they can be folded back away
  await toggle.click();
  await expect(page.locator(".culture-item")).toHaveCount(0);
});

test("the tab is not flagged when no resistant drug is in use", async ({
  page,
  mockApi,
}) => {
  // the same cultures, none of them a drug the prescription carries
  const notInUse = CULTURES.map((drug) => ({ ...drug, prescribed: false }));

  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWith({ cultureStats: { resistantInUse: 0 } }),
  });
  mockApi.override("GET /prescriptions/:id/cultures", {
    json: { status: "success", data: notInUse },
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
    json: prescriptionWith({ cultureStats: { resistantInUse: 0 } }),
  });
  mockApi.override("GET /prescriptions/:id/cultures", {
    json: { status: "success", data: [] },
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

  await openCultureTab(page);

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
    json: prescriptionWith({ cultureStats: { resistantInUse: 1 } }),
  });
  mockApi.override("GET /prescriptions/:id/cultures", {
    json: { status: "success", data: CULTURES },
  });
  mockApi.override("GET /reports/culture", {
    json: { status: "success", data: [] },
  });

  await page.goto("/prescricao/199");
  await openCultureTab(page);

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

test("a failed load says so and offers to try again", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWith({ cultureStats: { resistantInUse: 1 } }),
  });
  mockApi.override("GET /prescriptions/:id/cultures", {
    status: 500,
    json: { status: "error", message: "boom" },
  });

  await page.goto("/prescricao/199");
  await openCultureTab(page);

  // "no cultures" would be a statement about the patient, and a failed load
  // is not one
  const error = page.locator(".culture-error");
  await expect(error).toContainText("Não foi possível carregar as culturas");
  await expect(
    page.getByText("Nenhum resultado positivo de cultura"),
  ).toHaveCount(0);

  // a failure is not retried on its own, the card offers the retry
  expect(cultureRequests(mockApi)).toHaveLength(1);
  mockApi.override("GET /prescriptions/:id/cultures", {
    json: { status: "success", data: CULTURES },
  });
  await error.getByRole("button", { name: "Tentar novamente" }).click();

  await expect(page.locator(".culture-group-resistantInUse")).toContainText(
    "Resistentes em uso",
  );
  expect(cultureRequests(mockApi)).toHaveLength(2);
});

test("the cultures are kept while the tab is switched away and back", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWith({ cultureStats: { resistantInUse: 1 } }),
  });
  mockApi.override("GET /prescriptions/:id/cultures", {
    json: { status: "success", data: CULTURES },
  });

  await page.goto("/prescricao/199");
  await openCultureTab(page);
  await expect(page.locator(".culture-group-resistantInUse")).toBeVisible();

  await page
    .locator(".ant-segmented-item-label", { hasText: "Exames" })
    .click();
  await openCultureTab(page);
  await expect(page.locator(".culture-group-resistantInUse")).toBeVisible();

  // the list is cached for the prescription: the second open asks nothing
  expect(cultureRequests(mockApi)).toHaveLength(1);
});
