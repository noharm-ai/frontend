import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Page } from "@playwright/test";

import { test, expect } from "./support/mockApi";
import type { MockApi } from "./support/mockApi";
import { loginWithPermissions } from "./support/featureLogin";
import { fakeJwt } from "./support/token";

/**
 * Local visual regression harness for antd (or other UI-affecting) bumps.
 *
 * Run once at the old version with --update-snapshots to record baselines,
 * then again after the bump to diff pixel-by-pixel. Baselines are
 * machine-specific (font rasterization differs across machines), so the
 * snapshot directory is gitignored and the suite is skipped in CI.
 */
test.skip(
  !!process.env.CI,
  "visual baselines are machine-specific; run locally only",
);

const FIXTURES_DIR = fileURLToPath(new URL("./fixtures", import.meta.url));

// Every run (baseline and after-bump) renders at this exact frozen instant,
// so every date/relative-time on screen is identical between runs.
const FIXED_NOW = new Date("2026-08-20T15:00:00Z");

function loadFixedFixture<T = unknown>(relativePath: string): T {
  const raw = fs.readFileSync(path.join(FIXTURES_DIR, relativePath), "utf-8");
  const hoursFrom = (hours: number) =>
    new Date(FIXED_NOW.getTime() + hours * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19);

  const hydrated = raw
    .replaceAll("__FAKE_JWT__", fakeJwt())
    .replaceAll("__DATE_NOW__", hoursFrom(-2))
    .replaceAll("__DATE_EXPIRE__", hoursFrom(22))
    .replaceAll("__DATE_ADMISSION__", hoursFrom(-5 * 24))
    .replaceAll("__DATE_BIRTH__", "1980-05-10T00:00:00");

  return JSON.parse(hydrated) as T;
}

function freezeDates(mockApi: MockApi) {
  mockApi.override("GET /prescriptions", {
    json: loadFixedFixture("prescriptions/list.json"),
  });
  mockApi.override("GET /prescriptions/:id", {
    json: loadFixedFixture("prescriptions/single-199.json"),
  });
}

async function shoot(page: Page, name: string) {
  await page.evaluate(() => document.fonts.ready);
  // park the pointer so no hover style leaks into the shot
  await page.mouse.move(0, 0);
  await page.waitForTimeout(400);
  await expect(page).toHaveScreenshot(name, {
    fullPage: true,
    animations: "disabled",
    caret: "hide",
    timeout: 15000,
  });
}

test.beforeEach(async ({ page, mockApi }) => {
  await page.clock.setFixedTime(FIXED_NOW);
  freezeDates(mockApi);
});

/* ---------------------------------------------------------------- */
/* unauthenticated                                                    */
/* ---------------------------------------------------------------- */

test.describe("logged out", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByPlaceholder("Email")).toBeVisible();
    await shoot(page, "login.png");
  });
});

/* ---------------------------------------------------------------- */
/* prioritization                                                     */
/* ---------------------------------------------------------------- */

test("prioritization cards", async ({ page }) => {
  await page.goto("/priorizacao/pacientes/cards");
  await page.getByRole("main").getByRole("button", { name: "search" }).click();
  await expect(page.getByText("Paciente 99")).toBeVisible();
  await shoot(page, "prioritization-cards.png");
});

test("prioritization cards - advanced filter open", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /segments/departments", {
    json: { status: "success", data: [] },
  });
  await page.goto("/priorizacao/pacientes/cards");
  await page.getByRole("button", { name: /Ver mais/ }).click();
  // the expand animation is CSS max-height based; give it time to settle
  await page.waitForTimeout(800);
  await shoot(page, "prioritization-filter-open.png");
});

test("prioritization patients table", async ({ page }) => {
  await page.goto("/priorizacao/pacientes");
  await expect(
    page.getByRole("heading", { name: "Priorização por Pacientes" }),
  ).toBeVisible();
  await page.getByRole("main").locator("button.gtm-btn-search").click();
  await expect(page.getByText("Pendente").first()).toBeVisible({
    timeout: 15000,
  });
  await page.waitForTimeout(1500);
  await shoot(page, "prioritization-patients-table.png");
});

test("prioritization prescriptions table", async ({ page }) => {
  await page.goto("/priorizacao/prescricoes");
  await expect(
    page.getByRole("heading", { name: /Priorização/ }),
  ).toBeVisible();
  await page.getByRole("main").locator("button.gtm-btn-search").click();
  await expect(page.locator(".ant-table-tbody tr").first()).toBeVisible({
    timeout: 15000,
  });
  await page.waitForTimeout(1500);
  await shoot(page, "prioritization-prescriptions-table.png");
});

