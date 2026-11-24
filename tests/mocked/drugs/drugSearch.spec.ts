import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loginWithFeatures } from "../support/featureLogin";
import { openSelectById } from "../support/antd";

/**
 * Shared drug lookups (src/features/drugs/DrugsSlice): the drug search, the
 * frequency list and the drug summary/resources used by the prioritization
 * filter, the drug dashboard, the intervention form and the prescription drug
 * form.
 *
 * Covers the success and error path of each lookup so the move from the
 * legacy `drugs` duck to Redux Toolkit can be checked against the same spec.
 */

const ok = (data: unknown) => ({ json: { status: "success", data } });
const serverError = {
  status: 500,
  json: { status: "error", message: "Erro inesperado" },
};

const DRUGS = [
  { idDrug: 5100, name: "Dipirona 500mg comprimido" },
  { idDrug: 5200, name: "Paracetamol 750mg comprimido" },
];

const FREQUENCIES = [
  { id: "6", description: "6/6h" },
  { id: "8", description: "8/8h" },
];

const RESOURCES = {
  drug: { id: 10, name: "Dipirona 500mg" },
  units: [{ id: "mg", description: "Miligrama" }],
  routes: [{ id: "Oral", description: "Oral" }],
  frequencies: [
    { id: "6", description: "6/6h" },
    { id: "12", description: "12/12h" },
  ],
};

const requestsTo = (mockApi: MockApi, path: string | RegExp) =>
  mockApi.requests.filter((r) =>
    typeof path === "string" ? r.path === path : path.test(r.path),
  );

const dropdown = (page: Page) =>
  page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)");

async function openPrioritizationFilter(page: Page, mockApi: MockApi) {
  mockApi.override("GET /segments/departments", ok([]));
  await page.goto("/priorizacao/pacientes/cards");
  await page.getByRole("button", { name: "Ver mais" }).click();
  await expect(page.locator("#drugs-filter")).toBeVisible();
}

test.describe("prioritization filter", () => {
  test("searches drugs by name and lists the results", async ({
    page,
    mockApi,
  }) => {
    mockApi.override("GET /drugs", ok(DRUGS));
    await openPrioritizationFilter(page, mockApi);

    const searched = page.waitForRequest(
      (r) => new URL(r.url()).pathname === "/drugs",
    );
    await page.locator("#drugs-filter").pressSequentially("para");
    const params = new URL((await searched).url()).searchParams;
    expect(params.get("q")).toBe("para");
    expect(params.get("group")).toBe("0");

    await expect(
      dropdown(page).getByText("Paracetamol 750mg comprimido"),
    ).toBeVisible();
    await expect(
      dropdown(page).getByText("Dipirona 500mg comprimido"),
    ).toBeVisible();
  });

  test("shows no drug when the search fails", async ({ page, mockApi }) => {
    mockApi.override("GET /drugs", serverError);
    await openPrioritizationFilter(page, mockApi);

    await page.locator("#drugs-filter").pressSequentially("para");
    await expect.poll(() => requestsTo(mockApi, "/drugs").length).toBe(1);

    await expect(dropdown(page).locator(".ant-select-item-option")).toHaveCount(
      0,
    );

    // the search still works after the failure
    mockApi.override("GET /drugs", ok(DRUGS));
    await page.locator("#drugs-filter").pressSequentially("c");
    await expect(
      dropdown(page).getByText("Paracetamol 750mg comprimido"),
    ).toBeVisible();
  });

  test("loads the frequencies once, on the first open", async ({
    page,
    mockApi,
  }) => {
    mockApi.override("GET /drugs/frequencies", ok(FREQUENCIES));
    await openPrioritizationFilter(page, mockApi);

    expect(requestsTo(mockApi, "/drugs/frequencies")).toHaveLength(0);
    await openSelectById(page, "frequencies-filter");

    await expect(dropdown(page).getByText("6/6h (6)")).toBeVisible();
    await expect(dropdown(page).getByText("8/8h (8)")).toBeVisible();

    // a loaded list is not fetched again
    await page.keyboard.press("Escape");
    await openSelectById(page, "frequencies-filter");
    await expect(dropdown(page).getByText("6/6h (6)")).toBeVisible();
    expect(requestsTo(mockApi, "/drugs/frequencies")).toHaveLength(1);
  });

  test("retries the frequencies after a failed load", async ({
    page,
    mockApi,
  }) => {
    mockApi.override("GET /drugs/frequencies", serverError);
    await openPrioritizationFilter(page, mockApi);

    await openSelectById(page, "frequencies-filter");
    await expect
      .poll(() => requestsTo(mockApi, "/drugs/frequencies").length)
      .toBe(1);
    await expect(dropdown(page).locator(".ant-select-item-option")).toHaveCount(
      0,
    );

    // the list is still empty, so the next open asks again
    mockApi.override("GET /drugs/frequencies", ok(FREQUENCIES));
    await page.keyboard.press("Escape");
    await openSelectById(page, "frequencies-filter");
    await expect(dropdown(page).getByText("8/8h (8)")).toBeVisible();
    expect(requestsTo(mockApi, "/drugs/frequencies")).toHaveLength(2);
  });
});

