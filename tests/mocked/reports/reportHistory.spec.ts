import { gzipSync } from "node:zlib";
import dayjs from "dayjs";
import type { Page, Route } from "@playwright/test";

import { test, expect, API_URL } from "../support/mockApi";

/**
 * Report history (src/features/reports/components/HistoryModal and
 * HistoryAlert), shared by the consolidated reports. Exercised through the
 * prescription audit report (/relatorios/audit).
 *
 * GET /reports/general/PRESCRIPTION_AUDIT lists the archived files in
 * `availableReports`; picking one asks the same endpoint with
 * `?filename=<name>` and the alert above the filters tells which month is
 * on screen, with a button back to the current report.
 */

const REPORT_URL = "/relatorios/audit";
const ENDPOINT = "GET /reports/general/PRESCRIPTION_AUDIT";
const CURRENT_CACHE = "/cache/audit-current.json.gz";
const ARCHIVE_CACHE = "/cache/audit-archive.json.gz";

const TODAY = dayjs().startOf("day");
// an archive is named after the day after the month it holds
const ARCHIVE = TODAY.startOf("month").format("YYYY-MM-DD");
const ARCHIVE_MONTH = dayjs(ARCHIVE).subtract(1, "day").format("MM/YYYY");
const ARCHIVE_TAKEN_AT = dayjs(ARCHIVE).add(2, "hour");

const cacheFile = (date: dayjs.Dayjs, type: string) => ({
  header: {
    date: date.format("YYYY-MM-DDTHH:mm:ss"),
    dateRange: "60",
    updatedAt: date.format("YYYY-MM-DDTHH:mm:ss"),
    version: "1.0",
    count: 1,
    type,
  },
  body: [
    {
      date: `${date.subtract(1, "day").format("YYYY-MM-DD")}T09:00:00`,
      type: "checagem",
      agg: false,
      idPrescription: "9001",
      admissionNumber: "501",
      responsible: "Fulano Beltrano",
      department: "Setor Teste",
      segment: "Segmento Teste",
      tags: [],
    },
  ],
});

const serveCache = (file: object) => (route: Route) =>
  route.fulfill({
    status: 200,
    contentType: "application/octet-stream",
    body: gzipSync(Buffer.from(JSON.stringify(file))),
  });

/**
 * Mocks the report and its cache files. Returns the `filename` asked on each
 * report request (null for the first load, which sends none).
 */
const mockReports = (mockApi: any, { archiveFails = false } = {}) => {
  const asked: (string | null)[] = [];

  mockApi.override(ENDPOINT, (route: Route) => {
    const filename = new URL(route.request().url()).searchParams.get(
      "filename",
    );
    asked.push(filename);

    if (filename && archiveFails) {
      return route.fulfill({
        status: 500,
        json: { status: "error", message: "boom" },
      });
    }

    return route.fulfill({
      status: 200,
      json: {
        status: "success",
        data: {
          cached: true,
          url: `${API_URL}${filename ? ARCHIVE_CACHE : CURRENT_CACHE}`,
          availableReports: [
            { name: ARCHIVE, updateAt: ARCHIVE_TAKEN_AT.toISOString() },
          ],
        },
      },
    });
  });

  mockApi.override(
    `GET ${CURRENT_CACHE}`,
    serveCache(cacheFile(TODAY, "current")),
  );
  mockApi.override(
    `GET ${ARCHIVE_CACHE}`,
    serveCache(cacheFile(dayjs(ARCHIVE), "archive")),
  );

  return asked;
};

const openHistory = async (page: Page) => {
  await page
    .locator(".ant-float-btn")
    .filter({ has: page.locator('[aria-label="menu"]') })
    .click();
  await page
    .locator(".ant-float-btn")
    .filter({ has: page.locator('[aria-label="history"]') })
    .click();

  const modal = page.getByRole("dialog").filter({ hasText: "Histórico" });
  await expect(modal).toBeVisible();
  return modal;
};

// the filters describe the period of the loaded file once it is ready
const waitForReport = (page: Page) =>
  expect(page.locator(".report-filter-list")).toContainText(
    TODAY.subtract(1, "day").format("DD/MM/YY"),
    { timeout: 15000 },
  );

test("loads an archived month and goes back to the current report", async ({
  page,
  mockApi,
}) => {
  const asked = mockReports(mockApi);
  await page.goto(REPORT_URL);
  await waitForReport(page);

  // the current report shows no history alert
  await expect(page.getByText(/^Histórico: /)).toHaveCount(0);

  const modal = await openHistory(page);
  const item = modal.locator(".ant-list-item");
  await expect(item).toHaveCount(1);
  await expect(item).toContainText(
    `Foto retirada em ${ARCHIVE_TAKEN_AT.format("DD/MM/YYYY")}`,
  );

  await item.getByRole("button", { name: "Visualizar" }).click();

  // picking an archive closes the modal and asks for that file
  await expect(modal).toBeHidden();
  await expect.poll(() => asked).toContain(ARCHIVE);

  const alert = page.locator(".ant-alert").filter({ hasText: "Histórico:" });
  await expect(alert).toContainText(`Histórico: ${ARCHIVE_MONTH}`);
  await expect(alert).toContainText(
    `Estes dados representam uma foto tirada em ${dayjs(ARCHIVE).format(
      "DD/MM/YYYY",
    )}.`,
  );

  // "Voltar ao relatório atual" asks the current report again
  const before = asked.length;
  await alert
    .getByRole("button", { name: "Voltar ao relatório atual" })
    .click();
  await expect(alert).toBeHidden();
  await expect.poll(() => asked.slice(before)).toContain("current");
});

test("warns when the archived file can't be loaded", async ({
  page,
  mockApi,
}) => {
  const asked = mockReports(mockApi, { archiveFails: true });
  await page.goto(REPORT_URL);
  await waitForReport(page);

  const modal = await openHistory(page);
  await modal.getByRole("button", { name: "Visualizar" }).click();

  await expect(modal).toBeHidden();
  await expect.poll(() => asked).toContain(ARCHIVE);
  await expect(page.locator(".ant-notification-notice").first()).toBeVisible();
});
