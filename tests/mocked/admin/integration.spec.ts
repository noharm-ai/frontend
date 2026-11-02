import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";

/**
 * Admin integration utilities (/admin/integracao, features/admin/Integration).
 *
 * Two cards trigger one-shot backend jobs. Each asks for a confirmation
 * first, so cancelling must never reach the backend, and a failure must show
 * the backend message instead of the success toast.
 */

const REFRESH = "POST /admin/integration/refresh-prescription";
const SECURITY_GROUP = "POST /admin/integration/update-user-security-group";

const card = (page: Page, title: string) =>
  page.locator(".ant-card").filter({
    has: page.locator(".ant-card-meta-title", { hasText: title }),
  });

const calls = (mockApi: MockApi, path: string) =>
  mockApi.requests.filter((r) => r.method === "POST" && r.path === path);

const confirmDialog = (page: Page) =>
  page.getByRole("dialog").filter({ hasText: "Confirma a ação?" });

test.beforeEach(async ({ mockApi }) => {
  mockApi.override(REFRESH, { json: { status: "success", data: 1 } });
  mockApi.override(SECURITY_GROUP, { json: { status: "success", data: 1 } });
});

test("lists the two integration utilities without calling the backend", async ({
  page,
  mockApi,
}) => {
  await page.goto("/admin/integracao");

  await expect(
    page.getByRole("heading", { name: "Integração", exact: true }),
  ).toBeVisible();
  await expect(card(page, "Recalcular prescricao e presmed")).toBeVisible();
  await expect(card(page, "Meu IP")).toBeVisible();

  expect(
    calls(mockApi, "/admin/integration/refresh-prescription"),
  ).toHaveLength(0);
  expect(
    calls(mockApi, "/admin/integration/update-user-security-group"),
  ).toHaveLength(0);
});

test("does not call the backend when the confirmation is cancelled", async ({
  page,
  mockApi,
}) => {
  await page.goto("/admin/integracao");

  await card(page, "Recalcular prescricao e presmed")
    .getByRole("button")
    .click();
  await expect(confirmDialog(page)).toBeVisible();
  await expect(confirmDialog(page)).toContainText(
    "Recalcular prescricao e presmed. Atenção",
  );
  await confirmDialog(page).getByRole("button", { name: "Cancelar" }).click();

  await expect(confirmDialog(page)).toBeHidden();
  expect(
    calls(mockApi, "/admin/integration/refresh-prescription"),
  ).toHaveLength(0);
});

test("recalculates the prescriptions after confirming and shows the success toast", async ({
  page,
  mockApi,
}) => {
  await page.goto("/admin/integracao");

  await card(page, "Recalcular prescricao e presmed")
    .getByRole("button")
    .click();
  await confirmDialog(page).getByRole("button", { name: "Confirmar" }).click();

  await expect(page.getByText("Finalizado com sucesso!")).toBeVisible();
  expect(
    calls(mockApi, "/admin/integration/refresh-prescription"),
  ).toHaveLength(1);
  // the other utility is left alone
  expect(
    calls(mockApi, "/admin/integration/update-user-security-group"),
  ).toHaveLength(0);
});

test("updates the user IP in the security groups after confirming", async ({
  page,
  mockApi,
}) => {
  await page.goto("/admin/integracao");

  await card(page, "Meu IP").getByRole("button").click();
  await expect(confirmDialog(page)).toContainText(
    "Atualizar o meu ip nos security groups",
  );
  await confirmDialog(page).getByRole("button", { name: "Confirmar" }).click();

  await expect(page.getByText("Finalizado com sucesso!")).toBeVisible();
  expect(
    calls(mockApi, "/admin/integration/update-user-security-group"),
  ).toHaveLength(1);
  expect(
    calls(mockApi, "/admin/integration/refresh-prescription"),
  ).toHaveLength(0);
});

test("shows the backend message and no success toast when the job fails", async ({
  page,
  mockApi,
}) => {
  mockApi.override(SECURITY_GROUP, {
    status: 400,
    json: { status: "error", message: "Usuário sem permissão" },
  });

  await page.goto("/admin/integracao");

  await card(page, "Meu IP").getByRole("button").click();
  await confirmDialog(page).getByRole("button", { name: "Confirmar" }).click();

  await expect(page.getByText("Usuário sem permissão")).toBeVisible();
  await expect(page.getByText("Finalizado com sucesso!")).toHaveCount(0);
  expect(
    calls(mockApi, "/admin/integration/update-user-security-group"),
  ).toHaveLength(1);
});
