import { test, expect } from "../support/mockApi";
import type { Page, Route } from "@playwright/test";

/**
 * Keeping long-lived tabs on the deployed version (src/features/appVersion).
 *
 * Every build stamps an id into index.html (`<meta name="app-build">`). The app
 * fetches /index.html?build-check=... (on the login page, after an access
 * token refresh, when the tab becomes visible) and, when the id differs from
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

/** Answers the build check with `build`; returns how many checks were made */
async function serveDeployedBuild(page: Page, build: string) {
  const checks = { count: 0 };
  await page.route(isBuildCheck, (route) => {
    checks.count += 1;
    return route.fulfill({
      contentType: "text/html",
      body: deployedPage(build),
    });
  });
  return checks;
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

const runningBuild = (page: Page) =>
  page.locator('meta[name="app-build"]').getAttribute("content");

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
    const checks = await serveDeployedBuild(page, "newer-build");
    const loads = countPageLoads(page);

    await page.goto("/login");

    // the first boot finds the newer build and reloads; the second one still
    // gets the old page (as a stale cache would serve it) and must not loop
    await expect.poll(() => checks.count, { timeout: 15000 }).toBe(2);
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
  test("a newer deploy is offered and loaded on the next screen change", async ({
    page,
  }) => {
    const checks = await serveDeployedBuild(page, "newer-build");
    const loads = countPageLoads(page);

    await page.goto("/priorizacao/pacientes/cards");
    await expect(
      page.getByRole("heading", { name: "Priorização por Pacientes" }),
    ).toBeVisible({ timeout: 15000 });

    // coming back to the tab checks the deployed build
    await page.evaluate(() =>
      document.dispatchEvent(new Event("visibilitychange")),
    );
    await expect(updateNotice(page)).toBeVisible();
    expect(checks.count).toBe(1);

    // the current screen is left alone until the user moves on
    expect(loads.count).toBe(1);

    await navigateInApp(page, "/novidades");
    await expect.poll(() => loads.count, { timeout: 15000 }).toBe(2);
    await expect(
      page.getByRole("heading", { name: "O que há de novo na NoHarm" }),
    ).toBeVisible({ timeout: 15000 });
    await expect(updateNotice(page)).toHaveCount(0);
  });

  test("nothing happens while the deployed build is the running one", async ({
    page,
  }) => {
    const loads = countPageLoads(page);

    await page.goto("/priorizacao/pacientes/cards");
    await expect(
      page.getByRole("heading", { name: "Priorização por Pacientes" }),
    ).toBeVisible({ timeout: 15000 });

    const checks = await serveDeployedBuild(page, (await runningBuild(page))!);
    await page.evaluate(() =>
      document.dispatchEvent(new Event("visibilitychange")),
    );
    await expect.poll(() => checks.count).toBe(1);

    await navigateInApp(page, "/novidades");
    await expect(
      page.getByRole("heading", { name: "O que há de novo na NoHarm" }),
    ).toBeVisible();
    expect(loads.count).toBe(1);
    await expect(updateNotice(page)).toHaveCount(0);
  });
});
