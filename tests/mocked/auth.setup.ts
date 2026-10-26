import { test as setup, expect } from "./support/mockApi";
import { loadFixture } from "./support/defaultHandlers";
import { waitForPersistedLogin } from "./support/featureLogin";

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

  await waitForPersistedLogin(page, loadFixture("auth/authenticate.json"));

  await page.context().storageState({ path: authFile });
});
