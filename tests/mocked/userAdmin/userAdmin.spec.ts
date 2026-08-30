import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";
import { openSelect, pickOption } from "../support/antd";

/**
 * User administration (/configuracoes/administracao,
 * src/features/userAdmin).
 *
 * The page has two faces: READ_USERS opens the editable list, and without it
 * the very same route renders UserManagerList — the read-only "ask one of
 * these people" fallback. Below that, the list filters locally (situação,
 * papel) and the form posts a single upsert to /editUser, where the email of
 * an existing user is frozen because changing it resets their password.
 */

const USERS = [
  {
    id: 1,
    name: "Ana Farmaceutica",
    email: "ana@example.com",
    external: "A-1",
    active: true,
    roles: ["PRESCRIPTION_ANALYST"],
    segments: [],
  },
  {
    id: 2,
    name: "Bruno Gestor",
    email: "bruno@example.com",
    external: null,
    active: true,
    roles: ["USER_MANAGER", "CONFIG_MANAGER"],
    segments: [],
  },
  {
    id: 3,
    name: "Carla Inativa",
    email: "carla@example.com",
    external: null,
    active: false,
    roles: ["VIEWER"],
    segments: [],
  },
];

const rows = (page: Page) => page.locator(".ant-table-tbody tr.ant-table-row");

const editUserCalls = (mockApi: MockApi) =>
  mockApi.requests
    .filter((r) => r.method === "POST" && r.path === "/editUser")
    .map((r) => JSON.parse(r.postData!));

/** The list filter Selects carry no id, so they are reached by their label. */
const listFilter = (page: Page, label: string) =>
  page.locator(".filter-field").filter({ hasText: label });

async function pickListFilter(page: Page, label: string, option: string) {
  await openSelect(listFilter(page, label));
  await pickOption(page, option);
  await page.keyboard.press("Escape");
}

const formRow = (page: Page, label: string) =>
  page.getByRole("dialog").locator(".form-row").filter({ hasText: label });

async function openList(page: Page, mockApi: MockApi, users = USERS) {
  mockApi.override("GET /users", { json: { status: "success", data: users } });

  await page.goto("/configuracoes/administracao");
  await expect(
    page.getByRole("heading", { name: "Cadastro de Usuários" }),
  ).toBeVisible();
  await expect(rows(page)).toHaveCount(users.length);
}

test.describe("without READ_USERS", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("the route falls back to the read-only list of user managers", async ({
    page,
    mockApi,
  }) => {
    mockApi.override("GET /user-admin/manager-list", {
      json: {
        status: "success",
        data: [
          { id: 9, name: "Ana Gestora", email: "ana.gestora@example.com" },
        ],
      },
    });
    await loginWithPermissions(page, mockApi, [
      "READ_BASIC_FEATURES",
      "READ_PRESCRIPTION",
    ]);

    await page.goto("/configuracoes/administracao");

    await expect(
      page.getByText(
        "Você não possui permissão para criar ou alterar usuários",
      ),
    ).toBeVisible();
    await expect(page.getByRole("cell", { name: "Ana Gestora" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "ana.gestora@example.com" }),
    ).toHaveAttribute("href", "mailto:ana.gestora@example.com");

    // no way in: neither the creation button nor the per-row edit action
    await expect(
      page.getByRole("button", { name: "Novo usuário" }),
    ).toHaveCount(0);
    expect(mockApi.requests.filter((r) => r.path === "/users")).toHaveLength(0);
  });

  test("with no manager to point at, the empty state offers support", async ({
    page,
    mockApi,
  }) => {
    mockApi.override("GET /user-admin/manager-list", {
      json: { status: "success", data: [] },
    });
    await loginWithPermissions(page, mockApi, [
      "READ_BASIC_FEATURES",
      "READ_PRESCRIPTION",
      "WRITE_SUPPORT",
    ]);

    await page.goto("/configuracoes/administracao");

    await expect(
      page.getByText("Nenhum gestor de usuários ativo foi encontrado"),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Abrir um Novo Chamado" }),
    ).toBeVisible();
  });
});

