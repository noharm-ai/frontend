import { test as setup, expect } from "./support/mockApi";

const authFile = "playwright/.auth/mock-user.json";

/**
 * Logs in through the real login UI against the mocked /authenticate
 * endpoint. This produces the exact localStorage layout the app expects
 * (split ac1/ac2 token + redux-persist state) without hand-crafting it.
 */
setup("mocked login", async ({ page }) => {
  await page.goto("/login");

  await page.getByPlaceholder("Email").fill("e2e@noharm.ai");
  await page.getByPlaceholder("Senha").fill("mocked-password");
  await page.getByRole("button", { name: "Acessar" }).click();

  await expect(page.getByText("E2E Test")).toBeVisible({ timeout: 15000 });
  await expect(
    page.getByRole("heading", { name: "Priorização por Pacientes" }),
  ).toBeVisible({ timeout: 15000 });

  // give redux-persist a beat to flush the rehydrated state
  await page.waitForTimeout(1000);

  await page.context().storageState({ path: authFile });
});
