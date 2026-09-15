import type { Page, Route } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";
import { loginWithFeatures } from "../support/featureLogin";

/**
 * Alternatives to a prescribed antimicrobial, read from the antibiogram on
 * the AWaRe scale (src/features/culture/CultureAlternatives).
 *
 * The comparison is fetched on demand from
 * GET /prescriptions/:id/cultures/alternatives?sctid=, never with the
 * prescription: from the culture card, where the backend says whether a
 * prescribed drug has anything to offer (hasAlternatives), and from the
 * culture alert of the item, where the resistance itself is the trigger.
 */

test.use({ storageState: { cookies: [], origins: [] } });

test.beforeEach(async ({ page, mockApi }) => {
  await loginWithFeatures(page, mockApi, ["CULTURE"]);
});

const SPECIMEN = {
  idExamItem: 900001,
  microorganism: "Microorganismo Teste",
  material: "Sangue Total",
  collectionDate: "2024-03-01T12:17:03",
  releaseDate: "2024-03-08T07:17:02",
};

const released = (result: string, resultType: string, drug: string) => ({
  key: `SANGUE TOTAL#MICROORGANISMO TESTE#${drug}`,
  ...SPECIMEN,
  result,
  resultType,
  resultDetail: null,
  prediction: null,
  predictionType: null,
  probability: null,
});

const CULTURES = [
  {
    // resistant and in use, with susceptible drugs beside it: the modal
    // offers to fetch them
    drug: "OXACILINA",
    sctid: 1111,
    prescribed: true,
    hasAlternatives: true,
    items: [released("Resistente", "R", "OXACILINA")],
  },
  {
    // susceptible and in use, with a less aggressive susceptible drug in the
    // same antibiogram: a step down is offered
    drug: "MEROPENEM",
    sctid: 4444,
    prescribed: true,
    hasAlternatives: true,
    items: [released("Sensível", "S", "MEROPENEM")],
  },
  {
    // susceptible and in use, but already the least aggressive option: the
    // backend found nothing to step down to, so nothing is offered
    drug: "AMICACINA",
    sctid: 2222,
    prescribed: true,
    hasAlternatives: false,
    items: [released("Sensível", "S", "AMICACINA")],
  },
  {
    drug: "CEFEPIME",
    sctid: 3333,
    items: [released("Sensível", "S", "CEFEPIME")],
  },
];

const ESCALATION = {
  sctid: 1111,
  substance: { name: "OXACILINA", atbLevel: 1 },
  drug: "OXACILINA",
  cultures: [
    {
      ...SPECIMEN,
      result: "Resistente",
      resultType: "R",
      mode: "escalation",
      alternatives: [
        {
          drug: "AMICACINA",
          sctid: 2222,
          atbLevel: 1,
          result: "Sensível",
          resultDetail: null,
        },
        {
          drug: "CEFEPIME",
          sctid: 3333,
          atbLevel: 2,
          result: "Sensível dose-dependente",
          resultDetail: "Sensível dose-dependente",
        },
        {
          drug: "MEROPENEM",
          sctid: 4444,
          atbLevel: 3,
          result: "Sensível",
          resultDetail: null,
        },
        {
          drug: "LINEZOLIDA",
          sctid: 5555,
          atbLevel: null,
          result: "Sensível",
          resultDetail: null,
        },
      ],
    },
  ],
};

const DEESCALATION = {
  sctid: 4444,
  substance: { name: "MEROPENEM", atbLevel: 3 },
  drug: "MEROPENEM",
  cultures: [
    {
      ...SPECIMEN,
      result: "Sensível",
      resultType: "S",
      mode: "deescalation",
      alternatives: [
        {
          drug: "AMICACINA",
          sctid: 2222,
          atbLevel: 1,
          result: "Sensível",
          resultDetail: null,
        },
        {
          drug: "CEFEPIME",
          sctid: 3333,
          atbLevel: 2,
          result: "Sensível",
          resultDetail: null,
        },
      ],
    },
  ],
};

const ALTERNATIVES_KEY = "GET /prescriptions/:id/cultures/alternatives";

/** Answers by the sctid asked for, and records every query string seen. */
const alternativesBySctid = (
  answers: Record<string, unknown>,
  seen: string[],
) => {
  return async (route: Route) => {
    const url = new URL(route.request().url());
    const sctid = url.searchParams.get("sctid") ?? "";
    seen.push(sctid);

    await route.fulfill({
      status: 200,
      json: { status: "success", data: answers[sctid] },
    });
  };
};

const prescriptionWith = (patch: Record<string, unknown>) => {
  const fixture = loadFixture<{ data: Record<string, unknown> }>(
    "prescriptions/single-199.json",
  );
  fixture.data = { ...fixture.data, ...patch };
  return fixture;
};