/* ---------------------------------------------------------------- */
/* screening / prescription                                           */
/* ---------------------------------------------------------------- */

const interventionRow = (
  idIntervention: number,
  drugName: string,
  status = "s",
) => ({
  idIntervention,
  id: "0",
  idPrescription: "199",
  idPrescriptionDrug: "0",
  admissionNumber: 9999,
  drugName,
  status,
  date: new Date(FIXED_NOW.getTime() - 3600e3).toISOString().slice(0, 19),
  reasonDescription: "Ajuste de Dose",
});

test("screening page", async ({ page }) => {
  await page.goto("/prescricao/199");
  await expect(page.getByText("Dipirona 500mg").first()).toBeVisible();
  await shoot(page, "screening.png");
});

test("screening page - checked state", async ({ page }) => {
  await page.goto("/prescricao/199");
  await expect(page.getByText("Dipirona 500mg").first()).toBeVisible();
  await page.getByRole("button", { name: "check Checar" }).click();
  await expect(page.getByText("Checada porE2E Test")).toBeVisible();
  await shoot(page, "screening-checked.png");
});

test("screening page - interventions tab", async ({ page, mockApi }) => {
  const fixture = loadFixedFixture<{ data: { interventions: unknown[] } }>(
    "prescriptions/single-199.json",
  );
  fixture.data.interventions = [
    interventionRow(301, "Dipirona 500mg"),
    interventionRow(302, "Omeprazol 20mg"),
  ];
  mockApi.override("GET /prescriptions/:id", { json: fixture });
  mockApi.override("GET /intervention/reasons", {
    json: { status: "success", data: [] },
  });

  await page.goto("/prescricao/199");
  await expect(page.getByText("Dipirona 500mg").first()).toBeVisible();
  await page.getByRole("tab", { name: /Intervenções/ }).click();
  await expect(page.getByText("Ajuste de Dose").first()).toBeVisible();
  await shoot(page, "screening-interventions-tab.png");
});

/* ---------------------------------------------------------------- */
/* interventions list                                                 */
/* ---------------------------------------------------------------- */

test("interventions list page", async ({ page, mockApi }) => {
  mockApi.override("POST /intervention/search", {
    json: {
      status: "success",
      data: [
        interventionRow(301, "Dipirona 500mg"),
        interventionRow(302, "Omeprazol 20mg"),
        interventionRow(306, "Paracetamol 750mg", "a"),
      ].map((r) => ({
        ...r,
        user: "Usuário Teste",
        prescriber: "Dr. Prescritor",
        department: "UTI",
        idInterventionReason: [1],
      })),
    },
  });
  mockApi.override("GET /intervention/reasons", {
    json: { status: "success", data: [] },
  });

  await page.goto("/intervencoes");
  await expect(page.getByText("Dipirona 500mg")).toBeVisible();
  await shoot(page, "interventions-list.png");
});

/* ---------------------------------------------------------------- */
/* admin (fresh login with permissions)                               */
/* ---------------------------------------------------------------- */

const segmentExam = {
  idSegment: 1,
  segment: "Segmento Adulto",
  type: "creatinina",
  initials: "Creat",
  name: "Creatinina",
  min: 0.5,
  max: 1.2,
  ref: "0,5 a 1,2 mg/dL",
  order: 1,
  active: true,
  updatedAt: "2026-01-10T10:00:00",
  tpExamRef: null,
};

const ok = (data: unknown) => ({ json: { status: "success", data } });

test.describe("admin", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("exam config list and modal", async ({ page, mockApi }) => {
    mockApi.override("POST /admin/exam/list", ok([segmentExam]));
    mockApi.override("POST /admin/exam/get", ok(segmentExam));
    mockApi.override("GET /admin/exam/types", ok(["creatinina", "hb"]));
    mockApi.override("GET /admin/exam/list-global", ok([]));
    mockApi.override(
      "GET /user-admin/contact-list",
      ok([{ id: 9, name: "Ana Gestora", email: "ana@example.com" }]),
    );

    await loginWithPermissions(page, mockApi, [
      "READ_BASIC_FEATURES",
      "READ_PRESCRIPTION",
      "READ_CONFIG_EXAMS",
      "WRITE_CONFIG_EXAMS",
    ]);
    await page.clock.setFixedTime(FIXED_NOW);

    await page.goto("/admin/exames");
    await expect(page.getByRole("heading", { name: "Exames" })).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "Creatinina", exact: true }),
    ).toBeVisible();
    await shoot(page, "admin-exams.png");

    const action = page.locator(".gtm-bt-view-exam");
    await action.click();
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await page.waitForTimeout(500);
    await shoot(page, "admin-exams-modal.png");
  });
});
