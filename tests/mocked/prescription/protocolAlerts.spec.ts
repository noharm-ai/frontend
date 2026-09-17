import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";

/**
 * Protocol alerts on the alerts card of the prescription.
 *
 * The cell counts protocols, not alerts: protocolAlerts.summary holds one entry
 * per protocol that alerted (services/alert_protocol_service.find_protocols),
 * however many items or date groups it raised an alert on. The report behind
 * the cell still lists the alerts themselves, so it can show more rows than the
 * cell counts.
 */

const ITEM_PROTOCOL_ALERT = {
  idPrescriptionDrug: "9001",
  key: "",
  type: "protocol",
  level: "high",
  text: "Protocolo de Teste: revisar a dose deste medicamento.",
  handling: false,
};

const GENERAL_PROTOCOL_ALERT = {
  id: 78,
  message: "Protocolo Geral de Teste",
  description: "Revisar a prescrição segundo o protocolo.",
  level: "high",
};

type PrescriptionFixture = {
  data: {
    prescription: Record<string, unknown>[];
    alertStats: Record<string, unknown>;
    protocolAlerts: Record<string, unknown> | null;
  };
};

const prescriptionWithProtocols = (
  protocolAlerts: Record<string, unknown> | null,
) => {
  const fixture = loadFixture<PrescriptionFixture>(
    "prescriptions/single-199.json",
  );

  fixture.data.prescription = fixture.data.prescription.map((item) => ({
    ...item,
    alertsComplete:
      `${item.idPrescriptionDrug}` === ITEM_PROTOCOL_ALERT.idPrescriptionDrug
        ? [ITEM_PROTOCOL_ALERT]
        : [],
  }));
  fixture.data.alertStats = { ...fixture.data.alertStats, protocol: 1 };
  fixture.data.protocolAlerts = protocolAlerts;

  return fixture;
};

const protocolCell = (page: Page) =>
  page
    .locator(".ant-col", { hasText: "Alertas" })
    .last()
    .locator(".alert-protocol");

test("the alerts card counts the active protocols", async ({
  page,
  mockApi,
}) => {
  // two protocols alerted: one on a prescription item, another on the
  // prescription as a whole
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWithProtocols({
      summary: [77, GENERAL_PROTOCOL_ALERT.id],
      items: [{ id: 77 }],
      "2024-03-01T23:59:59": [GENERAL_PROTOCOL_ALERT],
    }),
  });

  await page.goto("/prescricao/199");

  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();

  const cell = protocolCell(page);
  await expect(cell).toHaveText("2");
  await expect(cell).toHaveClass(/(^|\s)alert(\s|$)/);
});

test("the cell opens the report on the protocol alerts", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWithProtocols({
      summary: [77, GENERAL_PROTOCOL_ALERT.id],
      items: [{ id: 77 }],
      "2024-03-01T23:59:59": [GENERAL_PROTOCOL_ALERT],
    }),
  });

  await page.goto("/prescricao/199");

  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();

  await protocolCell(page).click();

  // both kinds of protocol alert are listed: the item one and the general one
  const itemRow = page.locator(".ant-modal tbody tr", {
    hasText: "Protocolo Item",
  });
  const generalRow = page.locator(".ant-modal tbody tr", {
    hasText: "Protocolo Geral",
  });

  await expect(itemRow).toContainText("Dipirona 500mg");
  await expect(generalRow).toContainText(GENERAL_PROTOCOL_ALERT.message);
});

test("the protocol cell is not flagged without an active protocol", async ({
  page,
  mockApi,
}) => {
  // the item alert alone does not count: without a protocol in the summary
  // there is no active protocol to report
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWithProtocols(null),
  });

  await page.goto("/prescricao/199");

  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();

  const cell = protocolCell(page);
  await expect(cell).toHaveText("0");
  await expect(cell).not.toHaveClass(/(^|\s)alert(\s|$)/);
});
