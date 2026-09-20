import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";

/**
 * Password recovery, step one: the "Esqueci a senha" tab of the login screen
 * (src/components/Login/ForgotPassword + store/ducks/user/thunk).
 *
 * GET /user/forget is a public endpoint — it carries the api key but no bearer
 * token — and the UI must never disclose whether the address exists: the same
 * neutral message is shown for every submitted e-mail. The real-backend suite
 * cannot cover this flow (it would need a mailbox), so the mocked suite is the
 * only place where the request itself, and the local validation that must stop
 * it, can be asserted.
 */

// the whole flow runs logged out
test.use({ storageState: { cookies: [], origins: [] } });

const emailInput = (page: Page) => page.getByPlaceholder("Email");
const sendButton = (page: Page) => page.getByRole("button", { name: "Enviar" });

const forgetCalls = (mockApi: MockApi) =>
  mockApi.requests.filter((r) => r.path === "/user/forget");

async function openForgotPassword(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Esqueci a senha" }).click();
  await expect(sendButton(page)).toBeVisible();
}

test("sends the recovery request and answers without disclosing the account", async ({
  page,
  mockApi,
}) => {
  // the address travels in the query string, which mockApi.requests does not
  // keep, so capture it from the intercepted URL
  const requested: string[] = [];
  mockApi.override("GET /user/forget", async (route) => {
    requested.push(
      new URL(route.request().url()).searchParams.get("email") ?? "",
    );
    await route.fulfill({ json: { status: "success" } });
  });

  await openForgotPassword(page);
  await emailInput(page).fill("fulano@example.com");
  await sendButton(page).click();

  await expect(
    page.getByText(/Se o e-mail existir na plataforma/),
  ).toBeVisible();
  await expect(page.getByText(/fulano@example\.com/)).toBeVisible();

  expect(requested).toEqual(["fulano@example.com"]);
  // the form is reset so the address is not left on screen
  await expect(emailInput(page)).toHaveValue("");
});

test("does not call the endpoint when the e-mail is missing or malformed", async ({
  page,
  mockApi,
}) => {
  await openForgotPassword(page);

  // empty
  await sendButton(page).click();
  await expect(emailInput(page)).toHaveValue("");

  // malformed
  await emailInput(page).fill("fulano-at-example");
  await sendButton(page).click();

  // Yup stops the submit before the thunk runs: nothing reaches the backend.
  // The component renders no message for it, so the request log is the
  // assertion.
  await page.waitForTimeout(500);
  expect(forgetCalls(mockApi)).toHaveLength(0);
});

test("reports a backend failure instead of the success message", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /user/forget", {
    status: 500,
    json: { status: "error", message: "Serviço de e-mail indisponível" },
  });

  await openForgotPassword(page);
  await emailInput(page).fill("fulano@example.com");
  await sendButton(page).click();

  await expect(page.getByText("Serviço de e-mail indisponível")).toBeVisible();
  await expect(
    page.getByText(/Se o e-mail existir na plataforma/),
  ).toHaveCount(0);
  expect(forgetCalls(mockApi)).toHaveLength(1);
});

test("goes back to the login form", async ({ page }) => {
  await openForgotPassword(page);
  await expect(page.getByPlaceholder("Senha")).toHaveCount(0);

  await page.getByRole("button", { name: "Voltar" }).click();

  await expect(page.getByPlaceholder("Senha")).toBeVisible();
  await expect(page.getByRole("button", { name: "Acessar" })).toBeVisible();
});
