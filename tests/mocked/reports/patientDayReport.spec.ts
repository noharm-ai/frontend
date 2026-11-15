import { gzipSync } from "node:zlib";
import { readFile } from "node:fs/promises";
import dayjs from "dayjs";
import type { Page } from "@playwright/test";

import { test, expect, API_URL } from "../support/mockApi";
import { loginWithAuth } from "../support/featureLogin";

/**
 * Patient-day report (/relatorios/pacientes-dia,
 * src/features/reports/PatientDayReport).
 *
 * GET /reports/general/PATIENT_DAY answers where the cached file of the day
 * is. The file is downloaded, decompressed in the browser and summarized
 * locally (transformers.js): by default from the first day of the month of
 * `header.date - 1 day` to `header.date - 1 day`. Each row is one
 * patient-day; the item-day and lives cards only show for schemas with a
 * CPOE segment.
 */

const REPORT_URL = "/relatorios/pacientes-dia";
const ENDPOINT = "GET /reports/general/PATIENT_DAY";
const CACHE_PATH = "/cache/patient-day.json.gz";

const TODAY = dayjs().startOf("day");
// the report filters up to the day before the file date
const DAY = TODAY.subtract(1, "day").format("YYYY-MM-DD");

type Row = Record<string, unknown>;

const buildRow = (overrides: Row): Row => ({
  date: DAY,
  admissionNumber: 501,
  checked: true,
  itens: 1,
  checkedItens: 1,
  responsible: "Fulano Beltrano",
  department: "Setor Teste A",
  segment: "Segmento A",
  globalScore: 20,
  evaluationTime: null,
  clinicalNote: 0,
  tags: [],
  ...overrides,
});

const ROWS: Row[] = [
  buildRow({ itens: 4, checkedItens: 4, evaluationTime: 150 }),
  buildRow({ checked: false, itens: 2, checkedItens: 0 }),
  buildRow({
    admissionNumber: 502,
    itens: 3,
    checkedItens: 3,
    evaluationTime: 90,
    responsible: "Ciclano de Tal",
    department: "Setor Teste B",
    segment: "Segmento B",
  }),
  buildRow({
    admissionNumber: 503,
    checked: false,
    checkedItens: 0,
    department: "Setor Teste B",
    segment: "Segmento B",
  }),
  // the file day itself is out of the default period
  buildRow({
    date: TODAY.format("YYYY-MM-DD"),
    admissionNumber: 504,
    segment: "Segmento B",
  }),
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

const waitForReport = (page: Page) =>
  expect(page.locator(".report-filter-list")).toContainText(
    dayjs(DAY).format("DD/MM/YY"),
    { timeout: 15000 },
  );

/** The value of the summary card with the given title */
const stat = (page: Page, title: string) =>
  page
    .locator(".stats-title")
    .getByText(title, { exact: true })
    .locator("xpath=following-sibling::div[1]");

const openMenu = (page: Page) =>
  page
    .locator(".ant-float-btn")
    .filter({ has: page.locator('[aria-label="menu"]') })
    .click();

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
  return { header: header.split(","), lines: lines.filter(Boolean) };
};

test("summarizes the patient-days of the default period", async ({
  page,
  mockApi,
}) => {
  mockReport(mockApi, ROWS);
  await page.goto(REPORT_URL);

  await expect(
    page.locator('[data-kb="reports.patientDay.title"]'),
  ).toContainText("Pacientes-Dia");
  await waitForReport(page);

  // 4 rows in the period (the file day is left out), 2 of them checked
  await expect(stat(page, "Total de Pacientes-Dia")).toHaveText("4");
  await expect(stat(page, "Pacientes-Dia Checados")).toHaveText("2");
  await expect(stat(page, "Percentual de Pacientes-Dia")).toHaveText("50%");

  // evaluation time sums and averages only the rows that have one
  await expect(stat(page, "*Tempo Total de Avaliação")).toHaveText("4 min");
  await expect(stat(page, "*Tempo Médio")).toHaveText("2 min");

  // without a CPOE segment there are no item-day nor lives cards
  await expect(stat(page, "Total de Itens-Dia")).toHaveCount(0);
  await expect(stat(page, "Total de Vidas")).toHaveCount(0);
});

test.describe("with a CPOE segment", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("adds the item-day and lives cards", async ({ page, mockApi }) => {
    await loginWithAuth(page, mockApi, {
      segments: [{ id: 1, description: "Adulto", status: 1, cpoe: true }],
    });
    mockReport(mockApi, ROWS);
    await page.goto(REPORT_URL);
    await waitForReport(page);

    // items: 4 + 2 + 3 + 1, checked 4 + 3
    await expect(stat(page, "Total de Itens-Dia")).toHaveText("10");
    await expect(stat(page, "Itens-Dia Checados")).toHaveText("7");
    await expect(stat(page, "Percentual de Itens-Dia")).toHaveText("70%");

    // 3 admissions in the period, 2 with a checked patient-day
    await expect(stat(page, "Total de Vidas")).toHaveText("3");
    await expect(stat(page, "Vidas Impactadas")).toHaveText("2");
    await expect(stat(page, "% de Vidas Impactadas")).toHaveText("67%");
  });
});

test("the segment filter narrows the totals and the CSV", async ({
  page,
  mockApi,
}) => {
  mockReport(mockApi, ROWS);
  await page.goto(REPORT_URL);
  await waitForReport(page);
  await expect(stat(page, "Total de Pacientes-Dia")).toHaveText("4");

  const segmentSelect = page
    .locator(".ant-col")
    .filter({ has: page.getByText("Segmento:", { exact: true }) })
    .locator(".ant-select");
  await segmentSelect.click();
  await page
    .locator(".ant-select-item-option")
    .filter({ hasText: "Segmento B" })
    .click();
  await page.keyboard.press("Escape");
  await page.locator(".gtm-btn-search").click();

  await expect(page.locator(".report-filter-list")).toContainText(
    "Segmento: Segmento B",
  );
  await expect(stat(page, "Total de Pacientes-Dia")).toHaveText("2");
  await expect(stat(page, "Pacientes-Dia Checados")).toHaveText("1");
  await expect(stat(page, "Percentual de Pacientes-Dia")).toHaveText("50%");

  // the CSV exports the same rows the cards count
  const { lines } = await exportCsv(page);
  expect(lines).toHaveLength(2);
  expect(lines.every((line) => line.includes("Segmento B"))).toBe(true);
});
