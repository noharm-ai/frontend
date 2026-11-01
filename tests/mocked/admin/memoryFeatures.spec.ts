import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";

/**
 * Admin features (/admin/features, features/admin/Memory/Features).
 *
 * The page edits the single "features" memory record: a checkbox per
 * feature flag, saved as a unique record. The list request counts are
 * compared before and after an action because the dev server runs
 * React.StrictMode, which mounts the page (and loads it) twice.
 */

const memoryList = (features: string[]) => ({
  status: "success",
  data: [{ key: 1, kind: "features", value: features }],
});

const memoryPuts = (mockApi: MockApi) =>
  mockApi.requests.filter(
    (r) => r.method === "PUT" && r.path === "/admin/memory",
  );

const memoryLists = (mockApi: MockApi) =>
  mockApi.requests.filter((r) => r.path === "/admin/memory/list");

const featureBox = (page: Page, label: string) =>
  page.getByRole("checkbox", { name: label, exact: true });

test.beforeEach(async ({ mockApi }) => {
  mockApi.override("POST /admin/memory/list", {
    json: memoryList(["MICROMEDEX"]),
  });
  mockApi.override("PUT /admin/memory", {
    json: { status: "success", data: 1 },
  });
});

test("loads the features record and checks the enabled flags", async ({
  page,
  mockApi,
}) => {
  await page.goto("/admin/features");

  await expect(
    page.getByRole("heading", { name: "Features", exact: true }),
  ).toBeVisible();
  await expect(featureBox(page, "Bulário")).toBeChecked();
  await expect(featureBox(page, "Primary Care")).not.toBeChecked();
  await expect(featureBox(page, "Conciliação")).not.toBeChecked();

  const body = JSON.parse(memoryLists(mockApi)[0].postData ?? "{}");
  expect(body).toEqual({ kinds: ["features"] });
});

test("saves the checked flags as a unique record and reloads", async ({
  page,
  mockApi,
}) => {
  await page.goto("/admin/features");
  await expect(featureBox(page, "Bulário")).toBeChecked();

  await featureBox(page, "Primary Care").check();
  await featureBox(page, "Bulário").uncheck();

  // the reload after saving brings the new record back from the backend
  mockApi.override("POST /admin/memory/list", {
    json: memoryList(["PRIMARYCARE"]),
  });
  const listsBeforeSave = memoryLists(mockApi).length;
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Uhu! Salvo com sucesso! :)")).toBeVisible();

  const puts = memoryPuts(mockApi);
  expect(puts).toHaveLength(1);
  expect(JSON.parse(puts[0].postData ?? "{}")).toEqual({
    kind: "features",
    value: ["PRIMARYCARE"],
    unique: true,
  });
  await expect
    .poll(() => memoryLists(mockApi).length)
    .toBe(listsBeforeSave + 1);
  await expect(featureBox(page, "Primary Care")).toBeChecked();
  await expect(featureBox(page, "Bulário")).not.toBeChecked();
});

test("shows the backend message when saving fails and does not reload", async ({
  page,
  mockApi,
}) => {
  mockApi.override("PUT /admin/memory", {
    status: 400,
    json: { status: "error", message: "Usuário sem permissão" },
  });

  await page.goto("/admin/features");
  await expect(featureBox(page, "Bulário")).toBeChecked();
  const listsBeforeSave = memoryLists(mockApi).length;

  await featureBox(page, "Conciliação").check();
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Usuário sem permissão")).toBeVisible();
  expect(memoryPuts(mockApi)).toHaveLength(1);
  expect(memoryLists(mockApi)).toHaveLength(listsBeforeSave);
});

test("shows the generic error when the features cannot be loaded", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /admin/memory/list", {
    status: 500,
    json: { status: "error", message: "Internal server error" },
  });

  await page.goto("/admin/features");

  await expect(
    page.getByText("Ops! Algo de errado aconteceu.").first(),
  ).toBeVisible();
  expect(memoryPuts(mockApi)).toHaveLength(0);
});
