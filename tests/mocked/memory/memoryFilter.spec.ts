import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";

/**
 * Saved filters of an AdvancedFilter (src/features/memory/MemoryFilter),
 * exercised on the intervention list page (/intervencoes), whose memory type
 * is `intervention_list_<userId>`.
 *
 * Every saved filter of a type lives in one memory record: GET /memory/:type
 * reads it and PUT /memory/unique/:type replaces the whole list, so saving
 * reads the list first and appends to it, and removing writes the list
 * without the removed entry.
 */

const MEMORY_GET = "GET /memory/:type";
const MEMORY_PUT = "PUT /memory/unique/:type";

const savedFilter = (name: string, data: Record<string, unknown>) => ({
  name,
  data,
  active: true,
});

const FILTER_ECONOMY = savedFilter("Filtro Economia", {
  idSegment: null,
  idDrug: [],
  hasEconomy: 1,
  infectionControl: "",
});
const FILTER_OTHER = savedFilter("Filtro Outro", {
  idSegment: null,
  idDrug: [],
  hasEconomy: 0,
  infectionControl: "",
});

const memoryAnswer = (value: unknown[]) => ({
  json: {
    status: "success",
    data: [{ key: 1, type: "intervention_list_1", value }],
  },
});

const installHandlers = (mockApi: MockApi) => {
  mockApi.override("GET /intervention/reasons", {
    json: { status: "success", data: [] },
  });
  mockApi.override("POST /intervention/search", {
    json: { status: "success", data: [] },
  });
  mockApi.override(MEMORY_PUT, { json: { status: "success", data: 1 } });
};

const memoryPuts = (mockApi: MockApi) =>
  mockApi.requests.filter(
    (r) => r.method === "PUT" && r.path.startsWith("/memory/unique/"),
  );

const searchCalls = (mockApi: MockApi) =>
  mockApi.requests.filter(
    (r) => r.method === "POST" && r.path === "/intervention/search",
  );

async function openList(page: Page) {
  await page.goto("/intervencoes");
  await expect(
    page.getByRole("heading", { name: "Intervenções" }),
  ).toBeVisible();
}

async function openMenu(page: Page, item: string) {
  await page
    .locator(".ant-btn")
    .filter({ has: page.locator('[aria-label="filter"]') })
    .click();
  await page.getByText(item).click();
}

const openModal = (page: Page) => page.locator(".ant-modal:visible").last();

test("a saved filter is applied to the search", async ({ page, mockApi }) => {
  installHandlers(mockApi);
  mockApi.override(MEMORY_GET, memoryAnswer([FILTER_ECONOMY, FILTER_OTHER]));
  await openList(page);
  const searchesBefore = searchCalls(mockApi).length;

  await openMenu(page, "Abrir filtros salvos");
  const modal = openModal(page);
  await expect(modal.getByText("Filtro Economia")).toBeVisible();
  await expect(modal.getByText("Filtro Outro")).toBeVisible();

  await modal
    .locator(".ant-list-item")
    .filter({ hasText: "Filtro Economia" })
    .getByRole("button", { name: /Aplicar/ })
    .click();

  await expect(modal).toBeHidden();
  await expect.poll(() => searchCalls(mockApi).length).toBe(searchesBefore + 1);
  const search = JSON.parse(searchCalls(mockApi).at(-1)!.postData ?? "{}");
  expect(search.hasEconomy).toBe(1);
  mockApi.assertAllMatched();
});

test("removing a saved filter writes the list without it", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi);
  mockApi.override(MEMORY_GET, memoryAnswer([FILTER_ECONOMY, FILTER_OTHER]));
  await openList(page);

  await openMenu(page, "Abrir filtros salvos");
  const modal = openModal(page);
  await modal
    .locator(".ant-list-item")
    .filter({ hasText: "Filtro Economia" })
    .getByRole("button")
    .filter({ has: page.locator('[aria-label="delete"]') })
    .click();

  await expect(page.getByText("Filtro removido com sucesso.")).toBeVisible();
  await expect(modal.getByText("Filtro Economia")).toBeHidden();
  await expect(modal.getByText("Filtro Outro")).toBeVisible();

  const puts = memoryPuts(mockApi);
  expect(puts).toHaveLength(1);
  expect(puts[0].path).toMatch(/^\/memory\/unique\/intervention_list_/);
  expect(JSON.parse(puts[0].postData ?? "{}")).toEqual({
    value: [FILTER_OTHER],
  });
  mockApi.assertAllMatched();
});

test("saving the current filter appends it to the saved list", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi);
  mockApi.override(MEMORY_GET, memoryAnswer([FILTER_OTHER]));
  await openList(page);

  await openMenu(page, "Salvar filtro atual");
  const modal = openModal(page);
  const ok = modal.getByRole("button", { name: "Salvar" });
  // no name, no save
  await expect(ok).toBeDisabled();

  await modal.locator("input").fill("Meu filtro");
  await ok.click();

  await expect(page.getByText("Uhu! Salvo com sucesso! :)")).toBeVisible();
  await expect(modal).toBeHidden();

  const puts = memoryPuts(mockApi);
  expect(puts).toHaveLength(1);
  const body = JSON.parse(puts[0].postData ?? "{}");
  expect(body.value).toHaveLength(2);
  expect(body.value[0]).toEqual(FILTER_OTHER);
  expect(body.value[1]).toMatchObject({
    name: "Meu filtro",
    active: true,
    data: { hasEconomy: "", infectionControl: "", idDrug: [] },
  });
  mockApi.assertAllMatched();
});

test("saving with no saved filters yet starts a new list", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi);
  // default handler: GET /memory/:type answers an empty list
  await openList(page);

  await openMenu(page, "Salvar filtro atual");
  const modal = openModal(page);
  await modal.locator("input").fill("Primeiro filtro");
  await modal.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Uhu! Salvo com sucesso! :)")).toBeVisible();
  const body = JSON.parse(memoryPuts(mockApi)[0].postData ?? "{}");
  expect(body.value).toHaveLength(1);
  expect(body.value[0]).toMatchObject({ name: "Primeiro filtro" });
});

test("a failed load shows the error and an empty list", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi);
  mockApi.override(MEMORY_GET, {
    status: 500,
    json: { status: "error", message: "Falha ao carregar filtros" },
  });
  await openList(page);

  await openMenu(page, "Abrir filtros salvos");
  await expect(page.getByText("Falha ao carregar filtros")).toBeVisible();
  await expect(
    openModal(page).getByText("Nenhum filtro encontrado."),
  ).toBeVisible();
});

test("a failed save shows the error and keeps the modal open", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi);
  mockApi.override(MEMORY_GET, memoryAnswer([FILTER_OTHER]));
  mockApi.override(MEMORY_PUT, {
    status: 500,
    json: { status: "error", message: "Falha ao salvar filtro" },
  });
  await openList(page);

  await openMenu(page, "Salvar filtro atual");
  const modal = openModal(page);
  await modal.locator("input").fill("Meu filtro");
  await modal.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Falha ao salvar filtro")).toBeVisible();
  await expect(modal).toBeVisible();
  await expect(modal.locator("input")).toHaveValue("Meu filtro");
  await expect(page.getByText("Uhu! Salvo com sucesso! :)")).toBeHidden();
});
