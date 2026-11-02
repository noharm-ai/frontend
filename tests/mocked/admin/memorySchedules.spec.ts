import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { openSelect, pickOption } from "../support/antd";

/**
 * Admin schedules (/admin/horarios, features/admin/Memory/Schedules).
 *
 * Two memory kinds back the page: "map-schedules" holds every administration
 * time seen in the prescriptions (the options) and "map-schedules-fasting"
 * holds the ids of the times that count as fasting. The single card saves the
 * fasting kind as a unique record and reloads both kinds afterwards.
 *
 * The list request counts are compared before and after an action: the dev
 * server runs React.StrictMode, which mounts the page (and loads it) twice.
 */

const SCHEDULES = [
  { id: "08 12", value: "08 12" },
  { id: "06 18", value: "06 18" },
  { id: "22", value: "22" },
];

const memoryList = (fasting: string[]) => ({
  status: "success",
  data: [
    { key: 1, kind: "map-schedules", value: SCHEDULES },
    { key: 2, kind: "map-schedules-fasting", value: fasting },
  ],
});

const card = (page: Page) =>
  page.locator(".ant-card").filter({
    has: page.locator(".ant-card-head-title", {
      hasText: "Horários de administração em Jejum",
    }),
  });

const selectedTags = (page: Page) =>
  card(page).locator(".ant-select-selection-item");

const memoryPuts = (mockApi: MockApi) =>
  mockApi.requests.filter(
    (r) => r.method === "PUT" && r.path === "/admin/memory",
  );

const memoryLists = (mockApi: MockApi) =>
  mockApi.requests.filter((r) => r.path === "/admin/memory/list");

test.beforeEach(async ({ mockApi }) => {
  mockApi.override("POST /admin/memory/list", { json: memoryList(["22"]) });
  mockApi.override("PUT /admin/memory", {
    json: { status: "success", data: 2 },
  });
});

test("loads both kinds, shows the fasting times and offers every time seen", async ({
  page,
  mockApi,
}) => {
  await page.goto("/admin/horarios");

  await expect(
    page.getByRole("heading", { name: "Horários", exact: true }),
  ).toBeVisible();
  await expect(selectedTags(page)).toHaveText(["22"]);

  const body = JSON.parse(memoryLists(mockApi)[0].postData ?? "{}");
  expect(body).toEqual({ kinds: ["map-schedules-fasting", "map-schedules"] });

  await openSelect(card(page));
  const options = page.locator(
    ".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option",
  );
  await expect(options).toHaveText(SCHEDULES.map((s) => s.value));
});

test("saves the fasting times as a unique record and reloads", async ({
  page,
  mockApi,
}) => {
  await page.goto("/admin/horarios");
  await expect(selectedTags(page)).toHaveText(["22"]);

  await openSelect(card(page));
  await pickOption(page, "06 18");
  await page.keyboard.press("Escape");
  await expect(selectedTags(page)).toHaveText(["22", "06 18"]);

  // the reload after saving brings the new mapping back from the backend
  mockApi.override("POST /admin/memory/list", {
    json: memoryList(["22", "06 18"]),
  });
  const listsBeforeSave = memoryLists(mockApi).length;
  await card(page).getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Uhu! Salvo com sucesso! :)")).toBeVisible();

  const puts = memoryPuts(mockApi);
  expect(puts).toHaveLength(1);
  expect(JSON.parse(puts[0].postData ?? "{}")).toEqual({
    kind: "map-schedules-fasting",
    value: ["22", "06 18"],
    unique: true,
  });
  await expect
    .poll(() => memoryLists(mockApi).length)
    .toBe(listsBeforeSave + 1);
  await expect(selectedTags(page)).toHaveText(["22", "06 18"]);
});

test("shows the backend message when saving fails and does not reload", async ({
  page,
  mockApi,
}) => {
  mockApi.override("PUT /admin/memory", {
    status: 400,
    json: { status: "error", message: "Usuário sem permissão" },
  });

  await page.goto("/admin/horarios");
  await expect(selectedTags(page)).toHaveText(["22"]);
  const listsBeforeSave = memoryLists(mockApi).length;

  await openSelect(card(page));
  await pickOption(page, "08 12");
  await page.keyboard.press("Escape");
  await card(page).getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Usuário sem permissão")).toBeVisible();
  expect(memoryPuts(mockApi)).toHaveLength(1);
  expect(memoryLists(mockApi)).toHaveLength(listsBeforeSave);
});

test("shows the generic error when the schedules cannot be loaded", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /admin/memory/list", {
    status: 500,
    json: { status: "error", message: "Internal server error" },
  });

  await page.goto("/admin/horarios");

  await expect(
    page.getByText("Ops! Algo de errado aconteceu.").first(),
  ).toBeVisible();
  expect(memoryPuts(mockApi)).toHaveLength(0);
});
