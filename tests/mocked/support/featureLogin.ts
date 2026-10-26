import { expect } from "@playwright/test";
import type { Page, Request } from "@playwright/test";

import { API_URL, MockApi } from "./mockApi";
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
  const pending = pendingApiRequests(page);

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
  navigateInApp(page, pending);
}

/** The API requests the page has in flight, from now on */
function pendingApiRequests(page: Page) {
  const pending = new Set<Request>();
  page.on("request", (request) => {
    if (request.url().startsWith(API_URL)) {
      pending.add(request);
    }
  });
  page.on("requestfinished", (request) => pending.delete(request));
  page.on("requestfailed", (request) => pending.delete(request));
  return pending;
}

/**
 * Makes the page.goto(path) calls that follow a login navigate inside the
 * running app (pushState + popstate, as a click on a link would) instead of
 * loading it again: booting the app costs ~1s of CPU per load, and the login
 * already paid it once. The session is the same either way, since the
 * navigation runs on the very store the login filled.
 *
 * A goto still loads the document when the test asked for something that only
 * applies at load time (page.addInitScript, page.clock.install) or leaves the
 * app (a full URL). page.reload() is untouched.
 */
function navigateInApp(page: Page, pending: Set<Request>) {
  // an init script or a fake clock only applies to a document loaded after it
  let reload = false;
  const addInitScript = page.addInitScript.bind(page);
  page.addInitScript = ((...args: Parameters<Page["addInitScript"]>) => {
    reload = true;
    return addInitScript(...args);
  }) as Page["addInitScript"];
  const installClock = page.clock.install.bind(page.clock);
  page.clock.install = (...args: Parameters<Page["clock"]["install"]>) => {
    reload = true;
    return installClock(...args);
  };

  // A load cancels what the current page still has in flight; navigating
  // inside the app lets it finish, and land in the next page's
  // mockApi.requests (the landing page's name lookup, for one). Let the API
  // settle first, for up to 2s: a request still pending by then (a handler
  // that never answers) is one a load would have cut short, so go anyway.
  const settle = async () => {
    const deadline = Date.now() + 2000;
    for (
      let quiet = 0;
      quiet < 2 && Date.now() < deadline;
      quiet = pending.size ? 0 : quiet + 1
    ) {
      await page.waitForTimeout(50);
    }
  };

  const goto = page.goto.bind(page);
  page.goto = (async (url: string, options?: Parameters<Page["goto"]>[1]) => {
    if (reload || !url.startsWith("/")) {
      reload = false;
      return goto(url, options);
    }
    await settle();
    await page.evaluate((path) => {
      const go = (to: string) => {
        window.history.pushState({}, "", to);
        window.dispatchEvent(new PopStateEvent("popstate"));
      };
      // the same route again would not remount the page
      if (window.location.pathname + window.location.search === path) {
        go("/");
      }
      go(path);
    }, url);
    return null;
  }) as Page["goto"];
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
