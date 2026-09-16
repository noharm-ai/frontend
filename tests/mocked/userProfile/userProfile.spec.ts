import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loginWithAuth, loginWithFeatures } from "../support/featureLogin";

/**
 * The user configuration page (/configuracoes/usuario,
 * src/features/user/UserProfile).
 *
 * Three independent cards share the route, and each one talks to a different
 * endpoint:
 *   - "Textos padrão" saves the clinical-note signature as a *unique* memory
 *     record scoped to the logged user
 *     (PUT /memory/unique/config-signature_<userId>);
 *   - "Alterar senha" validates locally before it ever reaches PUT /user;
 *   - "Cache" wipes the patient-name cache, which lives in the browser, and
 *     then asks the getname service to drop its own copy.
 *
 * The identity header above them is the only place where HIDE_NAMES is applied
 * to the logged user rather than to a patient.
 */

const identityCard = (page: Page) => page.locator("main .ant-card").first();

const card = (page: Page, title: string) =>
  page
    .locator(".ant-card")
    .filter({ has: page.locator(".ant-card-head-title", { hasText: title }) });

/**
 * The password fields carry no id and their label is not associated with the
 * input, so each one is reached through the Box that pairs them: the label's
 * column, then the input column beside it.
 */
const passwordInput = (page: Page, label: string) =>
  page.locator(
    `xpath=//label[normalize-space(text())="${label}"]/parent::div/following-sibling::div//input`,
  );

const signature = (page: Page) =>
  card(page, "Textos padrão").locator("textarea");

const saveButton = (page: Page, cardTitle: string) =>
  card(page, cardTitle).getByRole("button", { name: "Salvar" });

const memoryCalls = (mockApi: MockApi) =>
  mockApi.requests.filter(
    (r) => r.method === "PUT" && r.path.startsWith("/memory/unique/"),
  );

const passwordCalls = (mockApi: MockApi) =>
  mockApi.requests.filter((r) => r.method === "PUT" && r.path === "/user");

async function openProfile(page: Page) {
  await page.goto("/configuracoes/usuario");
  await expect(
    page.getByRole("heading", { name: "Usuário", exact: true }),
  ).toBeVisible();
}

test.describe("identity header", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("lists only the roles the UI knows how to name", async ({
    page,
    mockApi,
  }) => {
    await loginWithAuth(page, mockApi, {
      roles: ["PRESCRIPTION_ANALYST", "USER_MANAGER", "NOT_A_TRANSLATED_ROLE"],
    });

    await openProfile(page);

    await expect(identityCard(page).getByText("E2E Test")).toBeVisible();
    await expect(identityCard(page).getByText("e2e@noharm.ai")).toBeVisible();
    // the avatar falls back to the first letter of the user name
    await expect(page.locator(".ant-avatar-string")).toHaveText("E");

    await expect(page.getByText("Analista de Prescrição")).toBeVisible();
    await expect(page.getByText("Gestor de Usuários")).toBeVisible();
    // an unknown role is dropped instead of leaking its raw key on screen
    await expect(page.getByText("NOT_A_TRANSLATED_ROLE")).toHaveCount(0);
  });

  test("masks the logged user's own name and email under HIDE_NAMES", async ({
    page,
    mockApi,
  }) => {
    // the layout header is masked too, so it is what proves the login landed
    await loginWithFeatures(page, mockApi, ["HIDE_NAMES"], "****** ******");

    await openProfile(page);

    await expect(identityCard(page).getByText("****** ******")).toBeVisible();
    await expect(identityCard(page).getByText("e2e@noharm.ai")).toHaveCount(0);
    // no initial either, or the first letter of the name would still leak
    await expect(page.locator(".ant-avatar-string")).toHaveCount(0);
  });
});

test("the signature is saved as a unique memory record scoped to the user", async ({
  page,
  mockApi,
}) => {
  mockApi.override("PUT /memory/unique/config-signature_1", {
    json: { status: "success", data: 55 },
  });
  await openProfile(page);

  // the account starts with an empty signature (auth fixture)
  await expect(signature(page)).toHaveValue("");

  await signature(page).fill("Fulano Beltrano - CRF 0000");
  await saveButton(page, "Textos padrão").click();

  await expect(
    page.getByText("Uhu! Assinatura salva com sucesso! :)"),
  ).toBeVisible();

  const calls = memoryCalls(mockApi);
  expect(calls).toHaveLength(1);
  // the memory type carries the user id, so two users never share a signature
  expect(calls[0].path).toBe("/memory/unique/config-signature_1");
  expect(JSON.parse(calls[0].postData!)).toEqual({
    value: "Fulano Beltrano - CRF 0000",
  });

  // the saved text is pushed back into the account, so it survives a reload
  await page.reload();
  await expect(signature(page)).toHaveValue("Fulano Beltrano - CRF 0000");
});

