import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";

/**
 * Protocol alerts on the alerts card.
 *
 * The backend raises one alert of type "protocol" per prescribed item a
 * protocol matched (services/alert_service._alert_protocol), and it arrives in
 * alertsComplete and in alertStats like any other drug alert. The general
 * protocols (prescription/aggregated) come apart, in protocolAlerts, and are
 * turned into "protocolGeneral" rows by the client
 * (utils/transformers/prescriptions). The card counts both.
 */

const PROTOCOL_ALERT = {
  idPrescriptionDrug: "9001",
  key: "",
  type: "protocol",
  level: "high",
  text: "Protocolo de Teste: revisar a dose deste medicamento.",
  handling: false,
};

const GENERAL_PROTOCOL_ALERT = {
  id: 77,
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

const prescriptionWithProtocolAlert = (stats: Record<string, unknown> = {}) => {
  const fixture = loadFixture<PrescriptionFixture>(
    "prescriptions/single-199.json",
  );

  fixture.data.prescription = fixture.data.prescription.map((item) => ({
    ...item,
    alertsComplete:
      `${item.idPrescriptionDrug}` === PROTOCOL_ALERT.idPrescriptionDrug
        ? [PROTOCOL_ALERT]
        : [],
  }));

  fixture.data.alertStats = { ...fixture.data.alertStats, ...stats };

  return fixture;
};

const protocolCell = (page: Page) =>
  page
    .locator(".ant-col", { hasText: "Alertas" })
    .last()
    .locator(".alert-protocol");

test("the alerts card counts the protocol alerts", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWithProtocolAlert({ protocol: 1 }),
  });

  await page.goto("/prescricao/199");

  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();

  const cell = protocolCell(page);
  await expect(cell).toHaveText("1");
  await expect(cell).toHaveClass(/(^|\s)alert(\s|$)/);

  // the count and the modal behind it have to agree: the cell filters the
  // report down to the very alerts it counted
  await cell.click();

  const row = page.locator(".ant-modal tbody tr", {
    hasText: "Protocolo Item",
  });
  await expect(row).toHaveCount(1);
  await expect(row).toContainText("Dipirona 500mg");

  // and the alert itself is spelled out in the expanded row
  await row.click();
  await expect(page.getByText(PROTOCOL_ALERT.text)).toBeVisible();
});

test("the protocol cell is not flagged without a protocol alert", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWithProtocolAlert(),
  });

  await page.goto("/prescricao/199");

  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();

  const cell = protocolCell(page);
  await expect(cell).toHaveText("0");
  await expect(cell).not.toHaveClass(/(^|\s)alert(\s|$)/);
});

test("the alerts card counts the general protocol alerts too", async ({
  page,
  mockApi,
}) => {
  const fixture = prescriptionWithProtocolAlert();

  // no item alert at all: the general protocols come apart, keyed by the
  // expire date of the group they were raised on
  fixture.data.prescription = fixture.data.prescription.map((item) => ({
    ...item,
    alertsComplete: [],
  }));
  fixture.data.protocolAlerts = {
    summary: [GENERAL_PROTOCOL_ALERT.id],
    items: [],
    "2024-03-01T23:59:59": [GENERAL_PROTOCOL_ALERT],
  };

  mockApi.override("GET /prescriptions/:id", { json: fixture });

  await page.goto("/prescricao/199");

  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();

  const cell = protocolCell(page);
  await expect(cell).toHaveText("1");
  await expect(cell).toHaveClass(/(^|\s)alert(\s|$)/);

  await cell.click();

  const row = page.locator(".ant-modal tbody tr", {
    hasText: "Protocolo Geral",
  });
  await expect(row).toHaveCount(1);
  await expect(row).toContainText(GENERAL_PROTOCOL_ALERT.message);
});
