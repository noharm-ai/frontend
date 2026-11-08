import { gzipSync } from "node:zlib";
import { readFile } from "node:fs/promises";
import dayjs from "dayjs";
import type { Page } from "@playwright/test";

import { test, expect, API_URL } from "../support/mockApi";
import { openMoreFilters } from "../support/advancedFilter";

/**
 * Prescription audit report (/relatorios/audit,
 * src/features/reports/PrescriptionAuditReport).
 *
 * GET /reports/general/PRESCRIPTION_AUDIT answers where the cached file of
 * the day is (or that it was not processed yet). The file is downloaded,
 * decompressed in the browser and filtered locally: by default from the first
 * day of the month of `header.date - 1 day` to `header.date - 1 day`.
 * Each row is a check/uncheck action (`type`: checagem | deschecagem).
 */

const REPORT_URL = "/relatorios/audit";
const ENDPOINT = "GET /reports/general/PRESCRIPTION_AUDIT";
const CACHE_PATH = "/cache/audit.json.gz";

const TODAY = dayjs().startOf("day");
// the report filters up to the day before the file date
const DAY = TODAY.subtract(1, "day");

type Row = Record<string, unknown>;

const buildRow = (index: number, overrides: Row = {}): Row => ({
  date: `${DAY.format("YYYY-MM-DD")}T09:${String(index).padStart(2, "0")}:00`,
  type: "checagem",
  agg: false,
  idPrescription: `${9000 + index}`,
  admissionNumber: `${500 + index}`,
  responsible: "Fulano Beltrano",
  department: "Setor Teste",
  segment: "Segmento Teste",
  tags: [],
  ...overrides,
});

const ROWS: Row[] = [
  buildRow(1),
  buildRow(2, { type: "deschecagem", responsible: "Ciclano de Tal" }),
  buildRow(3),
];

const mockReport = (mockApi: any, rows: Row[]) => {
  mockApi.override(ENDPOINT, {
    json: {
      status: "success",
      data: {
        cached: true,
        url: `${API_URL}${CACHE_PATH}`,
        availableReports: [],
      },
    },
  });

  const file = {
    header: {
      date: TODAY.format("YYYY-MM-DDTHH:mm:ss"),
      dateRange: "60",
      updatedAt: TODAY.format("YYYY-MM-DDTHH:mm:ss"),
      version: "1.0",
      count: rows.length,
      type: "current",
    },
    body: rows,
  };

  mockApi.override(`GET ${CACHE_PATH}`, (route: any) =>
    route.fulfill({
      status: 200,
      contentType: "application/octet-stream",
      body: gzipSync(Buffer.from(JSON.stringify(file))),
    }),
  );
};

const openMenu = (page: Page) =>
  page
    .locator(".ant-float-btn")
    .filter({ has: page.locator('[aria-label="menu"]') })
    .click();

// first column of the CSV (DATA) is enough to count the exported rows
const exportCsv = async (page: Page) => {
  await openMenu(page);
  const downloadPromise = page.waitForEvent("download");
  await page
    .locator(".ant-float-btn")
    .filter({ has: page.locator('[aria-label="download"]') })
    .click();
  const download = await downloadPromise;

  const csv = await readFile(await download.path(), "utf8");
  const [header, ...lines] = csv.split("\r\n");
  return { header: header.split(","), lines };
};

test("describes the default period of the loaded file", async ({
  page,
  mockApi,
}) => {
  mockReport(mockApi, ROWS);

  await page.goto(REPORT_URL);

  await expect(
    page.locator('[data-kb="reports.prescriptionAudit.title"]'),
  ).toContainText("Auditoria");
  await expect(page.locator(".report-filter-list")).toContainText(
    DAY.format("DD/MM/YY"),
    { timeout: 15000 },
  );
});

test("tells the report was not processed yet", async ({ page, mockApi }) => {
  mockApi.override(ENDPOINT, {
    json: { status: "success", data: { cached: false } },
  });

  await page.goto(REPORT_URL);

  // the dev server runs React.StrictMode, which mounts the page (and so
  // opens the modal) twice
  const modal = page.getByRole("dialog").last();
  await expect(modal).toContainText("Não foi possível exibir este relatório.");
  await expect(modal).toContainText("ainda não foi processado");
});

test("offers a retry when the report request fails", async ({
  page,
  mockApi,
}) => {
  mockApi.override(ENDPOINT, {
    status: 500,
    json: { status: "error", message: "boom" },
  });

  await page.goto(REPORT_URL);

  // the dev server runs React.StrictMode, which mounts the page (and so
  // opens the modal) twice
  const modal = page.getByRole("dialog").last();
  await expect(modal).toContainText("Não foi possível exibir este relatório.");

  // the backend recovers: "Tentar novamente" asks the report again
  mockReport(mockApi, ROWS);
  const before = mockApi.requests.length;
  await modal.getByRole("button", { name: "Tentar novamente" }).click();
  await expect.poll(() => mockApi.requests.length).toBeGreaterThan(before);
  await expect(page.locator(".report-filter-list")).toContainText(
    DAY.format("DD/MM/YY"),
    { timeout: 15000 },
  );
});

test("exports every action of the period as CSV", async ({ page, mockApi }) => {
  mockReport(mockApi, ROWS);
  await page.goto(REPORT_URL);
  await expect(page.locator(".report-filter-list")).toContainText(
    DAY.format("DD/MM/YY"),
    { timeout: 15000 },
  );

  const { header, lines } = await exportCsv(page);

  expect(header).toContain("DATA");
  expect(header).toContain("RESPONSAVEL");
  expect(header.filter((name) => name.startsWith("reportcsv."))).toEqual([]);
  expect(lines).toHaveLength(ROWS.length);
});

test("the action filter limits what the CSV exports", async ({
  page,
  mockApi,
}) => {
  mockReport(mockApi, ROWS);
  await page.goto(REPORT_URL);
  await expect(page.locator(".report-filter-list")).toContainText(
    DAY.format("DD/MM/YY"),
    { timeout: 15000 },
  );

  await openMoreFilters(page);
  await page.locator("label").filter({ hasText: "Deschecar" }).click();
  await page.locator(".gtm-btn-search").click();
  await expect(page.locator(".report-filter-list")).toContainText(
    "Tipo de evento",
  );

  const { lines } = await exportCsv(page);

  expect(lines).toHaveLength(1);
  expect(lines[0]).toContain("deschecagem");
});
