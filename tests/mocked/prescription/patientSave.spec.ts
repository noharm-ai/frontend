import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";

/**
 * Patient data modal on the prescription screen (float menu > user icon):
 * saving posts to /patient/:admissionNumber and notifies the outcome.
 */

async function openPatientForm(page: Page) {
  await page.goto("/prescricao/199");
  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible({ timeout: 15000 });

  await page.getByRole("button", { name: /menu/i }).last().click();
  await page
    .locator(".ant-float-btn")
    .filter({ has: page.locator(".anticon-user") })
    .click();

  const modal = page.locator(".ant-modal");
  await expect(
    modal.getByRole("heading", { name: "Dados do paciente" }),
  ).toBeVisible();
  return modal;
}

test("saves patient data", async ({ page, mockApi }) => {
  mockApi.override("POST /patient/:admissionNumber", {
    json: { status: "success", data: {} },
  });

  const modal = await openPatientForm(page);
  await modal.getByRole("button", { name: "Salvar" }).click();

  await expect(
    page.getByText("Uhu! Dados do paciente salvo com sucesso! :)"),
  ).toBeVisible();

  const calls = mockApi.requests.filter((r) => r.path === "/patient/9999");
  expect(calls).toHaveLength(1);
  expect(JSON.parse(calls[0].postData!)).toMatchObject({ weight: 70 });
});

test("shows an error when saving fails", async ({ page, mockApi }) => {
  mockApi.override("POST /patient/:admissionNumber", {
    status: 400,
    json: { status: "error", message: "Falha ao salvar" },
  });

  const modal = await openPatientForm(page);
  await modal.getByRole("button", { name: "Salvar" }).click();

  await expect(page.locator(".ant-notification-notice-error")).toBeVisible();
  // the modal stays open so the user can retry
  await expect(modal.getByRole("button", { name: "Salvar" })).toBeEnabled();
});
