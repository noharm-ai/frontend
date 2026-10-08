import type { Locator, Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";
import { loginWithPermissions } from "../support/featureLogin";
import { openSelect, pickOption } from "../support/antd";

/**
 * Drug dashboard (/painel-medicamentos, src/features/drugs/DrugDashboard).
 *
 * Segment and drug live in the URL, so every pick is a navigation: picking a
 * segment loads that segment's drug list, picking a drug loads
 * GET /drugs/dashboard/:idSegment/:idDrug — one payload holding the substance,
 * the attributes, the computed scores and the unit conversions.
 *
 * The dashboard refuses to render at all while the drug has no substance, and
 * the score table writes back row by row through PUT /outliers/:idOutlier.
 */

const SEGMENT = 1;
const DRUG = 5200;
const DRUG_SLUG = "paracetamol-750mg-comprimido";
const DASHBOARD_URL = `/painel-medicamentos/${SEGMENT}/${DRUG}/${DRUG_SLUG}`;

const BASE_PERMISSIONS = [
  "READ_BASIC_FEATURES",
  "WRITE_BASIC_FEATURES",
  "READ_PRESCRIPTION",
  "READ_DRUG_ATTRIBUTES",
  "WRITE_DRUG_ATTRIBUTES",
];

const ok = (data: unknown) => ({ json: { status: "success", data } });

function installDrugHandlers(mockApi: MockApi, dashboard?: unknown) {
  mockApi.override("GET /drugs/:idSegment", {
    json: loadFixture("drugs/segment-drugs.json"),
  });
  mockApi.override(
    "GET /drugs/dashboard/:idSegment/:idDrug",
    dashboard
      ? { json: dashboard }
      : { json: loadFixture("drugs/dashboard.json") },
  );
  mockApi.override("GET /drugs/attributes/:idSegment/:idDrug", {
    json: loadFixture("drugs/attributes.json"),
  });
  mockApi.override("PUT /outliers/:idOutlier", ok({}));
  // the substance picker loads its list before the dashboard answers, since
  // the card starts out with no substance to show
  mockApi.override(
    "GET /substance",
    ok([
      { sctid: "387517004", name: "Paracetamol", active: true },
      { sctid: "387207008", name: "Ibuprofeno", active: false },
    ]),
  );
}

const dashboardFixture = () => loadFixture<any>("drugs/dashboard.json");

const card = (page: Page, title: string): Locator =>
  page
    .locator(".ant-card")
    .filter({ has: page.getByText(title, { exact: true }) })
    .first();

const scoreRows = (page: Page) =>
  card(page, "Escores").locator(".ant-table-row");

async function openDashboard(
  page: Page,
  mockApi: MockApi,
  dashboard?: unknown,
  url = DASHBOARD_URL,
) {
  installDrugHandlers(mockApi, dashboard);
  await page.goto(url);
  await expect(
    page.getByRole("heading", { name: /Painel de Medicamentos/ }),
  ).toBeVisible();
}

test("without a drug the panel only invites one to be picked", async ({
  page,
  mockApi,
}) => {
  installDrugHandlers(mockApi);
  await page.goto("/painel-medicamentos");

  await expect(
    page.getByRole("heading", { name: "Selecione um medicamento" }),
  ).toBeVisible();
  await expect(card(page, "Escores")).toHaveCount(0);

  // the drug select only appears once a segment narrows it down
  await expect(page.getByText("Medicamento...")).toHaveCount(0);
  await expect(page.getByText("Segmento...")).toBeVisible();
});

test("picking a segment and a drug walks the URL into the dashboard", async ({
  page,
  mockApi,
}) => {
  installDrugHandlers(mockApi);
  await page.goto("/painel-medicamentos");

  await expect(page.locator(".ant-select")).toHaveCount(1);
  await openSelect(page.locator(".ant-select").first());
  await pickOption(page, "Adulto");

  await expect(page).toHaveURL(new RegExp(`/painel-medicamentos/${SEGMENT}$`));
  await expect
    .poll(() => mockApi.requests.some((r) => r.path === `/drugs/${SEGMENT}`))
    .toBe(true);
  // the drug select is only added to the filter once a segment is chosen
  await expect(page.locator(".ant-select")).toHaveCount(2);

  await openSelect(page.locator(".ant-select").nth(1));
  await pickOption(page, "Paracetamol 750mg comprimido");

  await expect(page).toHaveURL(
    new RegExp(`/painel-medicamentos/${SEGMENT}/${DRUG}/${DRUG_SLUG}$`),
  );
  await expect(card(page, "Escores")).toBeVisible();
});

test("the score table renders each row the way the backend scored it", async ({
  page,
  mockApi,
}) => {
  await openDashboard(page, mockApi);

  await expect(scoreRows(page)).toHaveCount(3);

  // a row with a division range is shown as the band it covers
  const banded = scoreRows(page).filter({ hasText: "400,00-500,00 MG" });
  await expect(banded).toHaveCount(1);
  await expect(banded).toContainText("2,000");
  await expect(banded).toContainText("10");

  // without one, the dose stands alone — and a missing unit is marked **
  await expect(scoreRows(page).filter({ hasText: "2.000,00 **" })).toHaveCount(
    1,
  );

  // the info bar repeats the attributes the scores were computed with
  const scores = card(page, "Escores");
  await expect(scores).toContainText("Divisor de faixas:");
  await expect(scores).toContainText("100,00 MG");
  await expect(scores).toContainText("Considera peso:");
  await expect(scores).toContainText("Não");
  // the most recent row is what "updated at" reports
  await expect(scores).toContainText("11/02/2026 09:05");
});

test("no scores at all is called out as an error", async ({
  page,
  mockApi,
}) => {
  const dashboard = dashboardFixture();
  dashboard.data.outliers = [];

  await openDashboard(page, mockApi, dashboard);

  await expect(card(page, "Escores")).toContainText(
    'Nenhum escore encontrado. Clique em "Gerar escores"',
  );
  await expect(scoreRows(page)).toHaveCount(0);
});

test("a manual score is written back to its outlier and kept on the row", async ({
  page,
  mockApi,
}) => {
  await openDashboard(page, mockApi);

  const row = scoreRows(page).filter({ hasText: "400,00-500,00 MG" });
  await openSelect(row.locator(".ant-select"));
  await pickOption(page, "3");

  const saved = mockApi.requests.find(
    (r) => r.method === "PUT" && r.path === "/outliers/901",
  );
  expect(saved).toBeTruthy();
  expect(JSON.parse(saved?.postData ?? "{}")).toEqual({ manualScore: 3 });

  // the row keeps the new value without the dashboard being fetched again
  await expect(row.locator(".ant-select")).toContainText("3");
});

test("a rejected manual score is reported and the row keeps its value", async ({
  page,
  mockApi,
}) => {
  await openDashboard(page, mockApi);
  mockApi.override("PUT /outliers/:idOutlier", {
    status: 500,
    json: { status: "error", message: "boom" },
  });

  const row = scoreRows(page).filter({ hasText: "400,00-500,00 MG" });
  await openSelect(row.locator(".ant-select"));
  await pickOption(page, "4");

  await expect(
    page.getByText("Erro ao salvar escore manual.").first(),
  ).toBeVisible();
});

test("the observation modal opens on the stored text and saves the new one", async ({
  page,
  mockApi,
}) => {
  await openDashboard(page, mockApi);

  const row = scoreRows(page).filter({ hasText: "1.400,00-1.500,00 MG" });
  await row.getByRole("button", { name: "message", exact: true }).click();

  const modal = page.locator(".ant-modal", { hasText: "Observação" }).first();
  await expect(modal).toBeVisible();
  await expect(modal).not.toHaveClass(/ant-zoom/);
  await expect(modal.locator("textarea")).toHaveValue(
    "Dose habitual no pós-operatório.",
  );

  await modal.locator("textarea").fill("Revisado pela farmácia clínica.");
  await modal.getByRole("button", { name: "Salvar" }).click();

  await expect(modal).toBeHidden();
  const saved = mockApi.requests.find(
    (r) => r.method === "PUT" && r.path === "/outliers/902",
  );
  expect(JSON.parse(saved?.postData ?? "{}")).toEqual({
    obs: "Revisado pela farmácia clínica.",
  });
});

test("the conversions card lists every factor against the default unit", async ({
  page,
  mockApi,
}) => {
  await openDashboard(page, mockApi);

  const conversions = card(page, "Conversões");
  await expect(conversions).toContainText("Unidade padrão:");
  await expect(conversions).toContainText("(Miligrama)");
  await expect(conversions).toContainText("1,0000");
  await expect(conversions).toContainText("(Grama)");
  await expect(conversions).toContainText("1.000,0000");
  await expect(
    conversions.getByText("Unidade padrão não definida"),
  ).toHaveCount(0);
});

test("a drug with no default unit is flagged on the conversions card", async ({
  page,
  mockApi,
}) => {
  const dashboard = dashboardFixture();
  dashboard.data.attributes.idMeasureUnit = null;

  await openDashboard(page, mockApi, dashboard);

  await expect(card(page, "Conversões")).toContainText(
    "Unidade padrão não definida",
  );
});

test("'Editar conversões' opens the conversion editor for this drug", async ({
  page,
  mockApi,
}) => {
  await openDashboard(page, mockApi);
  mockApi.override(
    "GET /drugs/unit-conversion/:idDrug",
    ok({
      idMeasureUnit: "MG",
      conversionList: [{ idMeasureUnit: "G", name: "Grama", factor: 1000 }],
    }),
  );

  await card(page, "Conversões")
    .getByRole("button", { name: /Editar conversões/ })
    .click();

  await expect(
    mockApi.requests.some((r) => r.path === `/drugs/unit-conversion/${DRUG}`),
  ).toBeTruthy();
  await expect(page.locator(".ant-modal").first()).toBeVisible();
});

test("a drug without a substance blocks the dashboard until one is set", async ({
  page,
  mockApi,
}) => {
  const dashboard = dashboardFixture();
  dashboard.data.substance = null;

  installDrugHandlers(mockApi, dashboard);
  mockApi.override("POST /drugs/substance", ok({}));

  await page.goto(DASHBOARD_URL);

  await expect(
    page.getByText("Substância não definida. Adicione uma substância"),
  ).toBeVisible();
  // the cards stay out of the way until the substance is there
  await expect(card(page, "Escores")).toHaveCount(0);
  await expect(card(page, "Conversões")).toHaveCount(0);

  // the dashboard comes back with the substance set
  mockApi.override("GET /drugs/dashboard/:idSegment/:idDrug", {
    json: dashboardFixture(),
  });
  await openSelect(
    page.locator(".ant-select").filter({ has: page.locator("#sctidA") }),
  );
  await pickOption(page, "Paracetamol");
  await page.getByRole("button", { name: "check", exact: true }).click();

  const saved = mockApi.requests.find((r) => r.path === "/drugs/substance");
  expect(JSON.parse(saved?.postData ?? "{}")).toEqual({
    idDrug: `${DRUG}`,
    sctid: "387517004",
  });
  await expect(card(page, "Escores")).toBeVisible();
});

test("the attributes card loads this drug's attributes for this segment", async ({
  page,
  mockApi,
}) => {
  await openDashboard(page, mockApi);

  const attributes = card(page, "Substância e Atributos");
  await expect(attributes).toContainText("Paracetamol");
  await expect(attributes.locator("#antimicro")).toBeChecked();
  await expect(attributes.locator("#mav")).not.toBeChecked();

  expect(
    mockApi.requests.some(
      (r) => r.path === `/drugs/attributes/${SEGMENT}/${DRUG}`,
    ),
  ).toBe(true);
});

test("a deep link to a dose and frequency asks the backend to mark that row", async ({
  page,
  mockApi,
}) => {
  const urls: string[] = [];
  installDrugHandlers(mockApi);
  mockApi.override("GET /drugs/dashboard/:idSegment/:idDrug", (route) => {
    urls.push(route.request().url());
    return route.fulfill({ json: dashboardFixture() });
  });

  await page.goto(`${DASHBOARD_URL}/1500/3`);
  await expect(card(page, "Escores")).toBeVisible();

  expect(urls.at(-1)).toContain("dose=1500");
  expect(urls.at(-1)).toContain("frequency=3");
});

test("the maintainer-only actions are hidden from an ordinary user", async ({
  page,
  mockApi,
}) => {
  await openDashboard(page, mockApi);

  await expect(page.getByTestId("maintainer-group")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Remover Outlier" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Gerar Histórico de Prescrição" }),
  ).toHaveCount(0);
});

test.describe("as a maintainer", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("the maintenance actions are offered next to the panel title", async ({
    page,
    mockApi,
  }) => {
    installDrugHandlers(mockApi);
    await loginWithPermissions(page, mockApi, [
      ...BASE_PERMISSIONS,
      "MAINTAINER",
    ]);

    await page.goto(DASHBOARD_URL);

    await expect(
      page.getByRole("button", { name: "Remover Outlier" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Gerar Histórico de Prescrição" }),
    ).toBeVisible();
  });
});

test("a failing dashboard fetch leaves the cards empty", async ({
  page,
  mockApi,
}) => {
  installDrugHandlers(mockApi);
  mockApi.override("GET /drugs/dashboard/:idSegment/:idDrug", {
    status: 500,
    json: { status: "error", message: "boom" },
  });

  await page.goto(DASHBOARD_URL);

  await expect(
    page.getByRole("heading", { name: /Painel de Medicamentos/ }),
  ).toBeVisible();
  await expect(scoreRows(page)).toHaveCount(0);
});
