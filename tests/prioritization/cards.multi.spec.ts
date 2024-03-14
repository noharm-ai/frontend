import { test, expect } from "@playwright/test";

test("click first patient", async ({ page }) => {
  await page.goto("/priorizacao/pacientes/cards");

  await page.getByRole("main").getByRole("button", { name: "search" }).click();

  const page1Promise = page.waitForEvent("popup");
  await page.getByText("Atendimento9999").click();
  const page1 = await page1Promise;

  await expect(page1.getByText("Paciente 99")).toBeVisible();
});
