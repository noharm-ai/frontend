import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";

/**
 * Protocol alerts on the prioritization card.
 *
 * The list has no prescription loaded: it receives the protocol summary of
 * Prescription.features (services/prioritization_service) and shows how many
 * protocols it holds.
 */

type ListFixture = {
  data: Record<string, unknown>[];
};

const listWith = (row: Record<string, unknown>) => {
  const fixture = loadFixture<ListFixture>("prescriptions/list.json");

  fixture.data = fixture.data.map((item) => ({ ...item, ...row }));

  return fixture;
};

const protocolChip = (page: Page) =>
  page.locator(".alert", { has: page.locator(".anticon-file-protect") });

test("the card counts the active protocols", async ({ page, mockApi }) => {
  mockApi.override("GET /prescriptions", {
    json: listWith({ protocolAlerts: [77, 78] }),
  });

  await page.goto("/priorizacao/pacientes/cards");
  await page.getByRole("main").getByRole("button", { name: "search" }).click();

  await expect(page.getByText("Paciente 99")).toBeVisible();

  const chip = protocolChip(page);
  await expect(chip).toHaveCount(1);
  await expect(chip).toContainText("2");
});

test("the card hides the chip without an active protocol", async ({ page }) => {
  // the default fixture has no protocolAlerts at all, like a prescription
  // processed before the field existed
  await page.goto("/priorizacao/pacientes/cards");
  await page.getByRole("main").getByRole("button", { name: "search" }).click();

  await expect(page.getByText("Paciente 99")).toBeVisible();

  await expect(protocolChip(page)).toHaveCount(0);
});
