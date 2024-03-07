import { test, expect } from "@playwright/test";

test("fast search by admission number", async ({ page }) => {
  await page.goto("/priorizacao/pacientes/cards");

  await page.getByPlaceholder("Buscar por nº de atendimento").click();
  await page.getByPlaceholder("Buscar por nº de atendimento").fill("18154101");
  await page
    .getByRole("banner")
    .getByRole("button", { name: "search" })
    .click();
  const page1Promise = page.waitForEvent("popup");
  await page.getByText("Atendimento 18154101 - 30/08/").click();
  const page1 = await page1Promise;
  await expect(page1.getByRole("button", { name: "18154101" })).toBeVisible();
});
