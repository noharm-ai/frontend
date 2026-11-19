import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";

/**
 * "Relatório: Alertas" (features/reports/AlertListReport): the modal behind the
 * alerts card of the prescription. It makes no request of its own: the card
 * hands it the prescription's alertsList (utils/transformers/prescriptions),
 * plus the filters of the cell that was clicked, and the report filters the
 * list on the client by level, drug and type.
 */

type PrescriptionFixture = {
  data: {
    prescription: Record<string, unknown>[];
    alertStats: Record<string, unknown>;
  };
};

// alertsComplete of each item of prescriptions/single-199.json
const ALERTS: Record<string, Record<string, unknown>[]> = {
  "9001": [
    {
      idPrescriptionDrug: "9001",
      key: "",
      type: "it",
      level: "high",
      text: "Interação de teste entre Dipirona e Omeprazol.",
      handling: false,
    },
    {
      idPrescriptionDrug: "9001",
      key: "",
      type: "maxDose",
      level: "medium",
      text: "Dose acima da dose máxima de teste.",
      handling: false,
    },
  ],
  "9002": [
    {
      idPrescriptionDrug: "9002",
      key: "",
      type: "kidney",
      level: "low",
      text: "Ajuste renal de teste.",
      handling: false,
    },
  ],
};

const prescriptionWithAlerts = (
  alerts: Record<string, Record<string, unknown>[]>,
) => {
  const fixture = loadFixture<PrescriptionFixture>(
    "prescriptions/single-199.json",
  );

  fixture.data.prescription = fixture.data.prescription.map((item) => ({
    ...item,
    alertsComplete: alerts[`${item.idPrescriptionDrug}`] ?? [],
  }));
  fixture.data.alertStats = {
    ...fixture.data.alertStats,
    int: 1,
    maxDose: 1,
    kidney: 1,
  };

  return fixture;
};

const alertsCard = (page: Page) =>
  page.locator(".ant-col", { hasText: "Alertas" }).last();

const reportTable = (page: Page) => page.locator(".ant-modal .ant-table");

const openPrescription = async (page: Page) => {
  await page.goto("/prescricao/199");
  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();
};

test("lists every alert, filters them and expands the details", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWithAlerts(ALERTS),
  });

  await openPrescription(page);
  await alertsCard(page).getByRole("button", { name: "Ver todos" }).click();

  await expect(
    page.getByRole("heading", { name: "Relatório: Alertas" }),
  ).toBeVisible();

  const table = reportTable(page);
  await expect(table.locator(".ant-table-row")).toHaveCount(3);
  await expect(table).toContainText("3 registro(s)");
  await expect(table).toContainText("Interação Medicamentosa");
  await expect(table).toContainText("Ajuste Renal");

  // the header of the expand column opens and closes every row
  // (antd keeps a collapsed row in the DOM, hidden)
  const openDetails = table.locator(".ant-descriptions:visible");
  await table.locator(".expand-all").click();
  await expect(openDetails).toHaveCount(3);
  await table.locator(".expand-all").click();
  await expect(openDetails).toHaveCount(0);

  // the drug list of the filter comes from the alerts
  // the filters are Nível, Medicamento and Tipo, in that order
  await page.locator(".ant-modal .ant-select").nth(1).click();
  await page
    .locator(".ant-select-item-option", { hasText: "Omeprazol 20mg" })
    .click();
  await page.keyboard.press("Escape");
  await page
    .locator(".ant-modal")
    .getByRole("button", { name: "search" })
    .click();

  await expect(table.locator(".ant-table-row")).toHaveCount(1);
  await expect(table).toContainText("1 registro(s)");
  await expect(table).toContainText("Omeprazol 20mg");
  await expect(page.locator(".report-filter-list")).toContainText(
    "Medicamento: Omeprazol 20mg",
  );

  // a click on the row shows the item's dose, frequency, route and alert text
  await table.locator(".ant-table-row").click();
  const details = openDetails;
  await expect(details).toHaveCount(1);
  await expect(details).toContainText("20 mg");
  await expect(details).toContainText("1x/dia");
  await expect(details).toContainText("Oral");
  await expect(details).toContainText("Ajuste renal de teste.");
});

test("a cell of the card opens the report filtered by its alert types", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWithAlerts(ALERTS),
  });

  await openPrescription(page);

  // the second cell of the card counts the drug interactions (typeList "it")
  await alertsCard(page).locator(".content > div > div").nth(1).click();

  const table = reportTable(page);
  await expect(table.locator(".ant-table-row")).toHaveCount(1);
  await expect(table).toContainText("Dipirona 500mg");
  await expect(table).toContainText("Interação Medicamentosa");
  await expect(page.locator(".report-filter-list")).toContainText("Tipo: it");
});

test("a prescription without alerts opens an empty report", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWithAlerts({}),
  });

  await openPrescription(page);
  await alertsCard(page).getByRole("button", { name: "Ver todos" }).click();

  const table = reportTable(page);
  await expect(table).toContainText("0 registro(s)");
  await expect(table.locator(".ant-table-row")).toHaveCount(0);
});