const openPrescription = async (page: Page) => {
  await page.goto("/prescricao/199");
  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();
};

const openCultureTab = async (page: Page) => {
  await page
    .locator(".ant-segmented-item-label", { hasText: "Cultura" })
    .click();
  await expect(page.getByRole("radio", { name: "Cultura" })).toBeChecked();
};

const openDetails = async (page: Page, drug: string) => {
  await page.locator(".culture-item", { hasText: drug }).click();
  const details = page.locator(".culture-details-modal");
  await expect(details.getByText(drug)).toBeVisible();
  return details;
};

test("a resistant drug in use offers the susceptible alternatives", async ({
  page,
  mockApi,
}) => {
  const seen: string[] = [];
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWith({ cultureStats: { resistantInUse: 1 } }),
  });
  mockApi.override("GET /prescriptions/:id/cultures", {
    json: { status: "success", data: CULTURES },
  });
  mockApi.override(
    ALTERNATIVES_KEY,
    alternativesBySctid({ "1111": ESCALATION }, seen),
  );

  await openPrescription(page);
  await openCultureTab(page);
  const details = await openDetails(page, "OXACILINA");

  // nothing is fetched until the user asks for it
  expect(seen).toEqual([]);

  const button = details.locator(".culture-alternatives-button");
  await expect(button).toHaveText("Ver alternativas sensíveis");
  await expect(button).toHaveClass(/culture-alternatives-button-escalation/);
  await button.click();

  // asked by the substance of the drug the card shows
  await expect.poll(() => seen).toEqual(["1111"]);

  const modal = page.locator(".culture-alternatives-modal");
  await expect(modal.getByText("Alternativas pelo antibiograma")).toBeVisible();

  // the prescribed drug and where it sits on the scale
  await expect(modal.locator(".culture-alternatives-drug")).toHaveText(
    "OXACILINA",
  );
  await expect(
    modal.locator(".culture-alternatives-substance .culture-aware-level"),
  ).toHaveText("AWaRe: Acesso");

  // the specimen the options were read from, and the result they answer
  const specimen = modal.locator(".culture-alternatives-specimen");
  await expect(specimen).toHaveCount(1);
  await expect(specimen).toHaveClass(/culture-alternatives-specimen-escalation/);
  await expect(specimen).toContainText("Microorganismo: Microorganismo Teste");
  await expect(specimen).toContainText("Material: Sangue Total");
  await expect(specimen).toContainText("Data da coleta: 01/03/2024 12:17");
  await expect(specimen.locator(".culture-alternatives-result")).toHaveText(
    "Resistente",
  );
  await expect(specimen).toContainText(
    "Resultado resistente: medicamentos sensíveis no mesmo antibiograma",
  );

  // grouped by AWaRe level, least aggressive first, unclassified last
  const groups = specimen.locator(".culture-alternatives-group");
  await expect(groups.locator(".culture-alternatives-level")).toHaveText([
    "Acesso",
    "Vigilância",
    "Reserva",
    "Sem classificação",
  ]);
  await expect(
    groups.nth(0).locator(".culture-alternative-item .name"),
  ).toHaveText(["AMICACINA"]);
  await expect(
    groups.nth(1).locator(".culture-alternative-item .name"),
  ).toHaveText(["CEFEPIME"]);
  await expect(
    groups.nth(2).locator(".culture-alternative-item .name"),
  ).toHaveText(["MEROPENEM"]);
  await expect(
    groups.nth(3).locator(".culture-alternative-item .name"),
  ).toHaveText(["LINEZOLIDA"]);

  // a susceptibility that says more than "sensível" keeps its wording
  await expect(
    groups.nth(1).locator(".culture-alternative-item .detail"),
  ).toHaveText("Sensível dose-dependente");

  // the reading is a suggestion, and the modal says so
  await expect(modal.locator(".culture-alternatives-disclaimer")).toContainText(
    "Sugestão baseada apenas no antibiograma",
  );
});

