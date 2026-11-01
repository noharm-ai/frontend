import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";

/**
 * Integration utilities (/admin/integracao, features/admin/Integration): two
 * process cards, each guarded by a confirmation dialog. The dialog is the only
 * barrier before a heavy backend job, so declining must not call the API and
 * confirming must call exactly one endpoint, then report success or the
 * server's error.
 */

const PERMISSIONS = ["READ_BASIC_FEATURES", "READ_PRESCRIPTION"];

const REFRESH = "/admin/integration/refresh-prescription";
const SECURITY_GROUP = "/admin/integration/update-user-security-group";

const card = (page: Page, title: string) =>
  page.locator(".ant-card").filter({ hasText: title }).last();

const execute = (page: Page, title: string) =>
  card(page, title).getByRole("button").first().click();

const confirmDialog = (page: Page) =>
  page.getByRole("dialog").filter({ hasText: "Confirma a ação?" });

const calls = (mockApi: { requests: { path: string }[] }, path: string) =>
  mockApi.requests.filter((r) => r.path === path);

test.use({ storageState: { cookies: [], origins: [] } });

test.beforeEach(async ({ page, mockApi }) => {
  mockApi.override(`POST ${REFRESH}`, { json: { status: "success" } });
  mockApi.override(`POST ${SECURITY_GROUP}`, { json: { status: "success" } });
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await page.goto("/admin/integracao");
  await expect(
    page.getByRole("heading", { name: "Integração", exact: true }),
  ).toBeVisible();
});

test("lists both integration processes", async ({ page }) => {
  await expect(card(page, "Recalcular prescricao e presmed")).toBeVisible();
  await expect(card(page, "Meu IP")).toBeVisible();
});

test("cancelling the confirmation does not call the API", async ({
  page,
  mockApi,
}) => {
  await execute(page, "Recalcular prescricao e presmed");

  const dialog = confirmDialog(page);
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByText("Recalcular prescricao e presmed."),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Cancelar" }).click();
  await expect(dialog).toBeHidden();

  expect(calls(mockApi, REFRESH)).toHaveLength(0);
  expect(calls(mockApi, SECURITY_GROUP)).toHaveLength(0);
});

test("confirming the recalculation posts once and reports success", async ({
  page,
  mockApi,
}) => {
  await execute(page, "Recalcular prescricao e presmed");
  await confirmDialog(page).getByRole("button", { name: "Confirmar" }).click();

  await expect(page.getByText("Finalizado com sucesso!")).toBeVisible();
  expect(calls(mockApi, REFRESH)).toHaveLength(1);
  expect(calls(mockApi, SECURITY_GROUP)).toHaveLength(0);
});

test("confirming 'Meu IP' calls only the security group endpoint", async ({
  page,
  mockApi,
}) => {
  await execute(page, "Meu IP");
  await confirmDialog(page).getByRole("button", { name: "Confirmar" }).click();

  await expect(page.getByText("Finalizado com sucesso!")).toBeVisible();
  expect(calls(mockApi, SECURITY_GROUP)).toHaveLength(1);
  expect(calls(mockApi, REFRESH)).toHaveLength(0);
});

test("shows the server error message when the recalculation fails", async ({
  page,
  mockApi,
}) => {
  mockApi.override(`POST ${REFRESH}`, {
    status: 500,
    json: { status: "error", message: "Falha ao recalcular", code: "x" },
  });

  await execute(page, "Recalcular prescricao e presmed");
  await confirmDialog(page).getByRole("button", { name: "Confirmar" }).click();

  await expect(page.getByText("Falha ao recalcular")).toBeVisible();
  await expect(page.getByText("Finalizado com sucesso!")).toHaveCount(0);
  expect(calls(mockApi, REFRESH)).toHaveLength(1);
});
