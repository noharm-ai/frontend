import { gzipSync } from "node:zlib";
import type { Page } from "@playwright/test";

import { test, expect, API_URL } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";

/**
 * Report table columns can be resized by dragging the handle on the right
 * edge of their header. Widths last only while the page is open.
 */

const PERMISSIONS = [
  "READ_BASIC_FEATURES",
  "READ_REPORTS",
  "READ_CUSTOM_REPORTS",
];

const REPORT_URL = "/relatorios/arquivo/CUSTOM/7/20260101";
const CACHE_URL = `${API_URL}/cache/report.json.gz`;

const ROWS = [
  { paciente: "Fulano Beltrano", idade: 40 },
  { paciente: "Ciclano de Tal", idade: 25 },
  { paciente: "Maria Teste", idade: 61 },
];

const openReport = async (page: Page, mockApi: any) => {
  mockApi.override("GET /reports/general/CUSTOM", {
    json: {
      status: "success",
      data: {
        cached: true,
        title: "Relatorio de teste",
        url: CACHE_URL,
        graphs: "[]",
      },
    },
  });

  mockApi.override("GET /cache/report.json.gz", (route: any) =>
    route.fulfill({
      status: 200,
      contentType: "application/octet-stream",
      body: gzipSync(Buffer.from(JSON.stringify(ROWS))),
    }),
  );

  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await page.goto(REPORT_URL);

  await expect(page.getByText("Fulano Beltrano")).toBeVisible({
    timeout: 15000,
  });
};

const header = (page: Page, title: string) =>
  page.locator(".ant-table-thead th", { hasText: title });

const handle = (page: Page, title: string) =>
  page.getByRole("separator", { name: `Redimensionar coluna ${title}` });

const width = async (page: Page, title: string) =>
  (await header(page, title).boundingBox())!.width;

const drag = async (page: Page, title: string, dx: number) => {
  const box = (await handle(page, title).boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx / 2, y, { steps: 5 });
  await page.mouse.move(x + dx, y, { steps: 5 });
  await page.mouse.up();
};

// the table is virtual: rows are divs, read the visible order from them
const firstRowText = (page: Page) =>
  page.locator(".ant-table-tbody .ant-table-row").first();

test.use({ storageState: { cookies: [], origins: [] } });

test("dragging a header handle widens and narrows the column", async ({
  page,
  mockApi,
}) => {
  await openReport(page, mockApi);

  const initial = await width(page, "paciente");

  await drag(page, "paciente", 120);
  await expect
    .poll(() => width(page, "paciente"))
    .toBeCloseTo(initial + 120, -1);

  await drag(page, "paciente", -200);
  await expect
    .poll(() => width(page, "paciente"))
    .toBeCloseTo(initial - 80, -1);

  // the body cells follow the header
  const cellBox = await page
    .locator(".ant-table-tbody .ant-table-row")
    .first()
    .locator(".ant-table-cell")
    .first()
    .boundingBox();
  expect(cellBox!.width).toBeCloseTo(initial - 80, -1);
});

test("a column cannot be narrowed below the minimum width", async ({
  page,
  mockApi,
}) => {
  await openReport(page, mockApi);

  await drag(page, "paciente", -500);
  await expect.poll(() => width(page, "paciente")).toBeCloseTo(60, -1);
});

test("double-clicking the handle restores the default width", async ({
  page,
  mockApi,
}) => {
  await openReport(page, mockApi);

  const initial = await width(page, "idade");
  await drag(page, "idade", 100);
  await expect.poll(() => width(page, "idade")).toBeCloseTo(initial + 100, -1);

  await handle(page, "idade").dblclick();
  await expect.poll(() => width(page, "idade")).toBeCloseTo(initial, -1);
});

test("resizing does not sort the column", async ({ page, mockApi }) => {
  await openReport(page, mockApi);

  await drag(page, "idade", 80);
  await handle(page, "idade").click();

  await expect(header(page, "idade")).not.toHaveAttribute("aria-sort", /.+/);
  await expect(firstRowText(page)).toContainText("Fulano Beltrano");

  // clicking the header itself still sorts
  await header(page, "idade").click();
  await expect(firstRowText(page)).toContainText("Ciclano de Tal");
});

test("widths reset when the page is reloaded", async ({ page, mockApi }) => {
  await openReport(page, mockApi);

  const initial = await width(page, "paciente");
  await drag(page, "paciente", 120);
  await expect
    .poll(() => width(page, "paciente"))
    .toBeCloseTo(initial + 120, -1);

  await page.reload();
  await expect(page.getByText("Fulano Beltrano")).toBeVisible({
    timeout: 15000,
  });
  await expect.poll(() => width(page, "paciente")).toBeCloseTo(initial, -1);
});