test("a susceptible drug in use offers a step down only when there is one", async ({
  page,
  mockApi,
}) => {
  const seen: string[] = [];
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWith({ cultureStats: { resistantInUse: 1 } }),
  });
  mockApi.override("GET /prescriptions/:id/cultures", {
    json: { status: "success", data: CULTURES },
  });
  mockApi.override(
    ALTERNATIVES_KEY,
    alternativesBySctid({ "4444": DEESCALATION }, seen),
  );

  await openPrescription(page);
  await openCultureTab(page);

  // the least aggressive susceptible drug has nothing to step down to: the
  // backend said so, and the card offers nothing
  let details = await openDetails(page, "AMICACINA");
  await expect(details.getByText("Medicamento em uso nesta prescrição")).toBeVisible();
  await expect(details.locator(".culture-alternatives-button")).toHaveCount(0);
  await expect(details.locator(".culture-alternatives-none")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(details).toBeHidden();

  details = await openDetails(page, "MEROPENEM");
  const button = details.locator(".culture-alternatives-button");
  await expect(button).toHaveText("Ver opções de descalonamento");
  await expect(button).toHaveClass(/culture-alternatives-button-deescalation/);
  await button.click();

  await expect.poll(() => seen).toEqual(["4444"]);

  const modal = page.locator(".culture-alternatives-modal");
  await expect(
    modal.locator(".culture-alternatives-substance .culture-aware-level"),
  ).toHaveText("AWaRe: Reserva");

  const specimen = modal.locator(".culture-alternatives-specimen");
  await expect(specimen).toHaveClass(
    /culture-alternatives-specimen-deescalation/,
  );
  await expect(specimen.locator(".culture-alternatives-result")).toHaveText(
    "Sensível",
  );
  await expect(specimen).toContainText("candidatos a descalonamento");
  await expect(
    specimen.locator(".culture-alternative-item .name"),
  ).toHaveText(["AMICACINA", "CEFEPIME"]);
});

test("a resistant drug with nothing susceptible beside it is told so", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWith({ cultureStats: { resistantInUse: 1 } }),
  });
  mockApi.override("GET /prescriptions/:id/cultures", {
    json: {
      status: "success",
      data: [{ ...CULTURES[0], hasAlternatives: false }],
    },
  });

  await openPrescription(page);
  await openCultureTab(page);
  const details = await openDetails(page, "OXACILINA");

  await expect(details.locator(".culture-alternatives-button")).toHaveCount(0);
  await expect(details.locator(".culture-alternatives-none")).toHaveText(
    "Nenhum medicamento sensível neste antibiograma.",
  );
});

test("the culture alert of the item offers the alternatives", async ({
  page,
  mockApi,
}) => {
  const seen: string[] = [];
  const fixture = loadFixture<{
    data: { prescription: Record<string, unknown>[] };
  }>("prescriptions/single-199.json");

  fixture.data.prescription = fixture.data.prescription.map((item) => ({
    ...item,
    alertsComplete:
      `${item.idPrescriptionDrug}` === "9001"
        ? [
            {
              idPrescriptionDrug: "9001",
              key: "",
              type: "cultureResistant",
              level: "high",
              text: "Cultura com resultado resistente para este medicamento (Microorganismo Teste, coleta em 01/03/2024).",
              handling: false,
            },
          ]
        : [],
  }));

  mockApi.override("GET /prescriptions/:id", { json: fixture });
  mockApi.override(
    ALTERNATIVES_KEY,
    alternativesBySctid(
      // the item carries the substance the alert was raised for
      { "100": { ...ESCALATION, sctid: 100, drug: "Dipirona" } },
      seen,
    ),
  );

  await openPrescription(page);

  // the alert count next to the score opens the row that details the alerts
  const row = page.locator("tr", { hasText: "Dipirona 500mg" }).first();
  await row.locator(".score-container .ant-tag").first().click();
  await expect(page.getByText("Alertas Nível Alto")).toBeVisible();

  const button = page.locator(".culture-alternatives-button");
  await expect(button).toHaveText("Ver alternativas sensíveis");
  expect(seen).toEqual([]);

  await button.click();

  // asked by the substance of the item, from its own prescription
  await expect.poll(() => seen).toEqual(["100"]);
  expect(
    mockApi.requests.filter((r) =>
      r.path.endsWith("/cultures/alternatives"),
    ).map((r) => r.path),
  ).toEqual(["/prescriptions/199/cultures/alternatives"]);

  const modal = page.locator(".culture-alternatives-modal");
  await expect(modal.locator(".culture-alternatives-drug")).toHaveText(
    "Dipirona",
  );
  await expect(
    modal.locator(".culture-alternative-item .name"),
  ).toHaveText(["AMICACINA", "CEFEPIME", "MEROPENEM", "LINEZOLIDA"]);
});

test("a failed fetch says so and opens nothing", async ({ page, mockApi }) => {
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWith({ cultureStats: { resistantInUse: 1 } }),
  });
  mockApi.override("GET /prescriptions/:id/cultures", {
    json: { status: "success", data: CULTURES },
  });
  mockApi.override(ALTERNATIVES_KEY, {
    status: 500,
    json: { status: "error", message: "Erro no antibiograma" },
  });

  await openPrescription(page);
  await openCultureTab(page);
  const details = await openDetails(page, "OXACILINA");

  await details.locator(".culture-alternatives-button").click();

  await expect(
    page.getByText("Não foi possível carregar as alternativas"),
  ).toBeVisible();
  await expect(page.locator(".culture-alternatives-modal")).toHaveCount(0);
});
