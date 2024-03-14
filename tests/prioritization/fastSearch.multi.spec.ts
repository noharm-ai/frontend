import { test, expect } from "@playwright/test";

test("fast search by prescription number", async ({ page }) => {
  await page.goto("/priorizacao/pacientes/cards");

  await page.getByPlaceholder("Buscar por nº de atendimento").click();
  await page.getByPlaceholder("Buscar por nº de atendimento").fill("199");
  await page
    .getByRole("banner")
    .getByRole("button", { name: "search" })
    .click();
  await expect(page.getByText("Prescrição 199")).toBeVisible();
  const page1Promise = page.waitForEvent("popup");
  await page.getByText("Prescrição 199").click();
  const page1 = await page1Promise;
  await expect(page1.getByRole("button", { name: "199" })).toBeVisible();
});

test("fast search by admission number", async ({ page }) => {
  await page.goto("/priorizacao/pacientes/cards");

  await page.getByPlaceholder("Buscar por nº de atendimento").click();
  await page.getByPlaceholder("Buscar por nº de atendimento").fill("9999");
  await page
    .getByRole("banner")
    .getByRole("button", { name: "search" })
    .click();
  await expect(page.getByText("Atendimento 9999").first()).toBeVisible();
  const page1Promise = page.waitForEvent("popup");
  await page.getByText("Atendimento 9999").first().click();
  const page1 = await page1Promise;
  await expect(page1.getByRole("button", { name: "9999" })).toBeVisible();
});
