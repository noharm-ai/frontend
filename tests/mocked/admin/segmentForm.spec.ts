import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import { loginWithAuth } from "../support/featureLogin";

/**
 * Segment admin (/admin/segmentos; the segment list comes from /authenticate): the segment cards, the form validation,
 * the upsert payload for a new and an existing segment, and the server-error
 * path.
 */

const PERMISSIONS = [
  "READ_BASIC_FEATURES",
  "READ_PRESCRIPTION",
  "ADMIN_SEGMENTS",
];

const segments = [
  { id: 1, description: "Adulto", status: 1, type: 1, cpoe: false },
  { id: 2, description: "Pediatria", status: 1, type: 2, cpoe: true },
];

const upsertCalls = (mockApi: {
  requests: { method: string; path: string }[];
}) =>
  mockApi.requests.filter(
    (r) => r.method === "POST" && r.path === "/admin/segments",
  );

const openForm = async (page: Page) => {
  const modal = page.getByRole("dialog");
  await expect(modal).toBeVisible();
  await expect(modal).not.toHaveClass(/ant-zoom/);
  return modal;
};

test.use({ storageState: { cookies: [], origins: [] } });

test.beforeEach(async ({ page, mockApi }) => {
  await loginWithAuth(page, mockApi, {
    permissions: PERMISSIONS,
    segments,
  });
  await page.goto("/admin/segmentos");
  await expect(page.getByText("Pediatria", { exact: true })).toBeVisible();
});

test("lists one card per segment", async ({ page }) => {
  await expect(page.getByText("Adulto", { exact: true })).toBeVisible();
  await expect(page.locator(".process-card")).toHaveCount(2);
});

test("requires name and type for a new segment and does not call the API", async ({
  page,
  mockApi,
}) => {
  await page.getByRole("button", { name: "Adicionar" }).click();
  const modal = await openForm(page);
  await modal.getByRole("button", { name: "Salvar" }).click();

  await expect(modal.getByText("Campo obrigatório").first()).toBeVisible();
  expect(upsertCalls(mockApi)).toHaveLength(0);
});

test("creates a segment copying the origin and shows the next steps", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /admin/segments", {
    json: { status: "success", data: 3 },
  });

  await page.getByRole("button", { name: "Adicionar" }).click();
  const modal = await openForm(page);
  await modal.getByRole("textbox").first().fill("Oncologia");

  await modal.locator(".ant-select").nth(0).click();
  await page.getByTitle("Tipo adulto").click();
  await modal.locator(".ant-select").nth(1).click();
  await page.getByTitle("Pediatria").click();

  await modal.getByRole("button", { name: "Salvar" }).click();

  await expect(
    page.locator(".ant-modal-confirm-title", {
      hasText: "Segmento criado com sucesso!",
    }),
  ).toBeVisible();
  await expect(page.getByText("Adicione setores")).toBeVisible();

  const calls = upsertCalls(mockApi);
  expect(calls).toHaveLength(1);
  expect(JSON.parse(calls[0].postData ?? "{}")).toMatchObject({
    description: "Oncologia",
    type: 1,
    idSegmentOrigin: 2,
  });
});

test("edits an existing segment without asking for an origin", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /admin/segments", {
    json: { status: "success", data: 1 },
  });

  await page
    .locator(".process-card")
    .filter({ hasText: "Adulto" })
    .getByRole("button")
    .first()
    .click();
  const modal = await openForm(page);

  await expect(modal.getByText("Segmento Origem")).toHaveCount(0);
  await expect(modal.getByRole("textbox").first()).toHaveValue("Adulto");

  await modal.getByRole("textbox").first().fill("Adulto geral");
  await modal.getByRole("button", { name: "Salvar" }).click();

  await expect(modal).toBeHidden();
  await expect(page.locator(".ant-modal-confirm-title")).toHaveCount(0);

  const calls = upsertCalls(mockApi);
  expect(calls).toHaveLength(1);
  expect(JSON.parse(calls[0].postData ?? "{}")).toMatchObject({
    idSegment: 1,
    description: "Adulto geral",
    type: 1,
  });
});

test("keeps the form open when the server rejects the segment", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /admin/segments", {
    status: 500,
    json: { status: "error", message: "Erro ao salvar segmento", code: "x" },
  });

  await page
    .locator(".process-card")
    .filter({ hasText: "Pediatria" })
    .getByRole("button")
    .first()
    .click();
  const modal = await openForm(page);
  await modal.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Erro ao salvar segmento")).toBeVisible();
  await expect(modal).toBeVisible();
  expect(upsertCalls(mockApi)).toHaveLength(1);
});
