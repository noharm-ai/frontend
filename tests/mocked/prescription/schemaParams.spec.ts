import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";

/**
 * Schema params (features/prescription/SchemaParams). In the page header,
 * maintainers open the schema's alert settings in force (backend
 * schema_params_service.view_schema_params), read only: they are edited in the
 * admin project. Values the schema's item sets (`custom`) are marked apart
 * from the code defaults.
 */

// each test logs in with its own permissions
test.use({ storageState: { cookies: [], origins: [] } });

const BASE_PERMISSIONS = [
  "READ_BASIC_FEATURES",
  "WRITE_BASIC_FEATURES",
  "READ_PRESCRIPTION",
  "WRITE_PRESCRIPTION",
];

const TYPES = [
  "liver",
  "platelets",
  "elderly",
  "tube",
  "allergy",
  "maxTime",
  "maxDose",
  "maxDosePlus",
  "ira",
  "pregnant",
  "lactating",
  "fasting",
  "protocol",
  "cultureResistant",
  "cultureResistantClass",
];

// the code defaults: everything on, the alerts' own levels
const defaultParams = () => ({
  alerts: {
    types: {
      kidney: {
        enabled: true,
        level: null,
        adultExams: ["ckd21", "ckd"],
        pediatricExams: ["swrtz2", "swrtz1"],
      },
      ...Object.fromEntries(
        TYPES.map((type) => [type, { enabled: true, level: null }]),
      ),
    },
    interactions: {},
  },
});

const respond = (data: Record<string, unknown>) => ({
  json: { status: "success", data },
});

const FOUND = (() => {
  const params = defaultParams();
  params.alerts.types.kidney.enabled = false;
  params.alerts.types.kidney.adultExams = ["ckd"];
  (
    params.alerts.types as Record<string, { level: string | null }>
  ).maxTime.level = "high";
  (params.alerts.interactions as Record<string, unknown>).it = {
    enabled: true,
    ignoreLevels: ["low"],
    ignoreFrequencies: [33, 44],
    requireIntervalIntersection: false,
  };

  return {
    schema: "demo",
    status: "found",
    invalidSections: [],
    params,
    custom: {
      alerts: {
        types: {
          kidney: { enabled: false, adultExams: ["ckd"] },
          maxTime: { level: "high" },
        },
        interactions: {
          it: { ignoreLevels: ["low"], ignoreFrequencies: [33, 44] },
        },
      },
    },
  };
})();

const DEFAULTS = (status: string, invalidSections: string[] = []) => ({
  schema: "demo",
  status,
  invalidSections,
  params: defaultParams(),
  custom: {},
});

// the maintainer button of the page header, next to "Fechar"
const paramsButton = (page: Page) =>
  page
    .locator('[data-kb="prescription.actions"]')
    .getByRole("button", { name: "Parametrização" });

const openPrescription = async (page: Page) => {
  await page.goto("/prescricao/199");
  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();
};

const openParams = async (page: Page) => {
  await paramsButton(page).click();
  const modal = page.locator(".ant-modal", { hasText: "Alertas" }).filter({
    has: page.getByText("Alterações são feitas no Admin, em Parametrização."),
  });
  await expect(modal).toBeVisible();

  return modal;
};

const loginAsMaintainer = (
  page: Page,
  mockApi: Parameters<typeof loginWithPermissions>[1],
) => loginWithPermissions(page, mockApi, [...BASE_PERMISSIONS, "MAINTAINER"]);

test("the params are only offered to maintainers", async ({
  page,
  mockApi,
}) => {
  await loginWithPermissions(page, mockApi, BASE_PERMISSIONS);
  await openPrescription(page);

  await expect(
    page
      .locator('[data-kb="prescription.actions"]')
      .getByRole("button", { name: "Fechar" }),
  ).toBeVisible();
  await expect(paramsButton(page)).toHaveCount(0);
  expect(mockApi.requests.some((r) => r.path === "/schema-params")).toBe(false);
});

