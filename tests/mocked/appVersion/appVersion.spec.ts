import { test, expect } from "../support/mockApi";
import type { Page, Route } from "@playwright/test";
import type { MockApi } from "../support/mockApi";
import { fakeJwt } from "../support/token";
import { loadFixture } from "../support/defaultHandlers";

/**
 * Keeping long-lived tabs on the deployed version (src/features/appVersion).
 *
 * Every build stamps an id into index.html (`<meta name="app-build">`). The app
 * fetches /index.html?build-check=... (always on the login page; after an
 * access token refresh, at most once an hour) and, when the id differs from
 * the running one, reloads at a safe moment: right away on an untouched login
 * page, otherwise on the next screen change.
 *
 * The dev server always answers with the running build, so these tests answer
 * the check themselves to simulate a deploy.
 */

const isBuildCheck = (url: URL) =>
  url.pathname === "/index.html" && url.searchParams.has("build-check");

const deployedPage = (build: string) =>
  `<!DOCTYPE html><html><head><meta name="app-build" content="${build}" /></head><body></body></html>`;

/**
 * Answers the build check with `deployed.build` (change it mid-test to
 * simulate a deploy); `deployed.checks` counts the checks made
 */
async function serveDeployedBuild(page: Page, build: string) {
  const deployed = { build, checks: 0 };
  await page.route(isBuildCheck, (route) => {
    deployed.checks += 1;
    return route.fulfill({
      contentType: "text/html",
      body: deployedPage(deployed.build),
    });
  });
  return deployed;
}

/** Counts full page loads (each boot of the app) */
function countPageLoads(page: Page) {
  const loads = { count: 0 };
  page.on("request", (request) => {
    if (
      request.resourceType() === "document" &&
      request.frame() === page.mainFrame()
    ) {
      loads.count += 1;
    }
  });
  return loads;
}

/** The build the server deploys now, i.e. the one the app will run */
async function servedBuild(page: Page) {
  const html = await (await page.request.get("/index.html")).text();
  return html.match(/<meta name="app-build" content="([^"]*)"/)![1];
}

async function login(page: Page) {
  await page.getByPlaceholder("Email").fill("fulano@example.com");
  await page.getByPlaceholder("Senha").fill("mocked-password");
  await page.getByRole("button", { name: "Acessar" }).click();
  await expect(page.getByText("E2E Test").first()).toBeVisible({
    timeout: 15000,
  });
}

/** In-app navigation, as a click on a menu link does (no page load) */
async function navigateInApp(page: Page, path: string) {
  await page.evaluate((to) => {
    window.history.pushState({}, "", to);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, path);
}

const updateNotice = (page: Page) => page.getByText("Nova versão disponível");

test.describe("login page", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("loads the deployed version before the user logs in, only once", async ({
    page,
  }) => {
    const deployed = await serveDeployedBuild(page, "newer-build");
    const loads = countPageLoads(page);

    await page.goto("/login");

    // the first boot finds the newer build and reloads; the second one still
    // gets the old page (as a stale cache would serve it) and must not loop
    await expect.poll(() => deployed.checks, { timeout: 15000 }).toBe(2);
    expect(loads.count).toBe(2);

    await login(page);
    await expect(
      page.getByRole("heading", { name: "Priorização por Pacientes" }),
    ).toBeVisible();
    expect(loads.count).toBe(2);
    await expect(updateNotice(page)).toHaveCount(0);
  });

  test("once the user started typing, reloads after the login instead", async ({
    page,
  }) => {
    // hold the check until the credentials are typed
    let answerCheck: () => void = () => {};
    const typed = new Promise<void>((resolve) => (answerCheck = resolve));
    await page.route(isBuildCheck, async (route: Route) => {
      await typed;
      await route.fulfill({
        contentType: "text/html",
        body: deployedPage("newer-build"),
      });
    });
    const loads = countPageLoads(page);

    await page.goto("/login");
    await page.getByPlaceholder("Email").fill("fulano@example.com");
    answerCheck();

    await expect(updateNotice(page)).toBeVisible();
    expect(loads.count).toBe(1);

    await login(page);

    // the navigation that follows the login loads the app again, and the
    // session survives it
    await expect.poll(() => loads.count, { timeout: 15000 }).toBe(2);
    await expect(
      page.getByRole("heading", { name: "Priorização por Pacientes" }),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("E2E Test").first()).toBeVisible();
    await expect(updateNotice(page)).toHaveCount(0);
  });
});

test.describe("logged in", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  /** Logs in with an access token that expires in 30 minutes */
  async function loginWithShortToken(page: Page, mockApi: MockApi) {
    const auth = loadFixture<Record<string, unknown>>("auth/authenticate.json");
    auth.access_token = fakeJwt(Date.now() / 1000 + 30 * 60);
    mockApi.override("POST /authenticate", { json: auth });

    await page.goto("/login");
    await login(page);
    await expect(
      page.getByRole("heading", { name: "Priorização por Pacientes" }),
    ).toBeVisible({ timeout: 15000 });
  }

  /** Next /refresh-token answers a token expiring `seconds` from now */
  const refreshInto = (mockApi: MockApi, seconds: number) =>
    mockApi.override("POST /refresh-token", {
      json: {
        status: "success",
        access_token: fakeJwt(Date.now() / 1000 + seconds),
      },
    });

  const refreshes = (mockApi: MockApi) =>
    mockApi.requests.filter((r) => r.path === "/refresh-token").length;

  test("a deploy is noticed at a token refresh and loaded on the next screen change", async ({
    page,
    mockApi,
  }) => {
    await page.clock.install();
    const loads = countPageLoads(page);
    const deployed = await serveDeployedBuild(page, await servedBuild(page));

    // the login page checks; the deployed build is still the running one
    await loginWithShortToken(page, mockApi);
    await expect.poll(() => deployed.checks).toBe(1);
    expect(loads.count).toBe(1);
    await expect(updateNotice(page)).toHaveCount(0);

    // a deploy goes live. 40 minutes later the access token has expired: it
    // is refreshed (into one that lasts until 1h after login), but the last
    // check is less than an hour old, so it does not check again
    deployed.build = "newer-build";
    refreshInto(mockApi, 60 * 60);
    await page.clock.fastForward("40:00");
    await navigateInApp(page, "/novidades");
    await expect(
      page.getByRole("heading", { name: "O que há de novo na NoHarm" }),
    ).toBeVisible();
    await expect.poll(() => refreshes(mockApi)).toBe(1);
    expect(deployed.checks).toBe(1);

    // 70 minutes after login: the next refresh checks and finds the deploy
    refreshInto(mockApi, 24 * 60 * 60);
    await page.clock.fastForward("30:00");
    await navigateInApp(page, "/priorizacao/pacientes/cards");
    await expect.poll(() => refreshes(mockApi)).toBe(2);
    await expect(updateNotice(page)).toBeVisible();
    expect(deployed.checks).toBe(2);

    // the current screen is left alone until the user moves on
    expect(loads.count).toBe(1);

    await navigateInApp(page, "/novidades");
    await expect.poll(() => loads.count, { timeout: 15000 }).toBe(2);
    await expect(
      page.getByRole("heading", { name: "O que há de novo na NoHarm" }),
    ).toBeVisible({ timeout: 15000 });
    await expect(updateNotice(page)).toHaveCount(0);
  });
});
