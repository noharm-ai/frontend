import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";

/**
 * Tag form (/admin/tags): name length validation, the upsert payload and
 * the server-error path.
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
];

const openNewTagModal = async (page: Page) => {
  await page.getByRole("button", { name: "Adicionar marcador" }).click();
  const modal = page.getByRole("dialog");
  await expect(modal).toBeVisible();
  await expect(modal).not.toHaveClass(/ant-zoom/);
  return modal;
};

test.use({ storageState: { cookies: [], origins: [] } });

test.beforeEach(async ({ page, mockApi }) => {
  mockApi.override("POST /admin/tag/list", {
    json: { status: "success", data: existingTags },
  });
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await page.goto("/admin/tags");
  await expect(
    page.getByRole("cell", { name: "ALTO RISCO", exact: true }),
  ).toBeVisible();
});

test("requires a tag name and does not call the API", async ({
  page,
  mockApi,
}) => {
  const modal = await openNewTagModal(page);
  await modal.getByRole("button", { name: "Salvar" }).click();

  await expect(modal.getByText("Campo obrigatório").first()).toBeVisible();
  expect(
    mockApi.requests.filter((r) => r.path === "/admin/tag/upsert"),
  ).toHaveLength(0);
});

test("rejects a name longer than 40 characters", async ({ page, mockApi }) => {
  const modal = await openNewTagModal(page);
  const row = modal.locator(".form-row").filter({ hasText: "Marcador:" });

  await row.getByRole("textbox").fill("A".repeat(41));
  await modal.getByRole("button", { name: "Salvar" }).click();

  await expect(modal.getByText("Máximo de 40 caracteres")).toBeVisible();
  expect(
    mockApi.requests.filter((r) => r.path === "/admin/tag/upsert"),
  ).toHaveLength(0);
});

test("saves a 40-character name and sends the payload", async ({
  page,
  mockApi,
}) => {
  const name = "B".repeat(40);
  mockApi.override("POST /admin/tag/upsert", {
    json: {
      status: "success",
      data: {
        name,
        tagType: 1,
        active: true,
        createdAt: "2026-01-06T10:00:00",
        updatedAt: null,
      },
    },
  });

  const modal = await openNewTagModal(page);
  const row = modal.locator(".form-row").filter({ hasText: "Marcador:" });
  await row.getByRole("textbox").fill(name);

  await modal
    .locator(".form-row")
    .filter({ hasText: "Tipo:" })
    .locator(".ant-select")
    .click();
  await page
    .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
    .getByText("Marcador do paciente", { exact: true })
    .click();

  await modal.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("cell", { name, exact: true })).toBeVisible();

  const calls = mockApi.requests.filter((r) => r.path === "/admin/tag/upsert");
  expect(calls).toHaveLength(1);
  expect(JSON.parse(calls[0].postData ?? "{}")).toMatchObject({
    name,
    tagType: 1,
  });
});

test("keeps the modal open when the upsert fails", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /admin/tag/upsert", {
    status: 500,
    json: { status: "error", message: "Internal server error" },
  });

  const modal = await openNewTagModal(page);
  await modal
    .locator(".form-row")
    .filter({ hasText: "Marcador:" })
    .getByRole("textbox")
    .fill("NOVO MARCADOR");
  await modal
    .locator(".form-row")
    .filter({ hasText: "Tipo:" })
    .locator(".ant-select")
    .click();
  await page
    .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
    .getByText("Marcador do paciente", { exact: true })
    .click();
  await modal.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "NOVO MARCADOR", exact: true }),
  ).toHaveCount(0);
});
