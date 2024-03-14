import { test as setup, expect } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("login", async ({ page }) => {
  await page.goto("/login");

  await page.getByPlaceholder("Email").click();
  await page.getByPlaceholder("Email").fill(process.env.TEST_USER!);
  await page.getByPlaceholder("Senha").click();
  await page.getByPlaceholder("Senha").fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole("button", { name: "Acessar" }).click();
  await expect(page.getByText("E2E Test")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Priorização por Pacientes" })
  ).toBeVisible();

  await page.waitForTimeout(3000);

  await page.context().storageState({ path: authFile });
});
