import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loginWithAuth, loginWithPermissions } from "../support/featureLogin";
import { NAVIGATION_VIEWER_PERMISSIONS } from "../support/navigationViewer";

/**
 * NAVIGATION_VIEWER: a navigator that only views.
 *
 * READ_NAV used to gate both what a navigator sees and what it does. It now
 * only opens the navigation data and settings; the actions moved to WRITE_NAV
 * (SOAP generation, digital signature, care plan), which this role lacks.
 * Each check runs against a navigator as well, so a button that never renders
 * cannot pass for one that is hidden.
 */

const NAVIGATOR_PERMISSIONS = [...NAVIGATION_VIEWER_PERMISSIONS, "WRITE_NAV"];

const ADMISSION = 9999;

const notesPayload = {
  status: "success",
  data: {
    notes: [
      {
        id: "555",
        admissionNumber: ADMISSION,
        text: "Evolução de teste da navegação",
        date: "2024-01-02T03:04:05",
        prescriber: "Fulano Beltrano",
        position: "Consulta de enfermagem",
        form: null,
        template: null,
      },
    ],
    dates: [{ date: "2024-01-02", total: 1, roles: ["Enfermagem"] }],
    previousAdmissions: [],
  },
};

// icon-only buttons: the antd icon carries the accessible label
const printButton = (page: Page) =>
  page.locator('button:has([aria-label="printer"])');
const signatureButton = (page: Page) =>
  page.locator('button:has([aria-label="signature"])');
const soapButton = (page: Page) =>
  page.locator('button:has([aria-label="file-text"])');

async function openNotes(page: Page, mockApi: MockApi) {
  mockApi.override("GET /notes/:admissionNumber/v2", { json: notesPayload });
  await page.goto(`/prescricao/evolucao/${ADMISSION}`);
  await expect(
    page.getByText("Evolução de teste da navegação").first(),
  ).toBeVisible();
}

/** Opens Configurações until its items render (the submenu opens on hover) */
async function openConfigMenu(page: Page) {
  await expect(async () => {
    await page
      .locator(".ant-menu-submenu-title")
      .filter({ hasText: "Configurações" })
      .hover({ timeout: 2000 });
    await expect(page.locator("#gtm-lnk-memory")).toBeVisible({
      timeout: 2000,
    });
  }).toPass({ timeout: 10000 });
}

/** The PRIMARYCARE landing page loads these right after login */
function stubPrimaryCareLanding(mockApi: MockApi) {
  mockApi.override("GET /segments/departments", {
    json: { status: "success", data: [] },
  });
  mockApi.override("POST /patient/list", {
    json: { status: "success", data: [] },
  });
}

test.use({ storageState: { cookies: [], origins: [] } });

test("the navigation settings pages are in the menu", async ({
  page,
  mockApi,
}) => {
  await loginWithPermissions(page, mockApi, NAVIGATION_VIEWER_PERMISSIONS);

  await openConfigMenu(page);
  await expect(page.locator("#gtm-lnk-customForms")).toBeVisible();
});

test("a note can be printed but not turned into SOAP or signed", async ({
  page,
  mockApi,
}) => {
  await loginWithPermissions(page, mockApi, NAVIGATION_VIEWER_PERMISSIONS);
  await openNotes(page, mockApi);

  await expect(printButton(page)).toBeVisible();
  await expect(soapButton(page)).toHaveCount(0);
  await expect(signatureButton(page)).toHaveCount(0);
});

test("a navigator still gets the note actions", async ({ page, mockApi }) => {
  await loginWithPermissions(page, mockApi, NAVIGATOR_PERMISSIONS);
  await openNotes(page, mockApi);

  await expect(printButton(page)).toBeVisible();
  await expect(soapButton(page)).toBeVisible();
  await expect(signatureButton(page)).toBeVisible();
});

test.describe("care plan (PRIMARYCARE)", () => {
  for (const { who, permissions, count } of [
    {
      who: "a navigation viewer",
      permissions: NAVIGATION_VIEWER_PERMISSIONS,
      count: 0,
    },
    { who: "a navigator", permissions: NAVIGATOR_PERMISSIONS, count: 1 },
  ]) {
    test(`${who} ${count ? "opens" : "does not get"} the care plan`, async ({
      page,
      mockApi,
    }) => {
      stubPrimaryCareLanding(mockApi);
      await loginWithAuth(page, mockApi, {
        features: ["PRIMARYCARE"],
        permissions,
      });

      await page.goto("/prescricao/199");
      await expect(page.getByText("Dipirona 500mg")).toBeVisible();

      await expect(page.locator(".gtm-bt-care-plan")).toHaveCount(count);
    });
  }
});
