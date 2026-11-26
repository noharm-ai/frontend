import { test, expect } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";

/**
 * Tag list (/admin/tags): the list load and its error path, the filter
 * payload, and editing an existing tag updating its row in place.
 */

const PERMISSIONS = [
  "READ_BASIC_FEATURES",
  "READ_PRESCRIPTION",
  "READ_TAGS",
  "WRITE_TAGS",
];

const existingTags = [
  {
    name: "ALTO RISCO",
    tagType: 1,
    active: true,
    createdAt: "2026-01-05T10:00:00",
    updatedAt: null,
  },
  {
    name: "ACOMPANHAR",
    tagType: 2,
    active: true,
    createdAt: "2026-01-05T10:00:00",
    updatedAt: null,
  },
];

const listCalls = (mockApi: {
  requests: { path: string; postData?: string }[];
}) => mockApi.requests.filter((r) => r.path === "/admin/tag/list");

test.use({ storageState: { cookies: [], origins: [] } });

test("lists the tags with their type and status", async ({ page, mockApi }) => {
  mockApi.override("POST /admin/tag/list", {
    json: { status: "success", data: existingTags },
  });
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await page.goto("/admin/tags");

  const riskRow = page.getByRole("row").filter({ hasText: "ALTO RISCO" });
  await expect(
    riskRow.getByRole("cell", { name: "Paciente", exact: true }),
  ).toBeVisible();
  await expect(riskRow.getByText("Ativo", { exact: true })).toBeVisible();

  const navRow = page.getByRole("row").filter({ hasText: "ACOMPANHAR" });
  await expect(
    navRow.getByRole("cell", { name: "Paciente (Navegação)", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("2 registros encontrados")).toBeVisible();
});

test("shows an error notification when the list fails to load", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /admin/tag/list", {
    status: 500,
    json: { status: "error", message: "Internal server error" },
  });
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await page.goto("/admin/tags");

  await expect(
    page.getByText("Ops! Algo de errado aconteceu.").first(),
  ).toBeVisible();
  await expect(page.getByText("0 registros encontrados")).toBeVisible();
});

test("filters by status and sends it to the list endpoint", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /admin/tag/list", {
    json: { status: "success", data: existingTags },
  });
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await page.goto("/admin/tags");
  await expect(
    page.getByRole("cell", { name: "ALTO RISCO", exact: true }),
  ).toBeVisible();

  const initial = listCalls(mockApi);
  expect(initial.length).toBeGreaterThan(0);
  expect(
    JSON.parse(initial[initial.length - 1].postData ?? "{}"),
  ).toMatchObject({ active: null });

  mockApi.override("POST /admin/tag/list", {
    json: {
      status: "success",
      data: [{ ...existingTags[0], name: "INATIVO TESTE", active: false }],
    },
  });

  await page
    .locator(".ant-col")
    .filter({ hasText: "Situação:" })
    .locator(".ant-select")
    .click();
  await page
    .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
    .getByText("Inativo", { exact: true })
    .click();
  await page.locator(".gtm-btn-search").click();

  await expect(
    page.getByRole("cell", { name: "INATIVO TESTE", exact: true }),
  ).toBeVisible();
  const calls = listCalls(mockApi);
  expect(JSON.parse(calls[calls.length - 1].postData ?? "{}")).toMatchObject({
    active: false,
  });
});

test("editing an existing tag updates its row in place", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /admin/tag/list", {
    json: { status: "success", data: existingTags },
  });
  mockApi.override("POST /admin/tag/upsert", {
    json: {
      status: "success",
      data: { ...existingTags[0], active: false },
    },
  });
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await page.goto("/admin/tags");

  const riskRow = page.getByRole("row").filter({ hasText: "ALTO RISCO" });
  await riskRow.getByRole("button", { name: "Editar marcador" }).click();

  const modal = page.getByRole("dialog");
  await expect(modal).toBeVisible();
  await expect(modal).not.toHaveClass(/ant-zoom/);
  await expect(
    modal
      .locator(".form-row")
      .filter({ hasText: "Marcador:" })
      .getByRole("textbox"),
  ).toHaveValue("ALTO RISCO");

  await modal.getByRole("switch").click();
  await modal.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(riskRow.getByText("Inativo", { exact: true })).toBeVisible();
  await expect(page.getByText("2 registros encontrados")).toBeVisible();

  const calls = mockApi.requests.filter((r) => r.path === "/admin/tag/upsert");
  expect(calls).toHaveLength(1);
  expect(JSON.parse(calls[0].postData ?? "{}")).toMatchObject({
    name: "ALTO RISCO",
    tagType: 1,
    active: false,
  });
});
