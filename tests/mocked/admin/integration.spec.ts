import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";

/**
 * Integration admin page (/admin/integracao): both utilities ask for
 * confirmation first, call their endpoint once confirmed and report the
 * outcome in a notification.
 */

const REFRESH = "/admin/integration/refresh-prescription";
const SECURITY_GROUP = "/admin/integration/update-user-security-group";

const runAction = async (page: Page, cardTitle: string) => {
  await page
    .locator(".ant-card")
    .filter({ hasText: cardTitle })
    .getByRole("button")
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  return dialog;
};

test.beforeEach(async ({ page }) => {
  await page.goto("/admin/integracao");
  await expect(page.getByRole("heading", { name: "Integração" })).toBeVisible();
});

test("cancelling the confirmation does not call the API", async ({
  page,
  mockApi,
}) => {
  const dialog = await runAction(page, "Recalcular prescricao e presmed");
  await expect(dialog.locator(".ant-modal-confirm-title")).toHaveText(
    "Confirma a ação?",
  );

  await dialog.getByRole("button", { name: "Cancelar" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  expect(mockApi.requests.filter((r) => r.path === REFRESH)).toHaveLength(0);
});

test("recalculating prescriptions calls the endpoint and reports success", async ({
  page,
  mockApi,
}) => {
  mockApi.override(`POST ${REFRESH}`, {
    json: { status: "success", data: null },
  });

  const dialog = await runAction(page, "Recalcular prescricao e presmed");
  await dialog.getByRole("button", { name: "Confirmar" }).click();

  await expect(page.getByText("Finalizado com sucesso!")).toBeVisible();
  expect(mockApi.requests.filter((r) => r.path === REFRESH)).toHaveLength(1);
  expect(
    mockApi.requests.filter((r) => r.path === SECURITY_GROUP),
  ).toHaveLength(0);
});

test("a failing recalculation shows the server message and no success", async ({
  page,
  mockApi,
}) => {
  mockApi.override(`POST ${REFRESH}`, {
    status: 500,
    json: { status: "error", message: "Falha ao recalcular", code: "x" },
  });

  const dialog = await runAction(page, "Recalcular prescricao e presmed");
  await dialog.getByRole("button", { name: "Confirmar" }).click();

  await expect(page.getByText("Falha ao recalcular")).toBeVisible();
  await expect(page.getByText("Finalizado com sucesso!")).toHaveCount(0);
  expect(mockApi.requests.filter((r) => r.path === REFRESH)).toHaveLength(1);
});

test("updating my IP calls the security group endpoint and reports success", async ({
  page,
  mockApi,
}) => {
  mockApi.override(`POST ${SECURITY_GROUP}`, {
    json: { status: "success", data: null },
  });

  const dialog = await runAction(page, "Meu IP");
  await expect(
    dialog.getByText("Atualizar o meu ip nos security groups"),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Confirmar" }).click();

  await expect(page.getByText("Finalizado com sucesso!")).toBeVisible();
  expect(
    mockApi.requests.filter((r) => r.path === SECURITY_GROUP),
  ).toHaveLength(1);
  expect(mockApi.requests.filter((r) => r.path === REFRESH)).toHaveLength(0);
});

test("a failing IP update shows the server message", async ({
  page,
  mockApi,
}) => {
  mockApi.override(`POST ${SECURITY_GROUP}`, {
    status: 500,
    json: { status: "error", message: "Falha no security group", code: "x" },
  });

  const dialog = await runAction(page, "Meu IP");
  await dialog.getByRole("button", { name: "Confirmar" }).click();

  await expect(page.getByText("Falha no security group")).toBeVisible();
  await expect(page.getByText("Finalizado com sucesso!")).toHaveCount(0);
});
