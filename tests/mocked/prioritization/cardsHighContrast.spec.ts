import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import { loginWithAuth } from "../support/featureLogin";

/**
 * The "Alto contraste" preference (see userProfile.spec.ts) also restyles the
 * prioritization cards: the card gets an outline instead of a soft shadow and
 * the patient name and borders read the darker palette.
 */
const cardOf = (page: Page) =>
  page.getByRole("link").filter({ hasText: "Paciente 99" });

const searchCards = async (page: Page) => {
  await page.goto("/priorizacao/pacientes/cards");
  await page.getByRole("main").getByRole("button", { name: "search" }).click();
  await expect(page.getByText("Paciente 99")).toBeVisible();
};

test.describe("prioritization cards: high contrast", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("keeps the default look when the preference is off", async ({
    page,
    mockApi,
  }) => {
    await loginWithAuth(page, mockApi, {});
    await searchCards(page);

    const card = cardOf(page);
    await expect(card).toHaveCSS("box-shadow", /rgba\(0, 0, 0, 0\.16\)/);
    await expect(card.locator(".card-header .name")).toHaveCSS(
      "color",
      "rgb(105, 103, 102)",
    );
  });

  test("outlines the card and darkens its text when the preference is on", async ({
    page,
    mockApi,
  }) => {
    await loginWithAuth(page, mockApi, {
      preferences: {
        app: {
          initialPage: "/priorizacao/pacientes/cards",
          highContrast: true,
        },
      },
    });
    await searchCards(page);

    const card = cardOf(page);
    await expect(card).toHaveCSS(
      "box-shadow",
      "rgb(118, 118, 118) 0px 0px 0px 1px",
    );
    await expect(card.locator(".card-header .name")).toHaveCSS(
      "color",
      "rgb(31, 31, 31)",
    );
    await expect(card.locator(".card-header")).toHaveCSS(
      "border-bottom-color",
      "rgb(118, 118, 118)",
    );
  });
});
