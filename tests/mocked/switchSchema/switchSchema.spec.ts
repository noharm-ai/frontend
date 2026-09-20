import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";
import { openSelect, pickOption } from "../support/antd";

/**
 * Context / schema switch (/switch-schema, src/features/switchSchema).
 *
 * Users carrying MULTI_SCHEMA land here after login to pick which client they
 * are working on; POST /switch-schema answers with a brand new session (a new
 * access token and a new user payload) that replaces the current one in place.
 * The real-backend suite has a single seeded schema, so the switch itself can
 * only be exercised here.
 *
 * The form has two faces: a maintainer sees the raw schema names plus the
 * "Mais opções" panel (extra features, getname, hidden names, training role),
 * everyone else sees the friendly names alone. Both compose the same payload,
 * and getname is opt-in: leaving it off is what adds DISABLE_GETNAME.
 */

const schemaField = (page: Page) =>
  page.locator(".form-row").filter({ hasText: "Escolha o" }).first();

/**
 * The submit button is reached by its class: its label changes with the role
 * (schema/contexto) and antd leaves the spinner icon node in the DOM after the
 * schema list arrives, which keeps "loading" in the accessible name.
 */
const submit = (page: Page) => page.locator("button.gtm-btn-login");

const switchCalls = (mockApi: MockApi) =>
  mockApi.requests.filter(
    (r) => r.method === "POST" && r.path === "/switch-schema",
  );

const payloadOf = (mockApi: MockApi) =>
  JSON.parse(switchCalls(mockApi)[0].postData!);

/** The session the backend hands back for the schema just chosen. */
function switchedSession(schema: string) {
  const auth = loadFixture<Record<string, unknown>>("auth/authenticate.json");
  return { status: "success", data: { ...auth, schema } };
}

/** GET /switch-schema as seen by a maintainer: raw names and extra options. */
function asMaintainer(mockApi: MockApi) {
  const fixture = loadFixture<{ data: Record<string, unknown> }>(
    "auth/switch-schema.json",
  );
  fixture.data.maintainer = true;
  mockApi.override("GET /switch-schema", { json: fixture });
}

async function openSwitchSchema(page: Page, query = "") {
  await page.goto(`/switch-schema${query}`);
  // the button spins until GET /switch-schema answers: the loading class is
  // what actually tracks it (see submit())
  await expect(submit(page)).not.toHaveClass(/ant-btn-loading/, {
    timeout: 15000,
  });
}

test("lists the contexts by friendly name and pre-selects the current one", async ({
  page,
}) => {
  await openSwitchSchema(page);

  await expect(page.getByText("Escolha o contexto:")).toBeVisible();
  await expect(submit(page)).toContainText("Definir contexto");
  // the schema saved at login
  await expect(schemaField(page)).toContainText("Hospital Demonstração");

  // extra options are maintainer-only
  await expect(page.getByText("Mais opções")).toHaveCount(0);
});

test("switches to the chosen context and starts a new session", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /switch-schema", {
    json: switchedSession("hospital_teste"),
  });

  await openSwitchSchema(page);
  await openSelect(schemaField(page));
  await pickOption(page, "Hospital Teste");
  await submit(page).click();

  await expect(
    page.getByRole("heading", { name: "Priorização por Pacientes" }),
  ).toBeVisible({ timeout: 15000 });

  expect(switchCalls(mockApi)).toHaveLength(1);
  expect(payloadOf(mockApi)).toMatchObject({
    schema: "hospital_teste",
    extraFeatures: ["DISABLE_GETNAME"],
    runAsRole: null,
  });

  // the new session replaced the old one
  expect(await page.evaluate(() => localStorage.getItem("schema"))).toBe(
    "hospital_teste",
  );
});

test("requires a context to be chosen", async ({ page, mockApi }) => {
  // drop the schema kept at login so the form starts empty
  await page.addInitScript(() => localStorage.removeItem("schema"));

  await openSwitchSchema(page);
  await submit(page).click();

  await expect(page.locator(".form-error")).toHaveText("Campo obrigatório");
  expect(switchCalls(mockApi)).toHaveLength(0);
});

test("keeps the form when the switch is refused", async ({ page, mockApi }) => {
  mockApi.override("POST /switch-schema", {
    status: 401,
    json: { status: "error", message: "Schema não autorizado" },
  });

  await openSwitchSchema(page);
  await openSelect(schemaField(page));
  await pickOption(page, "Clínica Teste");
  await submit(page).click();

  // getErrorMessage() surfaces the message the backend sent
  await expect(page.getByText("Schema não autorizado")).toBeVisible();
  await expect(page).toHaveURL(/\/switch-schema/);
  expect(await page.evaluate(() => localStorage.getItem("schema"))).toBe(
    "demo",
  );
});

test("warns about other open tabs when asked to", async ({ page }) => {
  await openSwitchSchema(page, "?alert=1");

  await expect(
    page.getByText("Lembre-se de fechar as outras abas"),
  ).toBeVisible();
});

test("a maintainer picks the schema by name and composes the extra options", async ({
  page,
  mockApi,
}) => {
  asMaintainer(mockApi);
  mockApi.override("POST /switch-schema", {
    json: switchedSession("hospital_teste"),
  });

  await openSwitchSchema(page);

  await expect(page.getByText("Escolha o schema:")).toBeVisible();
  await expect(submit(page)).toContainText("Definir schema");

  await openSelect(schemaField(page));
  await pickOption(page, "hospital_teste");

  await page.getByText("Mais opções").click();

  const optionRow = (label: string) =>
    page.locator(".form-row").filter({ hasText: label });

  // read-only training role + hidden names, as used in demos
  await optionRow("Modo treinamento:").locator(".ant-switch").click();
  await optionRow("Ocultar nomes:").locator(".ant-switch").click();

  await openSelect(optionRow("Extra Features:"));
  await pickOption(page, "Bulário");
  await page.keyboard.press("Escape");

  await submit(page).click();

  await expect(
    page.getByRole("heading", { name: "Priorização por Pacientes" }),
  ).toBeVisible({ timeout: 15000 });

  const payload = payloadOf(mockApi);
  expect(payload.schema).toBe("hospital_teste");
  expect(payload.runAsRole).toBe("TRAINING");
  // getname was left off, so it is disabled explicitly
  expect(payload.extraFeatures).toEqual([
    "MICROMEDEX",
    "DISABLE_GETNAME",
    "HIDE_NAMES",
  ]);
});