test.describe("prescription drug form", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  const RESOURCES_PATH = "/drugs/resources/10/1";

  async function openEditForm(page: Page, mockApi: MockApi) {
    // the PRIMARYCARE prioritization page fetches these on login
    mockApi.override("GET /segments/departments", ok([]));
    mockApi.override("POST /patient/list", ok([]));

    await loginWithFeatures(page, mockApi, ["PRIMARYCARE"]);
    await page.goto("/prescricao/199");
    await expect(page.getByText("Dipirona 500mg").first()).toBeVisible();

    await page.locator(".gtm-bt-extra-actions").first().click();
    await page.getByRole("menuitem", { name: "Editar", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Alterar medicamento" }),
    ).toBeVisible();
    await expect
      .poll(() => requestsTo(mockApi, /^\/drugs\/resources\//).length)
      .toBeGreaterThan(0);
    expect(
      requestsTo(mockApi, /^\/drugs\/resources\//).every(
        (r) => r.path === RESOURCES_PATH,
      ),
    ).toBe(true);
  }

  test("loads the drug resources into the form options", async ({
    page,
    mockApi,
  }) => {
    mockApi.override("GET /drugs/resources/:idDrug/:idSegment", ok(RESOURCES));
    await openEditForm(page, mockApi);

    await expect(page.locator(".ant-modal #dose")).toBeVisible();
    await openSelectById(page, "frequency");
    await expect(dropdown(page).getByText("12/12h")).toBeVisible();
  });

  test("keeps the form loading when the resources fail", async ({
    page,
    mockApi,
  }) => {
    mockApi.override("GET /drugs/resources/:idDrug/:idSegment", serverError);
    await openEditForm(page, mockApi);

    // without a summary the form never shows its fields, but can be closed
    await expect(page.locator(".ant-modal #dose")).toHaveCount(0);
    await page.getByRole("button", { name: "Cancelar" }).click();
    await expect(
      page.getByRole("heading", { name: "Alterar medicamento" }),
    ).toBeHidden();
  });
});

test.describe("intervention transcription", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  async function openTranscription(page: Page, mockApi: MockApi) {
    mockApi.override("GET /intervention/reasons", ok([]));

    await loginWithFeatures(page, mockApi, ["TRANSCRIPTION"]);
    await page.goto("/prescricao/199");
    await expect(page.getByText("Dipirona 500mg").first()).toBeVisible();

    await page.locator(".gtm-bt-interv").first().click();
    const modal = page.locator(".ant-modal");
    await expect(modal).toBeVisible();
    // the closest block around the label that holds a switch is its own
    await modal
      .getByText("Transcrição:", { exact: true })
      .locator("xpath=ancestor::*[.//button[@role='switch']][1]")
      .getByRole("switch")
      .click();

    await expect
      .poll(() => requestsTo(mockApi, /^\/drugs\/summary\//).length)
      .toBeGreaterThan(0);
    expect(
      requestsTo(mockApi, /^\/drugs\/summary\//).every(
        (r) => r.path === "/drugs/summary/1/10",
      ),
    ).toBe(true);
  }

  test("loads the drug summary into the transcription options", async ({
    page,
    mockApi,
  }) => {
    mockApi.override("GET /drugs/summary/:idSegment/:idDrug", ok(RESOURCES));
    await openTranscription(page, mockApi);

    await openSelectById(page, "frequency");
    await expect(dropdown(page).getByText("12/12h")).toBeVisible();
  });

  test("shows the transcription without options when the summary fails", async ({
    page,
    mockApi,
  }) => {
    mockApi.override("GET /drugs/summary/:idSegment/:idDrug", serverError);
    await openTranscription(page, mockApi);

    await expect(page.locator(".ant-modal #dose")).toBeVisible();
    await openSelectById(page, "frequency");
    await expect(dropdown(page).getByText("12/12h")).toHaveCount(0);
  });
});
