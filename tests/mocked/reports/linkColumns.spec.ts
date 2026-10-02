import { gzipSync } from "node:zlib";
import type { Page } from "@playwright/test";

import { test, expect, API_URL } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";

/**
 * Link columns in custom reports: a column aliased link_prescricao or
 * link_atendimento renders its integer id as a button that opens in a new
 * tab. Anything that is not a positive integer stays plain text.
 */

const PERMISSIONS = [
  "READ_BASIC_FEATURES",
  "READ_PRESCRIPTION",
  "READ_REPORTS",
  "READ_CUSTOM_REPORTS",
];

const REPORT_URL = "/relatorios/arquivo/CUSTOM/7/20260101";
const CACHE_URL = `${API_URL}/cache/report.json.gz`;

// column order follows the first row: paciente, link_prescricao, link_atendimento
const ROWS = [
  {
    paciente: "Fulano Beltrano",
    link_prescricao: 199,
    link_atendimento: 9999,
  },
  {
    // ids may come serialized as strings, and above 2^53 only a string is exact
    paciente: "Ciclano de Tal",
    link_prescricao: "92600000000000001",
    link_atendimento: null,
  },
  {
    paciente: "Maria Teste",
    link_prescricao: null,
    link_atendimento: "abc",
  },
];

const COLUMN = {
  prescription: 1,
  admission: 2,
};

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

// the table is virtual: rows and cells are divs, not tr/td
const cell = (page: Page, rowText: string, column: number) =>
  page
    .locator(".ant-table-tbody .ant-table-row", { hasText: rowText })
    .locator(".ant-table-cell")
    .nth(column);

test.use({ storageState: { cookies: [], origins: [] } });

test("renders each link column as a new-tab button", async ({
  page,
  mockApi,
}) => {
  await openReport(page, mockApi);

  const expected: [string, string][] = [
    ["Abrir prescrição 199", "/prescricao/199"],
    ["Abrir prescrição 92600000000000001", "/prescricao/92600000000000001"],
    [
      "Abrir prescrição mais recente do atendimento 9999",
      "/prescricao/atendimento/9999",
    ],
  ];

  for (const [name, href] of expected) {
    const link = page.getByRole("link", { name, exact: true });
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noreferrer/);
  }
});

test("values that are not positive integers stay plain text", async ({
  page,
  mockApi,
}) => {
  await openReport(page, mockApi);

  const empty = cell(page, "Maria Teste", COLUMN.prescription);
  await expect(empty).toHaveText("");
  await expect(empty.locator("a")).toHaveCount(0);

  const text = cell(page, "Maria Teste", COLUMN.admission);
  await expect(text).toHaveText("abc");
  await expect(text.locator("a")).toHaveCount(0);
});

test("following a link opens a new tab without opening the record drawer", async ({
  page,
  mockApi,
}) => {
  await openReport(page, mockApi);

  // the popup must not boot the app: it would call endpoints this test does
  // not mock
  await page.context().route("**/prescricao/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<html><body>stub</body></html>",
    }),
  );

  const popupPromise = page.context().waitForEvent("page");
  await page
    .getByRole("link", { name: "Abrir prescrição 199", exact: true })
    .click();
  const popup = await popupPromise;

  expect(new URL(popup.url()).pathname).toBe("/prescricao/199");
  await popup.close();

  await expect(page.locator(".ant-drawer-open")).toHaveCount(0);

  // clicking elsewhere on the row still opens the drawer, with the link in it
  await cell(page, "Fulano Beltrano", 0).click();

  const drawer = page.locator(".ant-drawer-open");
  await expect(drawer).toContainText("Registro #1");
  await expect(
    drawer.getByRole("link", { name: "Abrir prescrição 199", exact: true }),
  ).toHaveAttribute("href", "/prescricao/199");
});

test("the column picker tags link columns", async ({ page, mockApi }) => {
  await openReport(page, mockApi);

  await page.getByRole("button", { name: "setting" }).click();

  const picker = page.locator(".ant-dropdown");
  await expect(picker).toBeVisible();
  await expect(picker.getByText("Link", { exact: true })).toHaveCount(2);
});
