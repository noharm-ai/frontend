import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";

/**
 * Password recovery, step two: the page behind the link sent by e-mail
 * (/reset/:token, src/components/Password).
 *
 * The token is read straight from the URL and posted back with the new
 * password, so this page is the only one where a wrong or expired token has to
 * be surfaced to a logged-out visitor. The password policy (8+ chars, upper,
 * lower and digit) is enforced client side before POST /user/reset is called.
 */

// the page is reached from an e-mail link, always logged out
test.use({ storageState: { cookies: [], origins: [] } });

const TOKEN = "e2e-reset-token";

const newPassword = (page: Page) => page.getByPlaceholder("Nova senha");
const confirmPassword = (page: Page) =>
  page.getByPlaceholder("Confirme a senha");
const submit = (page: Page) =>
  page.getByRole("button", { name: "Alterar senha" });

const resetCalls = (mockApi: MockApi) =>
  mockApi.requests.filter(
    (r) => r.method === "POST" && r.path === "/user/reset",
  );

async function openReset(page: Page) {
  await page.goto(`/reset/${TOKEN}`);
  await expect(submit(page)).toBeVisible();
}

test("posts the token from the URL with the new password", async ({
  page,
  mockApi,
}) => {
  await openReset(page);

  await newPassword(page).fill("SenhaValida1");
  await confirmPassword(page).fill("SenhaValida1");
  await submit(page).click();

  await expect(page.getByText("Uhu! Senha alterada com sucesso!")).toBeVisible();

  expect(resetCalls(mockApi)).toHaveLength(1);
  expect(JSON.parse(resetCalls(mockApi)[0].postData!)).toEqual({
    reset_token: TOKEN,
    newpassword: "SenhaValida1",
  });

  // the form is replaced by the confirmation and a way back to the login
  await expect(
    page.getByText("A sua senha foi alterada com sucesso."),
  ).toBeVisible();
  await expect(newPassword(page)).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Login" })).toHaveAttribute(
    "href",
    "/login",
  );
});

test("rejects a password that does not meet the policy", async ({
  page,
  mockApi,
}) => {
  await openReset(page);

  await newPassword(page).fill("senhafraca");
  await confirmPassword(page).fill("senhafraca");
  await submit(page).click();

  await expect(page.getByText(/A senha deve possuir, no m/)).toBeVisible();
  expect(resetCalls(mockApi)).toHaveLength(0);
  await expect(submit(page)).toBeVisible();
});

test("rejects a confirmation that does not match", async ({
  page,
  mockApi,
}) => {
  await openReset(page);

  await newPassword(page).fill("SenhaValida1");
  await confirmPassword(page).fill("SenhaValida2");
  await submit(page).click();

  await expect(page.getByText("Senhas não conferem")).toBeVisible();
  expect(resetCalls(mockApi)).toHaveLength(0);
});

test("requires both fields", async ({ page, mockApi }) => {
  await openReset(page);

  await submit(page).click();

  await expect(page.getByText("Campo obrigatório")).toHaveCount(2);
  expect(resetCalls(mockApi)).toHaveLength(0);
});

test("keeps the form when the token is expired", async ({ page, mockApi }) => {
  mockApi.override("POST /user/reset", {
    status: 400,
    json: { status: "error", message: "Token expirado" },
  });

  await openReset(page);

  await newPassword(page).fill("SenhaValida1");
  await confirmPassword(page).fill("SenhaValida1");
  await submit(page).click();

  await expect(page.getByText("Token expirado")).toBeVisible();
  await expect(
    page.getByText("A sua senha foi alterada com sucesso."),
  ).toHaveCount(0);
  await expect(submit(page)).toBeVisible();
  expect(resetCalls(mockApi)).toHaveLength(1);
});
