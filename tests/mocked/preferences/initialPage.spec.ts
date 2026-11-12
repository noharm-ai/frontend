import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";

/**
 * "Definir como Página Inicial" (src/features/preferences/InitialPage).
 *
 * Shown in the header of the prioritization pages that are not the user's
 * initial page yet. Clicking it stores the current path in the preferences
 * (redux-persist) and saves them in a unique memory record per user. The
 * save is fire-and-forget: the success toast shows and the button goes away
 * even when the backend fails.
 */

const PRESCRIPTIONS_PAGE = "/priorizacao/prescricoes";
const CARDS_PAGE = "/priorizacao/pacientes/cards";
const PREFERENCES_KEY = "PUT /memory/unique/user-preferences-1";

const setInitialPageButton = (page: Page) =>
  page.getByRole("button", { name: "Definir como Página Inicial" });

const preferencesCalls = (mockApi: MockApi) =>
  mockApi.requests.filter(
    (r) => r.method === "PUT" && r.path === "/memory/unique/user-preferences-1",
  );

test("is hidden on the current initial page", async ({ page }) => {
  await page.goto(CARDS_PAGE);
  await expect(page.locator('[data-kb="prioritization.title"]')).toBeVisible();

  await expect(setInitialPageButton(page)).toHaveCount(0);
});

test("saves the current page as the initial page", async ({
  page,
  mockApi,
}) => {
  mockApi.override(PREFERENCES_KEY, {
    json: { status: "success", data: 1 },
  });
  await page.goto(PRESCRIPTIONS_PAGE);

  await setInitialPageButton(page).click();

  await expect(
    page.getByText("Página Inicial definida com sucesso."),
  ).toBeVisible();
  await expect(setInitialPageButton(page)).toHaveCount(0);

  await expect.poll(() => preferencesCalls(mockApi).length).toBe(1);
  const saved = JSON.parse(preferencesCalls(mockApi)[0].postData!);
  expect(saved.value.app.initialPage).toBe(PRESCRIPTIONS_PAGE);
  expect(saved.value.prescription).toBeDefined();
  expect(saved.value).not.toHaveProperty("_persist");

  // the previous initial page now offers the button
  await page.goto(CARDS_PAGE);
  await expect(setInitialPageButton(page)).toBeVisible();
});

test("keeps the choice locally when the save fails", async ({
  page,
  mockApi,
}) => {
  mockApi.override(PREFERENCES_KEY, {
    status: 500,
    json: { status: "error", message: "Erro inesperado" },
  });
  await page.goto(PRESCRIPTIONS_PAGE);

  await setInitialPageButton(page).click();

  await expect.poll(() => preferencesCalls(mockApi).length).toBe(1);
  await expect(
    page.getByText("Página Inicial definida com sucesso."),
  ).toBeVisible();
  await expect(setInitialPageButton(page)).toHaveCount(0);
});
