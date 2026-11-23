import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";

/**
 * "Histórico de Medicamentos" (features/reports/DrugHistoryReport): a report
 * of the patient card's Relatórios tab that lists, for the admission, the
 * drugs of one attribute (antimicrobials, high alert, controlled, chemo)
 * prescribed over time (GET /reports/drug-attributes/history) and filters
 * them on the client by drug and substance.
 */

const ENDPOINT = "GET /reports/drug-attributes/history";

const ITEMS = [
  {
    idPrescriptionDrug: 101,
    idPrescription: 199,
    admissionNumber: 5,
    prescriptionDate: "2024-03-01T08:00:00",
    prescriptionExpirationDate: "2024-03-02T08:00:00",
    suspensionDate: null,
    drug: "Medicamento Teste A 500mg",
    substance: "Substância Teste A",
    dose: 500,
    measureUnit: "mg",
    frequency: "8/8h",
    route: "EV",
  },
  {
    idPrescriptionDrug: 102,
    idPrescription: 199,
    admissionNumber: 5,
    prescriptionDate: "2024-03-02T08:00:00",
    prescriptionExpirationDate: "2024-03-03T08:00:00",
    suspensionDate: "2024-03-02T20:00:00",
    drug: "Medicamento Teste B 1g",
    substance: "Substância Teste B",
    dose: 1,
    measureUnit: null,
    frequency: null,
    route: null,
  },
  {
    idPrescriptionDrug: 103,
    idPrescription: 200,
    admissionNumber: 5,
    prescriptionDate: "2024-03-03T08:00:00",
    prescriptionExpirationDate: "2024-03-04T08:00:00",
    suspensionDate: null,
    drug: "Medicamento Teste A 500mg",
    substance: "Substância Teste A",
    dose: 500,
    measureUnit: "mg",
    frequency: "12/12h",
    route: "VO",
  },
];

const historyRequests = (mockApi: { requests: { path: string }[] }) =>
  mockApi.requests.filter((r) => r.path === "/reports/drug-attributes/history");

const reportTable = (page: Page) => page.locator(".ant-modal .ant-table");

const openReport = async (page: Page, attribute: string) => {
  await page.goto("/prescricao/199");
  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();

  await page.getByRole("tab", { name: "pie-chart" }).click();
  await page
    .locator(".report-list li", { hasText: "Histórico de Medicamentos" })
    .click();
  await page.getByRole("menuitem", { name: attribute }).click();
};

test("lists the drugs of the attribute and filters them by drug", async ({
  page,
  mockApi,
}) => {
  mockApi.override(ENDPOINT, {
    json: { status: "success", data: ITEMS },
  });

  const reportRequest = page.waitForRequest((r) =>
    r.url().includes("/reports/drug-attributes/history"),
  );
  await openReport(page, "Alta vigilância");

  // the report asks for the open admission and the chosen attribute
  const params = new URL((await reportRequest).url()).searchParams;
  expect(params.get("attribute")).toBe("mav");
  expect(params.get("admissionNumber")).toBeTruthy();

  await expect(
    page.getByRole("heading", {
      name: "Relatório: Histórico de Alta vigilância",
    }),
  ).toBeVisible();

  const table = reportTable(page);
  await expect(table.locator(".ant-table-row")).toHaveCount(3);
  await expect(table).toContainText("3 registro(s)");
  await expect(table).toContainText("Medicamento Teste B 1g");

  // expanding a row shows the prescription details
  await table
    .locator(".ant-table-row", { hasText: "Medicamento Teste B 1g" })
    .click();
  const expanded = table.locator(".ant-table-expanded-row");
  await expect(expanded).toContainText("Prescrição");
  await expect(expanded).toContainText("199");
  await expect(expanded).toContainText("1 -");

  // filter by drug
  const drug = page
    .locator(".ant-modal .ant-select", { has: page.locator("input") })
    .first();
  await drug.click();
  await page
    .locator(".ant-select-item-option", {
      hasText: "Medicamento Teste A 500mg",
    })
    .click();
  await page.keyboard.press("Escape");
  await page
    .locator(".ant-modal")
    .getByRole("button", { name: "search" })
    .click();

  await expect(table.locator(".ant-table-row")).toHaveCount(2);
  await expect(table).toContainText("2 registro(s)");
  await expect(table).not.toContainText("Medicamento Teste B 1g");
});

test("a failed load offers to try again", async ({ page, mockApi }) => {
  mockApi.override(ENDPOINT, {
    status: 500,
    json: { status: "error", message: "boom" },
  });

  await openReport(page, "Antimicrobianos");

  // the dev server mounts in StrictMode, so the load may run (and fail)
  // twice: the newest confirm is the one on top
  const confirm = page.locator(".ant-modal-confirm").last();
  await expect(confirm).toContainText(
    "Não foi possível exibir este relatório.",
  );
  const failed = historyRequests(mockApi).length;
  expect(failed).toBeGreaterThan(0);
  await expect(page.locator(".ant-modal .ant-table-row")).toHaveCount(0);

  mockApi.override(ENDPOINT, {
    json: { status: "success", data: ITEMS },
  });
  await confirm.getByRole("button", { name: "Tentar novamente" }).click();

  await expect(reportTable(page).locator(".ant-table-row")).toHaveCount(3);
  expect(historyRequests(mockApi).length).toBeGreaterThan(failed);
});
