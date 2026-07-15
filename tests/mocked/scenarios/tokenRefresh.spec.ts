import { test, expect } from "../support/mockApi";
import { fakeJwt } from "../support/token";
import { loadFixture } from "../support/defaultHandlers";

// start unauthenticated: this test exercises the login + refresh flow itself
test.use({ storageState: { cookies: [], origins: [] } });

/**
 * The autoRefreshToken middleware refreshes the access token when it is
 * within 60s of expiring. This cannot be triggered on demand against the
 * real backend; here we log in with a token that expires in 30s and
 * assert the app transparently calls /refresh-token and keeps working.
 */
test("short-lived token triggers a transparent refresh", async ({
  page,
  mockApi,
}) => {
  const fixture = loadFixture<Record<string, unknown>>(
    "auth/authenticate.json",
  );
  fixture.access_token = fakeJwt(Date.now() / 1000 + 30);
  mockApi.override("POST /authenticate", { json: fixture });

  await page.goto("/login");
  await page.getByPlaceholder("Email").fill("e2e@noharm.ai");
  await page.getByPlaceholder("Senha").fill("mocked-password");
  await page.getByRole("button", { name: "Acessar" }).click();

  await expect(
    page.getByRole("heading", { name: "Priorização por Pacientes" }),
  ).toBeVisible({ timeout: 15000 });

  expect(
    mockApi.requests.some((r) => r.path === "/refresh-token"),
  ).toBeTruthy();
});