test("a failing signature save keeps the typed text on screen", async ({
  page,
  mockApi,
}) => {
  mockApi.override("PUT /memory/unique/config-signature_1", {
    status: 500,
    json: { status: "error", message: "boom" },
  });
  await openProfile(page);

  await signature(page).fill("Ciclano de Tal");
  await saveButton(page, "Textos padrão").click();

  await expect(page.getByText("Ops! Algo de errado aconteceu.")).toBeVisible();
  await expect(signature(page)).toHaveValue("Ciclano de Tal");
});

test("the password form validates locally before reaching the backend", async ({
  page,
  mockApi,
}) => {
  await openProfile(page);
  const save = saveButton(page, "Alterar senha");

  // empty form: three required fields, and nothing is sent
  await save.click();
  await expect(
    card(page, "Alterar senha").getByText("Campo obrigatório"),
  ).toHaveCount(3);
  expect(passwordCalls(mockApi)).toHaveLength(0);

  // a weak new password is rejected by the strength rule
  await passwordInput(page, "Senha atual:").fill("senha-atual");
  await passwordInput(page, "Nova senha:").fill("fraca");
  await passwordInput(page, "Confirmar senha:").fill("fraca");
  await save.click();
  await expect(
    page.getByText(
      "A senha deve possuir, no mínimo, 8 caracteres, letras maíusculas, minúsculas e números",
    ),
  ).toBeVisible();
  expect(passwordCalls(mockApi)).toHaveLength(0);

  // strong enough, but the confirmation does not match
  await passwordInput(page, "Nova senha:").fill("SenhaNova1");
  await passwordInput(page, "Confirmar senha:").fill("SenhaNova2");
  await save.click();
  await expect(page.getByText("Senhas não conferem")).toBeVisible();
  expect(passwordCalls(mockApi)).toHaveLength(0);
});

test("a valid password change is sent to PUT /user and clears the form", async ({
  page,
  mockApi,
}) => {
  mockApi.override("PUT /user", { json: { status: "success", data: null } });
  await openProfile(page);

  await passwordInput(page, "Senha atual:").fill("SenhaAtual1");
  await passwordInput(page, "Nova senha:").fill("SenhaNova1");
  await passwordInput(page, "Confirmar senha:").fill("SenhaNova1");
  await saveButton(page, "Alterar senha").click();

  await expect(
    page.getByText("Uhu! Senha alterada com sucesso! :)"),
  ).toBeVisible();

  const calls = passwordCalls(mockApi);
  expect(calls).toHaveLength(1);
  expect(JSON.parse(calls[0].postData!)).toEqual({
    password: "SenhaAtual1",
    newpassword: "SenhaNova1",
    confirmPassword: "SenhaNova1",
  });

  // Base resets the form once the save succeeds, so no password lingers
  await expect(passwordInput(page, "Senha atual:")).toHaveValue("");
  await expect(passwordInput(page, "Nova senha:")).toHaveValue("");
  await expect(passwordInput(page, "Confirmar senha:")).toHaveValue("");
});

test("a rejected password change keeps the form filled", async ({
  page,
  mockApi,
}) => {
  mockApi.override("PUT /user", {
    status: 400,
    json: { status: "error", message: "Senha atual incorreta" },
  });
  await openProfile(page);

  await passwordInput(page, "Senha atual:").fill("SenhaErrada1");
  await passwordInput(page, "Nova senha:").fill("SenhaNova1");
  await passwordInput(page, "Confirmar senha:").fill("SenhaNova1");
  await saveButton(page, "Alterar senha").click();

  // updatePassword rejects with a plain string, which getErrorMessage cannot
  // read as { message }, so the backend text is replaced by the generic one
  await expect(page.getByText("Ocorreu um erro inesperado")).toBeVisible();

  expect(passwordCalls(mockApi)).toHaveLength(1);
  // the form is only reset on success, so the user can correct and retry
  await expect(passwordInput(page, "Senha atual:")).toHaveValue("SenhaErrada1");
});

test("clearing the name cache also asks the getname service to drop its copy", async ({
  page,
  mockApi,
}) => {
  await openProfile(page);

  await page
    .getByRole("button", { name: "Limpar cache de nomes dos pacientes" })
    .click();

  await expect(page.getByText("Cache limpo com sucesso!")).toBeVisible();

  // nameUrl is "/names/{idPatient}": the flag is replaced by the literal "clear"
  expect(
    mockApi.requests.filter(
      (r) => r.method === "GET" && r.path === "/names/clear",
    ),
  ).toHaveLength(1);
});
