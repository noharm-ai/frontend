import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";

/**
 * Login screen (src/components/Login + store/ducks/auth/thunk loginThunk).
 *
 * The happy path is exercised by auth.setup.ts on every run; what is left here
 * are the paths a seeded database cannot give: rejected credentials, the local
 * validation that must stop a request, the exact payload sent to
 * POST /authenticate, the MULTI_SCHEMA redirect and the company (OAuth) login.
 */

// the whole flow runs logged out
test.use({ storageState: { cookies: [], origins: [] } });

const emailInput = (page: Page) => page.getByPlaceholder("Email");
const passwordInput = (page: Page) => page.getByPlaceholder("Senha");
const loginButton = (page: Page) =>
  page.getByRole("button", { name: "Acessar" });

const authCalls = (mockApi: MockApi) =>
  mockApi.requests.filter(
    (r) => r.method === "POST" && r.path === "/authenticate",
  );

test("shows the backend message and stays on the login when credentials are rejected", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /authenticate", {
    status: 401,
    json: { status: "error", message: "Usuário ou senha inválidos" },
  });

  await page.goto("/login");
  await emailInput(page).fill("fulano@example.com");
  await passwordInput(page).fill("senha-errada");
  await loginButton(page).click();

  await expect(page.getByText("Usuário ou senha inválidos")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
  await expect(loginButton(page)).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("ac1"))).toBeNull();
  expect(authCalls(mockApi)).toHaveLength(1);
});

test("sends only the e-mail and password to the authenticate endpoint", async ({
  page,
  mockApi,
}) => {
  await page.goto("/login");
  await emailInput(page).fill("fulano@example.com");
  await passwordInput(page).fill("senha-de-teste");
  await loginButton(page).click();

  await expect(page.getByText("E2E Test").first()).toBeVisible({
    timeout: 15000,
  });

  expect(authCalls(mockApi)).toHaveLength(1);
  // keepMeLogged is a client-side choice and must not reach the backend
  expect(JSON.parse(authCalls(mockApi)[0].postData!)).toEqual({
    email: "fulano@example.com",
    password: "senha-de-teste",
  });
});

test("sends users with MULTI_SCHEMA to the schema selection", async ({
  page,
  mockApi,
}) => {
  const auth = loadFixture<{ permissions: string[] }>("auth/authenticate.json");
  mockApi.override("POST /authenticate", {
    json: { ...auth, permissions: [...auth.permissions, "MULTI_SCHEMA"] },
  });

  await page.goto("/login");
  await emailInput(page).fill("fulano@example.com");
  await passwordInput(page).fill("senha-de-teste");
  await loginButton(page).click();

  await expect(page).toHaveURL(/\/switch-schema$/, { timeout: 15000 });
});

test("offers the company login when the schema has an auth provider", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /auth-provider/:schema", {
    json: {
      status: "success",
      data: {
        flow: "implicit",
        url: "https://idp.example.com/authorize?client_id=teste",
        company: "Empresa Teste",
      },
    },
  });

  await page.goto("/login/empresa_teste");

  await expect(page.getByText("Empresa Teste")).toBeVisible();
  await expect(page.getByRole("button", { name: "Acessar" })).toBeVisible();
  // the company login replaces the e-mail/password form
  await expect(emailInput(page)).toHaveCount(0);
});

test("warns when the schema has no auth provider", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /auth-provider/:schema", {
    status: 404,
    json: { status: "error", message: "not found" },
  });

  await page.goto("/login/inexistente");

  // the provider lookup runs twice under React StrictMode in dev
  await expect(page.getByText("Inválido ou inexistente").first()).toBeVisible();
  await expect(emailInput(page)).toHaveCount(0);
});
