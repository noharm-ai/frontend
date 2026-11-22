import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";

/**
 * "Histórico de Eventos" (features/reports/PrescriptionHistoryReport): a report
 * of the patient card's Relatórios tab that lists the events of the
 * prescription (GET /reports/prescription/history: checks, reviews, PEP
 * integration...) and filters them on the client by who did them.
 */

const ENDPOINT = "GET /reports/prescription/history";

const EVENTS = [
  {
    id: 1,
    source: "custom",
    type: 2,
    createdAt: "2024-03-01T08:00:00",
    responsible: null,
    extra: null,
  },
  {
    id: 2,
    source: "PrescriptionAudit",
    type: 1,
    createdAt: "2024-03-01T09:00:00",
    responsible: "Fulano Beltrano",
    extra: { totalItens: 3 },
  },
  {
    id: 3,
    source: "PrescriptionAudit",
    type: 3,
    createdAt: "2024-03-01T10:00:00",
    responsible: "Ciclano de Tal",
    extra: null,
  },
  {
    id: 4,
    source: "PrescriptionAudit",
    type: 1,
    createdAt: "2024-03-01T11:00:00",
    responsible: null,
    extra: null,
  },
];

const historyRequests = (mockApi: { requests: { path: string }[] }) =>
  mockApi.requests.filter((r) => r.path === "/reports/prescription/history");

const reportTable = (page: Page) => page.locator(".ant-modal .ant-table");

const openReport = async (page: Page) => {
  await page.goto("/prescricao/199");
  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();

  await page.getByRole("tab", { name: "pie-chart" }).click();
  await page
    .locator(".report-list li", { hasText: "Histórico de Eventos" })
    .click();
};

test("lists the prescription events and filters them by responsible", async ({
  page,
  mockApi,
}) => {
  mockApi.override(ENDPOINT, {
    json: { status: "success", data: EVENTS },
  });

  const reportRequest = page.waitForRequest((r) =>
    r.url().includes("/reports/prescription/history"),
  );
  await openReport(page);

  // the report asks for the prescription that is open
  expect(
    new URL((await reportRequest).url()).searchParams.get("idPrescription"),
  ).toBe("199");

  await expect(
    page.getByRole("heading", { name: "Relatório: Histórico de Eventos" }),
  ).toBeVisible();

  const table = reportTable(page);
  await expect(table.locator(".ant-table-row")).toHaveCount(4);
  await expect(table).toContainText("4 registro(s)");
  await expect(table).toContainText("Prescrição chegou na NoHarm");
  await expect(table).toContainText("Prescrição checada automaticamente");
  await expect(table).toContainText("Prescrição revisada");
  // events without a responsible are NoHarm's
  await expect(
    table.locator(".ant-table-row", { hasText: "Prescrição chegou na NoHarm" }),
  ).toContainText("NoHarm");

  // only events with extra data open the details modal
  const checked = table.locator(".ant-table-row", {
    hasText: "Fulano Beltrano",
  });
  await expect(checked).toContainText("Prescrição checada");
  await checked.getByRole("button").click();
  const details = page.locator(".ant-modal-confirm", {
    hasText: "Detalhes do evento",
  });
  await expect(details).toContainText('"totalItens": 3');
  await details.getByRole("button", { name: "Fechar" }).click();
  await expect(details).toHaveCount(0);

  // filter by responsible
  const responsible = page
    .locator(".ant-modal .ant-select", { has: page.locator("input") })
    .first();
  await responsible.click();
  await page
    .locator(".ant-select-item-option", { hasText: "Ciclano de Tal" })
    .click();
  await page.keyboard.press("Escape");
  await page
    .locator(".ant-modal")
    .getByRole("button", { name: "search" })
    .click();

  await expect(table.locator(".ant-table-row")).toHaveCount(1);
  await expect(table).toContainText("Prescrição revisada");
  await expect(table).toContainText("1 registro(s)");
});

test("a failed load offers to try again", async ({ page, mockApi }) => {
  mockApi.override(ENDPOINT, {
    status: 500,
    json: { status: "error", message: "boom" },
  });

  await openReport(page);

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
    json: { status: "success", data: EVENTS },
  });
  await confirm.getByRole("button", { name: "Tentar novamente" }).click();

  await expect(reportTable(page).locator(".ant-table-row")).toHaveCount(4);
  expect(historyRequests(mockApi).length).toBeGreaterThan(failed);
});
