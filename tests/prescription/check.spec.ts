import { test, expect } from "@playwright/test";

test("check prescription and rollback", async ({ page }) => {
  await page.goto("/prescricao/199");

  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" })
  ).toBeVisible();
  await expect(page.getByText("Paciente 99")).toBeVisible();

  // check
  await page.getByRole("button", { name: "check Checar" }).click();
  await expect(page.getByText("Checada porE2E Test")).toBeVisible();

  // rollback
  await page.getByRole("button", { name: "rollback" }).click();

  await expect(
    page.getByRole("button", { name: "check Checar" })
  ).toBeVisible();
});
