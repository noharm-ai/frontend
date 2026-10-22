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
  readyText?: string,
) {
  return loginWithAuth(page, mockApi, { features }, readyText);
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
 *
 * `readyText` is the text that proves the logged-in header rendered; override it
 * when the chosen payload changes what that header shows (HIDE_NAMES, for one,
 * replaces the user name with asterisks).
 */
export async function loginWithAuth(
  page: Page,
  mockApi: MockApi,
  overrides: Record<string, unknown>,
  readyText = "E2E Test",
) {
  const auth = loadFixture<Record<string, unknown>>("auth/authenticate.json");
  const payload = { ...auth, ...overrides };
  mockApi.override("POST /authenticate", { json: payload });

  await page.goto("/login");
  await page.getByPlaceholder("Email").fill("e2e@noharm.ai");
  await page.getByPlaceholder("Senha").fill("mocked-password");
  await page.getByRole("button", { name: "Acessar" }).click();

  // the landing page differs per feature set, so wait for the logged-in
  // header instead of a specific heading
  await expect(page.getByText(readyText).first()).toBeVisible({
    timeout: 15000,
  });

  await waitForPersistedLogin(page, payload);
}

/**
 * Waits until redux-persist has written the session `payload` logged in with.
 *
 * Login dispatches the user, its segments and the app config into slices that
 * persist themselves on the following ticks, after the header has already
 * rendered. A navigation before those writes land boots the app from the
 * storage as it was, and the features or permissions of this login are lost.
 */
export async function waitForPersistedLogin(
  page: Page,
  payload: Record<string, unknown>,
) {
  const list = (value: unknown) => (Array.isArray(value) ? value : []);
  const expected = {
    features: JSON.stringify([
      ...list(payload.features),
      ...list(payload.userFeatures),
    ]),
    permissions: JSON.stringify(list(payload.permissions)),
    segments: JSON.stringify(payload.segments),
    apiKey: payload.apiKey,
  };

  await page.waitForFunction((expected) => {
    // redux-persist stores each slice key as its own JSON string
    const read = (key: string): Record<string, any> | undefined => {
      const raw = localStorage.getItem(`persist:${key}`);
      if (!raw) {
        return undefined;
      }
      return Object.fromEntries(
        Object.entries(JSON.parse(raw)).map(([k, v]) => [
          k,
          JSON.parse(v as string),
        ]),
      );
    };
    const user = read("user");
    const app = read("app");
    const segments = read("segments");

    return (
      user?.isLogged === true &&
      JSON.stringify(user.account?.features) === expected.features &&
      JSON.stringify(user.account?.permissions) === expected.permissions &&
      JSON.stringify(segments?.list) === expected.segments &&
      app?.config?.apiKey === expected.apiKey
    );
  }, expected);
}
