import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";

/**
 * Validation behavior of the intervention form
 * (src/components/Forms/Intervention/index.jsx).
 *
 * Freezes the yup conditional rules so the yup 0.32 -> 1.x upgrade can be
 * verified against them:
 *   - idInterventionReason: required, at least one
 *   - interactions: required only when a selected reason has
 *     relationType HAS_REQUIRED_RELATION (.when("idInterventionReason"))
 */

const reason = (id: number, name: string, relationType: number) => ({
  id,
  name,
  parentName: null,
  parenName: null,
  relationType,
  suspension: false,
  substitution: false,
  customEconomy: false,
  ram: false,
  blocking: false,
});

const reasonsFixture = {
  status: "success",
  data: [
    reason(1, "Ajuste de Dose", 0),
    reason(2, "Interação Medicamentosa", 2),
  ],
};

const putInterventionCalls = (mockApi: MockApi) =>
  mockApi.requests.filter(
    (r) => r.method === "PUT" && r.path === "/intervention",
  );

async function openInterventionModal(page: Page) {
  await page.goto("/prescricao/199");
  await expect(page.getByText("Dipirona 500mg")).toBeVisible();

  await page.locator(".gtm-bt-interv").first().click();
  await expect(page.locator(".ant-modal")).toBeVisible();

  // reasons finished loading
  await page
    .locator(".ant-select.ant-select-loading")
    .waitFor({ state: "detached" });
}

test.beforeEach(({ mockApi }) => {
  mockApi.override("GET /intervention/reasons", { json: reasonsFixture });
  mockApi.override("PUT /intervention", {
    json: { status: "success", data: [] },
  });
});

test("intervention requires at least one reason", async ({
  page,
  mockApi,
}) => {
  await openInterventionModal(page);

  // submit with no reason selected: blocked by validation
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(
    page.locator(".ant-modal").getByText("Campo obrigatório"),
  ).toBeVisible();
  expect(putInterventionCalls(mockApi)).toHaveLength(0);

  // pick a reason without required relations and save
  await page.locator("#reason").click();
  await page.getByRole("option", { name: "Ajuste de Dose" }).click();
  await page.locator("#reason").click(); // close dropdown

  await expect(
    page.locator(".ant-modal").getByText("Campo obrigatório"),
  ).toBeHidden();

  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(
    page.getByText("Uhu! Intervenção salva com sucesso! :)"),
  ).toBeVisible();

  const calls = putInterventionCalls(mockApi);
  expect(calls).toHaveLength(1);
  expect(JSON.parse(calls[0].postData!)).toMatchObject({
    idInterventionReason: [1],
    status: "s",
  });
});

test("interactions become required when the reason has a required relation", async ({
  page,
  mockApi,
}) => {
  await openInterventionModal(page);

  // reason with relationType = HAS_REQUIRED_RELATION shows the relations field
  await page.locator("#reason").click();
  await page.getByRole("option", { name: "Interação Medicamentosa" }).click();
  await page.locator("#reason").click(); // close dropdown

  await expect(
    page.locator(".ant-modal").getByText("Relações:"),
  ).toBeVisible();

  // submit without relations: blocked by the conditional rule
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(
    page.locator(".ant-modal").getByText("Campo obrigatório"),
  ).toBeVisible();
  expect(putInterventionCalls(mockApi)).toHaveLength(0);

  // pick a related drug (options come from the prescription drug list)
  await page.locator("#interactions").click();
  await page.getByRole("option", { name: "Omeprazol 20mg" }).click();
  await page.locator("#interactions").click(); // close dropdown

  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await expect(
    page.getByText("Uhu! Intervenção salva com sucesso! :)"),
  ).toBeVisible();

  const calls = putInterventionCalls(mockApi);
  expect(calls).toHaveLength(1);
  expect(JSON.parse(calls[0].postData!)).toMatchObject({
    idInterventionReason: [2],
    interactions: [11],
  });
});
