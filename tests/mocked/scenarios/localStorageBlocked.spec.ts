import { test, expect } from "../support/mockApi";

// start unauthenticated: this scenario exercises the app before any login
test.use({ storageState: { cookies: [], origins: [] } });

/**
 * Some Safari configurations ("Block All Cookies", private browsing, some
 * in-app browsers) throw the instant `window.localStorage` is touched,
 * rather than just returning null values from getItem/setItem. This used
 * to crash the app at module load (src/index.jsx) and on every route via
 * the auth guard (src/lib/withAuth.jsx) before all localStorage access was
 * routed through the safe wrapper in src/utils/storage.ts.
 */
test("app still renders and redirects to login when localStorage is blocked", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new Error("SecurityError: The operation is insecure.");
      },
    });
  });

  await page.goto("/");

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByPlaceholder("Email")).toBeVisible();
});
