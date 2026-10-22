import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";
import { openSelect } from "../support/antd";

/**
 * Admin tags (/admin/tags, features/admin/Tag).
 *
 * The list comes from POST /admin/tag/list and saves go to
 * POST /admin/tag/upsert. What the backend cannot be asked to show here is
 * the permission matrix (WRITE_TAGS vs. WRITE_PATIENT_TAGS, which only covers
 * navigation tags and needs READ_NAV) and the server rejecting a save.
 */

const BASE = ["READ_BASIC_FEATURES", "WRITE_BASIC_FEATURES", "READ_TAGS"];

const TAGS = [
  { id: 1, name: "Alto risco", tagType: 1, active: true },
  { id: 2, name: "Antigo", tagType: 1, active: false },
  { id: 3, name: "Fila de revisão", tagType: 2, active: true },
];

test.use({ storageState: { cookies: [], origins: [] } });

const installList = (mockApi: MockApi, data: unknown = TAGS) =>
  mockApi.override("POST /admin/tag/list", {
    json: { status: "success", data },
  });

const upserts = (mockApi: MockApi) =>
  mockApi.requests.filter((r) => r.path === "/admin/tag/upsert");

async function openPage(
  page: Page,
  mockApi: MockApi,
  permissions: string[],
  data: unknown = TAGS,
) {
  installList(mockApi, data);
  await loginWithPermissions(page, mockApi, [...BASE, ...permissions]);
  await page.goto("/admin/tags");
  await expect(page.locator('[data-kb="admin.tags.title"]')).toBeVisible();
}

const dialog = (page: Page) => page.getByRole("dialog");

test("lists tags with their type and status", async ({ page, mockApi }) => {
  await openPage(page, mockApi, ["WRITE_TAGS"]);

  const rows = page.locator(".ant-table-tbody tr.ant-table-row");
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(0)).toContainText("Alto risco");
  await expect(rows.nth(0)).toContainText("Paciente");
  await expect(rows.nth(0)).toContainText("Ativo");
  await expect(rows.nth(1)).toContainText("Inativo");
  await expect(rows.nth(2)).toContainText("Paciente (Navegação)");
  await expect(page.getByText("3 registros encontrados")).toBeVisible();
});

test("shows the empty state when there are no tags", async ({
  page,
  mockApi,
}) => {
  await openPage(page, mockApi, ["WRITE_TAGS"], []);

  await expect(page.getByText("Nenhum dado encontrado.")).toBeVisible();
  await expect(page.getByText("0 registros encontrados")).toBeVisible();
});

test("a failed list request notifies the user", async ({ page, mockApi }) => {
  mockApi.override("POST /admin/tag/list", {
    status: 500,
    json: { status: "error", message: "boom" },
  });
  await loginWithPermissions(page, mockApi, [...BASE, "WRITE_TAGS"]);
  await page.goto("/admin/tags");

  // StrictMode loads the list twice, so the notification can show twice
  await expect(
    page.getByText("Ops! Algo de errado aconteceu.").first(),
  ).toBeVisible();
});

test("a writer creates a tag and the payload carries the form values", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /admin/tag/upsert", {
    json: { status: "success", data: 9 },
  });
  await openPage(page, mockApi, ["WRITE_TAGS"]);

  await page.getByRole("button", { name: "Adicionar marcador" }).click();
  await expect(dialog(page)).toBeVisible();

  await dialog(page).locator("input").first().fill("Marcador Teste");
  await openSelect(dialog(page).locator(".ant-select"));
  await page.getByTitle("Marcador do paciente").click();
  await dialog(page).getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Uhu! Salvo com sucesso! :)")).toBeVisible();
  await expect(dialog(page)).toBeHidden();

  const calls = upserts(mockApi);
  expect(calls).toHaveLength(1);
  expect(JSON.parse(calls[0].postData ?? "{}")).toMatchObject({
    name: "Marcador Teste",
    tagType: 1,
    active: true,
    new: true,
  });
});

test("required and max-length validation block the save", async ({
  page,
  mockApi,
}) => {
  await openPage(page, mockApi, ["WRITE_TAGS"]);

  await page.getByRole("button", { name: "Adicionar marcador" }).click();
  await dialog(page).getByRole("button", { name: "Salvar" }).click();
  await expect(
    dialog(page).getByText("Campo obrigatório").first(),
  ).toBeVisible();

  await dialog(page).locator("input").first().fill("x".repeat(41));
  await dialog(page).getByRole("button", { name: "Salvar" }).click();
  await expect(dialog(page).getByText("Máximo de 40 caracteres")).toBeVisible();

  expect(upserts(mockApi)).toHaveLength(0);
});

test("a server error keeps the form open and shows the message", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /admin/tag/upsert", {
    status: 400,
    json: { status: "error", message: "Marcador já existe" },
  });
  await openPage(page, mockApi, ["WRITE_TAGS"]);

  await page.getByRole("button", { name: "Adicionar marcador" }).click();
  await dialog(page).locator("input").first().fill("Alto risco");
  await openSelect(dialog(page).locator(".ant-select"));
  await page.getByTitle("Marcador do paciente").click();
  await dialog(page).getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Marcador já existe")).toBeVisible();
  await expect(dialog(page)).toBeVisible();
});

test("without write permission the page is read-only", async ({
  page,
  mockApi,
}) => {
  await openPage(page, mockApi, []);

  await expect(
    page.getByRole("button", { name: "Adicionar marcador" }),
  ).toHaveCount(0);

  await page
    .getByRole("button", { name: "Visualizar marcador" })
    .first()
    .click();
  await expect(dialog(page)).toBeVisible();
  await expect(
    dialog(page).getByRole("button", { name: "Salvar" }),
  ).toBeHidden();
  await expect(
    dialog(page)
      .locator(".ant-modal-footer")
      .getByRole("button", { name: "Fechar" }),
  ).toBeVisible();
});

test("navigation writers can only edit navigation tags", async ({
  page,
  mockApi,
}) => {
  await openPage(page, mockApi, ["WRITE_PATIENT_TAGS", "READ_NAV"]);

  await expect(
    page.getByRole("button", { name: "Adicionar marcador" }),
  ).toBeVisible();

  const rows = page.locator(".ant-table-tbody tr.ant-table-row");
  await expect(
    rows.nth(0).getByRole("button", { name: "Visualizar marcador" }),
  ).toBeVisible();
  await expect(
    rows.nth(2).getByRole("button", { name: "Editar marcador" }),
  ).toBeVisible();
});