test("Situação and Papel filter the list locally and update the record count", async ({
  page,
  mockApi,
}) => {
  await openList(page, mockApi);
  await expect(page.getByText("3 registros")).toBeVisible();
  const fetchesOnLoad = mockApi.requests.filter(
    (r) => r.path === "/users",
  ).length;

  await pickListFilter(page, "Situação", "Inativo");
  await expect(rows(page)).toHaveCount(1);
  await expect(page.getByRole("cell", { name: "Carla Inativa" })).toBeVisible();
  await expect(page.getByText("1 registros")).toBeVisible();

  await pickListFilter(page, "Situação", "Ativo");
  await expect(rows(page)).toHaveCount(2);

  // the two filters stack: active *and* holding the USER_MANAGER role
  await pickListFilter(page, "Papel", "Gestor de Usuários");
  await expect(rows(page)).toHaveCount(1);
  await expect(page.getByRole("cell", { name: "Bruno Gestor" })).toBeVisible();
  await expect(page.getByText("1 registros")).toBeVisible();

  // filtering never re-queries the backend
  expect(mockApi.requests.filter((r) => r.path === "/users")).toHaveLength(
    fetchesOnLoad,
  );
});

test("editing a user freezes the email and saves the rest", async ({
  page,
  mockApi,
}) => {
  await openList(page, mockApi);
  mockApi.override("POST /editUser", (route) => {
    const sent = JSON.parse(route.request().postData()!);
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: "success", data: { ...sent } }),
    });
  });

  await page
    .getByRole("row", { name: /Bruno Gestor/ })
    .getByRole("button")
    .click();

  const modal = page.getByRole("dialog");
  await expect(modal).toBeVisible();
  await expect(formRow(page, "Nome:").locator("input")).toHaveValue(
    "Bruno Gestor",
  );

  // changing the email would reset the password, so it is locked on edit
  const email = formRow(page, "Email:").locator("input");
  await expect(email).toHaveValue("bruno@example.com");
  await expect(email).toBeDisabled();

  await formRow(page, "Nome:").locator("input").fill("Bruno Gestor Silva");
  await formRow(page, "ID Externo:").locator("input").fill("B-2");
  await formRow(page, "Ativo:").locator("button.ant-switch").click();

  await modal.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Uhu! Salvo com sucesso! :)")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  const calls = editUserCalls(mockApi);
  expect(calls).toHaveLength(1);
  expect(calls[0]).toMatchObject({
    id: 2,
    name: "Bruno Gestor Silva",
    email: "bruno@example.com",
    external: "B-2",
    active: false,
    roles: ["USER_MANAGER", "CONFIG_MANAGER"],
  });

  // the saved record replaces the row in place, without a new GET /users
  const row = page.getByRole("row", { name: /Bruno Gestor Silva/ });
  await expect(row).toBeVisible();
  await expect(row).toContainText("Inativo");
  await expect(rows(page)).toHaveCount(USERS.length);
});

test("a new user needs a name and a valid email, and starts with the default roles", async ({
  page,
  mockApi,
}) => {
  await openList(page, mockApi);
  mockApi.override("POST /editUser", (route) => {
    const sent = JSON.parse(route.request().postData()!);
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: "success", data: { ...sent, id: 4 } }),
    });
  });

  await page.getByRole("button", { name: "Novo usuário" }).click();

  const modal = page.getByRole("dialog");
  await expect(modal).toBeVisible();
  // a brand new user has an editable email
  const email = formRow(page, "Email:").locator("input");
  await expect(email).toBeEnabled();

  await email.fill("nao-e-um-email");
  await modal.getByRole("button", { name: "Salvar" }).click();

  await expect(modal.getByText("Campo obrigatório")).toBeVisible();
  await expect(
    modal.getByText("Ops! Formato de email inválido."),
  ).toBeVisible();
  expect(editUserCalls(mockApi)).toHaveLength(0);

  await formRow(page, "Nome:").locator("input").fill("Nova Pessoa");
  await email.fill("nova@example.com");
  await modal.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Uhu! Salvo com sucesso! :)")).toBeVisible();

  const calls = editUserCalls(mockApi);
  expect(calls).toHaveLength(1);
  expect(calls[0].id).toBeUndefined();
  expect(calls[0]).toMatchObject({
    name: "Nova Pessoa",
    email: "nova@example.com",
    active: true,
    roles: ["PRESCRIPTION_ANALYST", "CONFIG_MANAGER", "SUPPORT_REQUESTER"],
  });

  await expect(rows(page)).toHaveCount(USERS.length + 1);
  await expect(page.getByRole("cell", { name: "Nova Pessoa" })).toBeVisible();
});
