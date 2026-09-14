import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";
import { loginWithFeatures } from "../support/featureLogin";

/**
 * The culture card is behind a schema feature (models/Feature.CULTURE): it
 * depends on the antibiogram integration, so a client without it must see the
 * exams card exactly as it was — no tab bar, no culture alert cell, and no
 * request for the cultures.
 *
 * The enabled card is covered by cultureTab.spec.ts and cultureAlerts.spec.ts.
 */

test.use({ storageState: { cookies: [], origins: [] } });

const CULTURES_PATH = "/prescriptions/199/cultures";

const prescriptionWithCultureData = () => {
  const fixture = loadFixture<{ data: Record<string, unknown> }>(
    "prescriptions/single-199.json",
  );

  // the backend gates the cultures too (services/prescription_view_service),
  // but the frontend must not offer the card even when the payload carries
  // them — the two gates are independent
  fixture.data = {
    ...fixture.data,
    cultureStats: { resistantInUse: 1 },
    alertStats: {
      ...(fixture.data.alertStats as Record<string, unknown>),
      cultureResistant: 1,
      cultureResistantClass: 1,
    },
  };

  return fixture;
};

test("without the feature the exams card keeps its plain title", async ({
  page,
  mockApi,
}) => {
  await loginWithFeatures(page, mockApi, []);

  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWithCultureData(),
  });

  await page.goto("/prescricao/199");

  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();

  // the card title is the heading it has always been, not a tab bar
  const examsTitle = page.locator("h3.title", { hasText: "Exames" });
  await expect(examsTitle).toHaveCount(1);
  await expect(examsTitle.locator(".ant-segmented")).toHaveCount(0);
  await expect(
    page.locator(".ant-segmented-item-label", { hasText: "Cultura" }),
  ).toHaveCount(0);

  // and the resistant drug in use never reaches the screen
  await expect(page.locator(".culture-tab-alert")).toHaveCount(0);
  expect(mockApi.requests.filter((r) => r.path === CULTURES_PATH)).toHaveLength(
    0,
  );
});

test("without the feature the alerts card has no culture cell", async ({
  page,
  mockApi,
}) => {
  await loginWithFeatures(page, mockApi, []);

  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWithCultureData(),
  });

  await page.goto("/prescricao/199");

  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();

  // a bare zero in the alerts card would announce a feature the client does
  // not have, so the cell is not rendered at all
  await expect(page.locator(".alert-culture")).toHaveCount(0);
});

test("with the feature the tab and the alert cell come back", async ({
  page,
  mockApi,
}) => {
  await loginWithFeatures(page, mockApi, ["CULTURE"]);

  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWithCultureData(),
  });
  mockApi.override("GET /prescriptions/:id/cultures", {
    json: { status: "success", data: [] },
  });

  await page.goto("/prescricao/199");

  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();

  // antd Segmented keeps the radio input hidden behind its label
  await expect(
    page.locator(".ant-segmented-item-label", { hasText: "Cultura" }),
  ).toBeVisible();
  await expect(page.locator(".alert-culture")).toHaveCount(1);
});

/**
 * The alert-type pickers read one list (models/DrugAlertTypeEnum), so an alert
 * the schema can never raise must not be offered anywhere it is used — the
 * prioritization filter below, and equally the prescription drug filter, the
 * intervention texts and the substance handling.
 */

const searchAlertTypes = async (page: Page, mockApi: MockApi, term: string) => {
  mockApi.override("GET /segments/departments", {
    json: { status: "success", data: [] },
  });

  await page.goto("/priorizacao/pacientes/cards");
  await page.getByRole("button", { name: /Ver mais/ }).click();
  // the panel expands through a CSS max-height animation, so the field keeps
  // moving until it settles
  await page.waitForTimeout(800);

  // antd 6 renders the Select placeholder as bare text under the input, so the
  // field is reached through the select itself
  await page
    .locator(".ant-select", {
      has: page.locator(".ant-select-placeholder", {
        hasText: "Selecione os alertas",
      }),
    })
    .click();

  // the list is virtualized, so it is searched instead of scrolled
  await page.keyboard.type(term);

  return page
    .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
    .locator(".ant-select-item-option");
};

test("without the feature the alert types exclude the culture ones", async ({
  page,
  mockApi,
}) => {
  await loginWithFeatures(page, mockApi, []);

  const options = await searchAlertTypes(page, mockApi, "Cultura");

  await expect(options).toHaveCount(0);
});

test("with the feature the culture alert types are offered", async ({
  page,
  mockApi,
}) => {
  await loginWithFeatures(page, mockApi, ["CULTURE"]);

  const options = await searchAlertTypes(page, mockApi, "Cultura");

  await expect(options).toHaveText([
    "Cultura com resistência ao medicamento",
    "Cultura com resistência na mesma classe",
  ]);
});
