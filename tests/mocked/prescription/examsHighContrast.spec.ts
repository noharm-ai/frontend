import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loginWithAuth } from "../support/featureLogin";
import { loadFixture } from "../support/defaultHandlers";

/**
 * The "Alto contraste" preference (see userProfile.spec.ts) also restyles the
 * exams card of the screening: an out-of-range exam is told apart by a thick
 * dark red border, not only by its pink fill, and the card frame is outlined.
 */
const exam = (initials: string, alert: boolean) => ({
  key: initials.toLowerCase(),
  value: {
    value: alert ? 1.8 : 0.9,
    unit: "mg/dL",
    alert,
    date: null,
    ref: null,
    initials,
    name: initials,
    delta: null,
  },
});

const mockPrescriptionWithExams = (mockApi: MockApi) => {
  const fixture = loadFixture<{ data: Record<string, unknown> }>(
    "prescriptions/single-199.json",
  );
  mockApi.override("GET /prescriptions/:id", {
    json: {
      ...fixture,
      data: { ...fixture.data, exams: [exam("Cr", true), exam("Ur", false)] },
    },
  });
};

const openScreening = async (page: Page) => {
  await page.goto("/prescricao/199");
  await expect(page.getByText("Dipirona 500mg")).toBeVisible();
};

const examItem = (page: Page, initials: string) =>
  page
    .locator('[data-kb="prescription.exams"]')
    .locator(".name")
    .getByText(initials, { exact: true })
    .locator("xpath=..");

test.describe("screening exams card: high contrast", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("keeps the default look when the preference is off", async ({
    page,
    mockApi,
  }) => {
    mockPrescriptionWithExams(mockApi);
    await loginWithAuth(page, mockApi, {});
    await openScreening(page);

    await expect(examItem(page, "Cr")).toHaveCSS(
      "border",
      "1px solid rgb(246, 140, 151)",
    );
    await expect(examItem(page, "Ur")).toHaveCSS("border-top-width", "1px");
    await expect(examItem(page, "Ur")).not.toHaveCSS(
      "border-top-color",
      "rgb(118, 118, 118)",
    );
  });

  test("marks the out-of-range exam with a thick dark red border", async ({
    page,
    mockApi,
  }) => {
    mockPrescriptionWithExams(mockApi);
    await loginWithAuth(page, mockApi, {
      preferences: {
        app: { initialPage: "/prescricao/199", highContrast: true },
      },
    });
    await openScreening(page);

    await expect(examItem(page, "Cr")).toHaveCSS(
      "border",
      "2px solid rgb(168, 7, 26)",
    );
    // the exam in range only reads the darker theme border
    await expect(examItem(page, "Ur")).toHaveCSS(
      "border",
      "1px solid rgb(118, 118, 118)",
    );
  });
});