test("found: the values the schema sets are marked as custom", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /schema-params", respond(FOUND));

  await loginAsMaintainer(page, mockApi);
  await openPrescription(page);
  const modal = await openParams(page);

  await expect(modal.getByText("demo", { exact: true })).toBeVisible();
  await expect(modal.getByText("Parametrização da instituição")).toBeVisible();

  const row = (text: string) =>
    modal.getByRole("row").filter({ hasText: text });

  const kidney = row("Ajuste Renal");
  await expect(kidney.getByText("Desligado")).toBeVisible();
  await expect(kidney.getByText("personalizado")).toHaveCount(1);

  const maxTime = row("Tempo de tratamento");
  await expect(maxTime.getByText("Alto")).toBeVisible();
  await expect(maxTime.getByText("personalizado")).toHaveCount(1);

  // a default row: on, the alert's own level, nothing marked
  const liver = row("Ajuste Hepático");
  await expect(liver.getByText("Ligado", { exact: true })).toBeVisible();
  await expect(liver.getByText("padrão")).toBeVisible();
  await expect(liver.getByText("personalizado")).toHaveCount(0);

  // each protocol sets its own level
  await expect(row("Protocolo Item").getByText("não se aplica")).toBeVisible();

  const adult = row("Adulto");
  await expect(adult).toContainText("ckd");
  await expect(adult).not.toContainText("ckd21");
  await expect(adult.getByText("personalizado")).toHaveCount(1);
  const pediatric = row("Pediátrico");
  await expect(pediatric.getByText("swrtz2, swrtz1")).toBeVisible();
  await expect(pediatric.getByText("personalizado")).toHaveCount(0);

  const interaction = row("Interação Medicamentosa");
  await expect(interaction.getByText("SN", { exact: true })).toBeVisible();
  await expect(interaction.getByText("ACM", { exact: true })).toBeVisible();
  await expect(interaction.getByText("Baixo")).toBeVisible();
  await expect(interaction.getByText("personalizado")).toHaveCount(2);

  // kinds missing from params are the defaults
  const duplicity = row("Duplicidade Medicamentosa");
  await expect(duplicity.getByText("Ligado", { exact: true })).toBeVisible();
  await expect(duplicity.getByText("personalizado")).toHaveCount(0);

  // the second side is an allergy: frequency and shared time do not apply
  await expect(
    row("Reatividade Cruzada").getByText("não se aplica"),
  ).toHaveCount(2);

  // kidney enabled, maxTime level, adult exams, it levels and frequencies
  await expect(modal.getByText("personalizado", { exact: true })).toHaveCount(
    5,
  );

  await modal.getByText("JSON (somente o personalizado)").click();
  await expect(modal.locator("pre")).toContainText('"maxTime"');
});

test("not_found: the defaults, nothing marked", async ({ page, mockApi }) => {
  mockApi.override("GET /schema-params", respond(DEFAULTS("not_found")));

  await loginAsMaintainer(page, mockApi);
  await openPrescription(page);
  const modal = await openParams(page);

  await expect(
    modal.getByText("Sem parametrização: valores padrão"),
  ).toBeVisible();
  await expect(modal.getByText("personalizado", { exact: true })).toHaveCount(
    0,
  );
  await expect(modal.getByText("Desligado")).toHaveCount(0);
});

test("read_error: warns that the defaults are in use", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /schema-params", respond(DEFAULTS("read_error")));

  await loginAsMaintainer(page, mockApi);
  await openPrescription(page);
  const modal = await openParams(page);

  await expect(
    modal
      .locator(".ant-alert-warning")
      .getByText(
        "Não foi possível ler a parametrização; os valores padrão estão em uso",
      ),
  ).toBeVisible();
  await expect(modal.getByText("personalizado", { exact: true })).toHaveCount(
    0,
  );
});

test("invalid sections are named", async ({ page, mockApi }) => {
  mockApi.override(
    "GET /schema-params",
    respond(DEFAULTS("found", ["alerts"])),
  );

  await loginAsMaintainer(page, mockApi);
  await openPrescription(page);
  const modal = await openParams(page);

  await expect(
    modal.getByText("Seções inválidas, com os valores padrão em uso: alerts"),
  ).toBeVisible();
});

test("each open fetches the params again", async ({ page, mockApi }) => {
  mockApi.override("GET /schema-params", respond(FOUND));

  await loginAsMaintainer(page, mockApi);
  await openPrescription(page);

  const modal = await openParams(page);
  await expect(modal.getByText("Parametrização da instituição")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(modal).toBeHidden();
  const callsBefore = mockApi.requests.filter(
    (r) => r.path === "/schema-params",
  ).length;

  // the item is removed in admin meanwhile: the reopened modal shows it
  mockApi.override("GET /schema-params", respond(DEFAULTS("not_found")));
  const reopened = await openParams(page);
  await expect(
    reopened.getByText("Sem parametrização: valores padrão"),
  ).toBeVisible();
  await expect(
    reopened.getByText("personalizado", { exact: true }),
  ).toHaveCount(0);

  expect(
    mockApi.requests.filter((r) => r.path === "/schema-params").length,
  ).toBeGreaterThan(callsBefore);
});

test("a failed request shows an error", async ({ page, mockApi }) => {
  mockApi.override("GET /schema-params", {
    status: 500,
    json: { status: "error", message: "Erro inesperado" },
  });

  await loginAsMaintainer(page, mockApi);
  await openPrescription(page);
  await paramsButton(page).click();

  await expect(
    page.getByText("Não foi possível carregar a parametrização"),
  ).toBeVisible();
});
