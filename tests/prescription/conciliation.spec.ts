import { test, expect } from "@playwright/test";

test("show conciliation", async ({ page }) => {
  await page.goto("/conciliacao/9199");

  await expect(
    page.getByRole("heading", { name: "Conciliação n°" })
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "Medicamento do paciente" })
  ).toBeVisible();
});
