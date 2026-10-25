import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { pickOption } from "../support/antd";

/**
 * Admin schedules (/admin/horarios, features/admin/Memory/Schedules).
 *
 * "map-schedules" holds every administration time seen in the last
 * prescriptions (the options) and "map-schedules-fasting" the ids of the
 * times flagged as fasting. Saving writes the fasting kind as a unique record
 * and reloads both kinds.
 *
 * The list request counts are compared before and after an action: the dev
 * server runs React.StrictMode, which mounts the page (and loads it) twice.
 */

const SCHEDULES = [
  { id: "06:00", value: "06:00" },
  { id: "08:00", value: "08:00" },
  { id: "12:00", value: "12:00" },
  { id: "22:00", value: "22:00" },
];

const memoryList = (fasting: string[]) => ({
  status: "success",
  data: [
    { key: 1, kind: "map-schedules", value: SCHEDULES },
    { key: 2, kind: "map-schedules-fasting", value: fasting },
  ],
});

const installHandlers = (mockApi: MockApi) => {
  mockApi.override("POST /admin/memory/list", { json: memoryList(["06:00"]) });
  mockApi.override("PUT /admin/memory", {
    json: { status: "success", data: 2 },
  });
};

const card = (page: Page) =>
  page.locator(".ant-card").filter({
    has: page.locator(".ant-card-head-title", {
      hasText: "Horários de administração em Jejum",
    }),
  });

const selectedTags = (page: Page) =>
  card(page).locator(".ant-select-selection-item");

/** Clicks the empty end of the select box, away from the tag remove icons. */
const openSchedules = async (page: Page) => {
  const box = card(page).locator(".ant-select-content").first();
  const size = await box.boundingBox();
  if (!size) throw new Error("schedules select is not visible");

  await box.click({ position: { x: size.width - 8, y: size.height / 2 } });
  await expect(
    page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)"),
  ).toBeVisible();
};

const memoryPuts = (mockApi: MockApi) =>
  mockApi.requests.filter(
    (r) => r.method === "PUT" && r.path === "/admin/memory",
  );

const memoryLists = (mockApi: MockApi) =>
  mockApi.requests.filter((r) => r.path === "/admin/memory/list");

test.beforeEach(async ({ mockApi }) => {
  installHandlers(mockApi);
});

test("loads the schedule kinds and shows the fasting times", async ({
  page,
  mockApi,
}) => {
  await page.goto("/admin/horarios");

  await expect(
    page.getByRole("heading", { name: "Horários", exact: true }),
  ).toBeVisible();
  await expect(selectedTags(page)).toHaveText(["06:00"]);

  const body = JSON.parse(memoryLists(mockApi)[0].postData ?? "{}");
  expect(body).toEqual({ kinds: ["map-schedules-fasting", "map-schedules"] });

  // every time seen in the prescriptions is an option
  await openSchedules(page);
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
  await expect(selectedTags(page)).toHaveText(["06:00"]);

  await openSchedules(page);
  await pickOption(page, "22:00");
  await page.keyboard.press("Escape");
  await expect(selectedTags(page)).toHaveText(["06:00", "22:00"]);

  mockApi.override("POST /admin/memory/list", {
    json: memoryList(["06:00", "22:00"]),
  });
  const listsBeforeSave = memoryLists(mockApi).length;
  await card(page).getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Uhu! Salvo com sucesso! :)")).toBeVisible();
  await expect(selectedTags(page)).toHaveText(["06:00", "22:00"]);

  const puts = memoryPuts(mockApi);
  expect(puts).toHaveLength(1);
  expect(JSON.parse(puts[0].postData ?? "{}")).toEqual({
    kind: "map-schedules-fasting",
    value: ["06:00", "22:00"],
    unique: true,
  });
  await expect
    .poll(() => memoryLists(mockApi).length)
    .toBe(listsBeforeSave + 1);
});

test("allows clearing every fasting time", async ({ page, mockApi }) => {
  await page.goto("/admin/horarios");
  await expect(selectedTags(page)).toHaveText(["06:00"]);

  await card(page).locator(".ant-select-selection-item-remove").click();
  await expect(selectedTags(page)).toHaveCount(0);

  // the field is optional: an empty list is a valid configuration
  await card(page).getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByText("Uhu! Salvo com sucesso! :)")).toBeVisible();

  const puts = memoryPuts(mockApi);
  expect(puts).toHaveLength(1);
  expect(JSON.parse(puts[0].postData ?? "{}")).toEqual({
    kind: "map-schedules-fasting",
    value: [],
    unique: true,
  });
});

test("shows the backend message when saving fails", async ({
  page,
  mockApi,
}) => {
  mockApi.override("PUT /admin/memory", {
    status: 400,
    json: { status: "error", message: "Usuário sem permissão" },
  });

  await page.goto("/admin/horarios");
  await expect(selectedTags(page)).toHaveText(["06:00"]);
  const listsBeforeSave = memoryLists(mockApi).length;

  await card(page).getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Usuário sem permissão")).toBeVisible();
  await expect(page.getByText("Uhu! Salvo com sucesso! :)")).toHaveCount(0);
  expect(memoryPuts(mockApi)).toHaveLength(1);
  expect(memoryLists(mockApi)).toHaveLength(listsBeforeSave);
  await expect(selectedTags(page)).toHaveText(["06:00"]);
});

test("warns when the schedules cannot be loaded", async ({ page, mockApi }) => {
  mockApi.override("POST /admin/memory/list", {
    status: 500,
    json: { status: "error", message: "boom" },
  });

  await page.goto("/admin/horarios");

  await expect(
    page.getByText("Ops! Algo de errado aconteceu.").first(),
  ).toBeVisible();
});
