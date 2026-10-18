import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { openSelect, pickOption } from "../support/antd";

/**
 * Admin routes of administration (/admin/vias, features/admin/Memory/Routes).
 *
 * Three memory kinds back the page: "map-routes" holds every route seen in
 * the prescriptions (the options) while "map-tube" and "map-iv" hold the ids
 * of the routes that raise the SONDA and INTRAVENOSA flags. Each card saves
 * its own kind, as a unique record, and the page reloads the three kinds
 * after a successful save.
 *
 * The list request counts are compared before and after an action: the dev
 * server runs React.StrictMode, which mounts the page (and loads it) twice.
 */

const ROUTES = [
  { id: "SNE", value: "Sonda nasoenteral" },
  { id: "GTT", value: "Gastrostomia" },
  { id: "EV", value: "Endovenosa" },
  { id: "VO", value: "Via oral" },
];

const memoryList = (tube: string[], iv: string[]) => ({
  status: "success",
  data: [
    { key: 1, kind: "map-routes", value: ROUTES },
    { key: 2, kind: "map-tube", value: tube },
    { key: 3, kind: "map-iv", value: iv },
  ],
});

const installHandlers = (mockApi: MockApi) => {
  mockApi.override("POST /admin/memory/list", {
    json: memoryList(["SNE"], ["EV"]),
  });
  mockApi.override("PUT /admin/memory", {
    json: { status: "success", data: 2 },
  });
};

const card = (page: Page, title: string) =>
  page.locator(".ant-card").filter({
    has: page.locator(".ant-card-head-title", { hasText: title }),
  });

const selectedTags = (page: Page, title: string) =>
  card(page, title).locator(".ant-select-selection-item");

const memoryPuts = (mockApi: MockApi) =>
  mockApi.requests.filter(
    (r) => r.method === "PUT" && r.path === "/admin/memory",
  );

const memoryLists = (mockApi: MockApi) =>
  mockApi.requests.filter((r) => r.path === "/admin/memory/list");

test.beforeEach(async ({ mockApi }) => {
  installHandlers(mockApi);
});

test("loads the route kinds and shows the mapped routes by name", async ({
  page,
  mockApi,
}) => {
  await page.goto("/admin/vias");

  await expect(
    page.getByRole("heading", { name: "Vias", exact: true }),
  ).toBeVisible();

  await expect(selectedTags(page, "Sonda")).toHaveText(["Sonda nasoenteral"]);
  await expect(selectedTags(page, "Intravenosa")).toHaveText(["Endovenosa"]);

  const body = JSON.parse(memoryLists(mockApi)[0].postData ?? "{}");
  expect(body).toEqual({ kinds: ["map-routes", "map-iv", "map-tube"] });

  // every route seen in the prescriptions is an option
  await openSelect(card(page, "Sonda"));
  const options = page.locator(
    ".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option",
  );
  await expect(options).toHaveText(ROUTES.map((r) => r.value));
});

test("saves the tube routes as a unique record and reloads", async ({
  page,
  mockApi,
}) => {
  await page.goto("/admin/vias");
  await expect(selectedTags(page, "Sonda")).toHaveText(["Sonda nasoenteral"]);

  await openSelect(card(page, "Sonda"));
  await pickOption(page, "Gastrostomia");
  await page.keyboard.press("Escape");
  await expect(selectedTags(page, "Sonda")).toHaveText([
    "Sonda nasoenteral",
    "Gastrostomia",
  ]);

  // the reload after saving brings the new mapping back from the backend
  mockApi.override("POST /admin/memory/list", {
    json: memoryList(["SNE", "GTT"], ["EV"]),
  });
  const listsBeforeSave = memoryLists(mockApi).length;
  await card(page, "Sonda").getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Uhu! Salvo com sucesso! :)")).toBeVisible();
  await expect(selectedTags(page, "Sonda")).toHaveText([
    "Sonda nasoenteral",
    "Gastrostomia",
  ]);

  const puts = memoryPuts(mockApi);
  expect(puts).toHaveLength(1);
  // only the saved card's kind is sent: the IV mapping is left untouched
  expect(JSON.parse(puts[0].postData ?? "{}")).toEqual({
    kind: "map-tube",
    value: ["SNE", "GTT"],
    unique: true,
  });
  await expect
    .poll(() => memoryLists(mockApi).length)
    .toBe(listsBeforeSave + 1);
});

test("saves the IV routes from its own card", async ({ page, mockApi }) => {
  await page.goto("/admin/vias");
  await expect(selectedTags(page, "Intravenosa")).toHaveText(["Endovenosa"]);

  await openSelect(card(page, "Intravenosa"));
  await pickOption(page, "Sonda nasoenteral");
  await page.keyboard.press("Escape");

  await card(page, "Intravenosa")
    .getByRole("button", { name: "Salvar" })
    .click();
  await expect(page.getByText("Uhu! Salvo com sucesso! :)")).toBeVisible();

  const puts = memoryPuts(mockApi);
  expect(puts).toHaveLength(1);
  expect(JSON.parse(puts[0].postData ?? "{}")).toEqual({
    kind: "map-iv",
    value: ["EV", "SNE"],
    unique: true,
  });
});

test("requires at least one route before saving", async ({ page, mockApi }) => {
  await page.goto("/admin/vias");
  await expect(selectedTags(page, "Sonda")).toHaveText(["Sonda nasoenteral"]);

  await card(page, "Sonda")
    .locator(".ant-select-selection-item-remove")
    .click();
  await expect(selectedTags(page, "Sonda")).toHaveCount(0);

  await card(page, "Sonda").getByRole("button", { name: "Salvar" }).click();

  await expect(
    card(page, "Sonda").getByText("Pelo menos um item deve ser selecionado"),
  ).toBeVisible();
  expect(memoryPuts(mockApi)).toHaveLength(0);
});

test("shows the backend message when saving fails", async ({
  page,
  mockApi,
}) => {
  mockApi.override("PUT /admin/memory", {
    status: 400,
    json: { status: "error", message: "Usuário sem permissão" },
  });

  await page.goto("/admin/vias");
  await expect(selectedTags(page, "Sonda")).toHaveText(["Sonda nasoenteral"]);
  const listsBeforeSave = memoryLists(mockApi).length;

  await card(page, "Sonda").getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Usuário sem permissão")).toBeVisible();
  await expect(page.getByText("Uhu! Salvo com sucesso! :)")).toHaveCount(0);
  expect(memoryPuts(mockApi)).toHaveLength(1);
  // no reload after a failed save
  expect(memoryLists(mockApi)).toHaveLength(listsBeforeSave);
  // the form keeps what the user had picked
  await expect(selectedTags(page, "Sonda")).toHaveText(["Sonda nasoenteral"]);
});
