import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

import { MockApi } from "./mockApi";
import { loadFixture } from "./defaultHandlers";

/**
 * Logs in through the real login UI with a customized feature-flag list
 * (user.account.features is populated from the /authenticate response).
 *
 * The shared storage state produced by auth.setup.ts has features: [], so
 * tests that need a flag must start from a clean state:
 *
 *   test.use({ storageState: { cookies: [], origins: [] } });
 *   test("...", async ({ page, mockApi }) => {
 *     await loginWithFeatures(page, mockApi, ["PRIMARYCARE"]);
 *     ...
 *   });
 */
export async function loginWithFeatures(
  page: Page,
  mockApi: MockApi,
  features: string[],
) {
  const auth = loadFixture<Record<string, unknown>>("auth/authenticate.json");
  mockApi.override("POST /authenticate", { json: { ...auth, features } });

  await page.goto("/login");
  await page.getByPlaceholder("Email").fill("e2e@noharm.ai");
  await page.getByPlaceholder("Senha").fill("mocked-password");
  await page.getByRole("button", { name: "Acessar" }).click();

  await expect(
    page.getByRole("heading", { name: "Priorização por Pacientes" }),
  ).toBeVisible({ timeout: 15000 });
}
