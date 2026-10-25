import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";

/**
 * Admin features (/admin/features, features/admin/Memory/Features).
 *
 * The "features" memory kind holds the ids of the schema-wide features turned
 * on; the page lists every toggleable feature (models/Feature.getFeatures) as
 * a checkbox. Saving writes the kind as a unique record and reloads it.
 *
 * The list request counts are compared before and after an action: the dev
 * server runs React.StrictMode, which mounts the page (and loads it) twice.
 */

const memoryList = (features: string[]) => ({
  status: "success",
  data: [{ key: 1, kind: "features", value: features }],
});

const installHandlers = (mockApi: MockApi) => {
  mockApi.override("POST /admin/memory/list", {
    json: memoryList(["MICROMEDEX", "CONCILIATION"]),
  });
  mockApi.override("PUT /admin/memory", {
    json: { status: "success", data: 1 },
  });
};

const featureCheckbox = (page: Page, label: string) =>
  page.getByRole("checkbox", { name: label, exact: true });

const memoryPuts = (mockApi: MockApi) =>
  mockApi.requests.filter(
    (r) => r.method === "PUT" && r.path === "/admin/memory",
  );

const memoryLists = (mockApi: MockApi) =>
  mockApi.requests.filter((r) => r.path === "/admin/memory/list");

test.beforeEach(async ({ mockApi }) => {
  installHandlers(mockApi);
});

test("lists the features and checks the enabled ones", async ({
  page,
  mockApi,
}) => {
  await page.goto("/admin/features");

  await expect(
    page.getByRole("heading", { name: "Features", exact: true }),
  ).toBeVisible();

  await expect(featureCheckbox(page, "Bulário")).toBeChecked();
  await expect(featureCheckbox(page, "Conciliação")).toBeChecked();
  await expect(featureCheckbox(page, "Primary Care")).not.toBeChecked();
  await expect(featureCheckbox(page, "OAUTH")).not.toBeChecked();

  // each feature carries its description
  await expect(
    page.getByText("Habilita a funcionalidade de Conciliação da NoHarm", {
      exact: true,
    }),
  ).toBeVisible();

  const body = JSON.parse(memoryLists(mockApi)[0].postData ?? "{}");
  expect(body).toEqual({ kinds: ["features"] });
});

test("saves the toggled features as a unique record and reloads", async ({
  page,
  mockApi,
}) => {
  await page.goto("/admin/features");
  await expect(featureCheckbox(page, "Bulário")).toBeChecked();

  await featureCheckbox(page, "Bulário").uncheck();
  await featureCheckbox(page, "Primary Care").check();

  mockApi.override("POST /admin/memory/list", {
    json: memoryList(["CONCILIATION", "PRIMARYCARE"]),
  });
  const listsBeforeSave = memoryLists(mockApi).length;
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Uhu! Salvo com sucesso! :)")).toBeVisible();

  const puts = memoryPuts(mockApi);
  expect(puts).toHaveLength(1);
  expect(JSON.parse(puts[0].postData ?? "{}")).toEqual({
    kind: "features",
    value: ["CONCILIATION", "PRIMARYCARE"],
    unique: true,
  });
  await expect
    .poll(() => memoryLists(mockApi).length)
    .toBe(listsBeforeSave + 1);

  // the reloaded record drives the checkboxes
  await expect(featureCheckbox(page, "Primary Care")).toBeChecked();
  await expect(featureCheckbox(page, "Bulário")).not.toBeChecked();
});

test("starts with every feature off when the schema has none", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /admin/memory/list", {
    json: { status: "success", data: [] },
  });

  await page.goto("/admin/features");
  await expect(featureCheckbox(page, "Bulário")).toBeVisible();
  await expect(page.getByRole("checkbox", { checked: true })).toHaveCount(0);

  await featureCheckbox(page, "OAUTH").check();
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByText("Uhu! Salvo com sucesso! :)")).toBeVisible();

  const puts = memoryPuts(mockApi);
  expect(puts).toHaveLength(1);
  expect(JSON.parse(puts[0].postData ?? "{}")).toEqual({
    kind: "features",
    value: ["OAUTH"],
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

  await page.goto("/admin/features");
  await expect(featureCheckbox(page, "Bulário")).toBeChecked();
  const listsBeforeSave = memoryLists(mockApi).length;

  await featureCheckbox(page, "OAUTH").check();
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Usuário sem permissão")).toBeVisible();
  await expect(page.getByText("Uhu! Salvo com sucesso! :)")).toHaveCount(0);
  expect(memoryPuts(mockApi)).toHaveLength(1);
  expect(memoryLists(mockApi)).toHaveLength(listsBeforeSave);
});
