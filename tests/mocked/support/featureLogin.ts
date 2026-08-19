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
  return loginWithAuth(page, mockApi, { features });
}

/**
 * Same as loginWithFeatures, but customizes the permission list
 * (user.account.permissions, read by services/PermissionService.js).
 */
export async function loginWithPermissions(
  page: Page,
  mockApi: MockApi,
  permissions: string[],
) {
  return loginWithAuth(page, mockApi, { permissions });
}

/**
 * Logs in with arbitrary overrides merged into the /authenticate payload, for
 * fields that are neither features nor permissions (onboardingStatus, training,
 * ...). Combine them freely in a single call; an `undefined` value omits the key
 * entirely, since the payload is serialized with JSON.stringify.
 */
export async function loginWithAuth(
  page: Page,
  mockApi: MockApi,
  overrides: Record<string, unknown>,
) {
  const auth = loadFixture<Record<string, unknown>>("auth/authenticate.json");
  mockApi.override("POST /authenticate", { json: { ...auth, ...overrides } });

  await page.goto("/login");
  await page.getByPlaceholder("Email").fill("e2e@noharm.ai");
  await page.getByPlaceholder("Senha").fill("mocked-password");
  await page.getByRole("button", { name: "Acessar" }).click();

  // the landing page differs per feature set, so wait for the logged-in
  // header instead of a specific heading
  await expect(page.getByText("E2E Test")).toBeVisible({ timeout: 15000 });

  // give redux-persist a beat to flush user.account before navigating
  // (same as auth.setup.ts), or features are lost on the next page load
  await page.waitForTimeout(1000);
}
