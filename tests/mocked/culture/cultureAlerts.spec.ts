import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";

/**
 * Culture resistance alerts on the prescription items.
 *
 * The backend (services/alert_service) compares every prescribed item to the
 * released antibiograms of the patient and raises two kinds of alert: the very
 * substance tested as resistant, and another substance of the same class. Both
 * arrive in alertsComplete like any other drug alert, so what is tested here is
 * that the frontend knows the two new types by name.
 */

const RESISTANT = {
  idPrescriptionDrug: "9001",
  key: "",
  type: "cultureResistant",
  level: "high",
  text: "Cultura com resultado resistente para este medicamento (Microorganismo Teste, coleta em 01/03/2024).",
  handling: false,
};

const RESISTANT_CLASS = {
  idPrescriptionDrug: "9002",
  key: "",
  type: "cultureResistantClass",
  level: "medium",
  text: "Cultura com resultado resistente para medicamento da mesma classe: AMICACINA (Microorganismo Teste, coleta em 01/03/2024).",
  handling: false,
};

type PrescriptionFixture = {
  data: {
    prescription: Record<string, unknown>[];
    alertStats: Record<string, unknown>;
  };
};

const prescriptionWithCultureAlerts = () => {
  const fixture = loadFixture<PrescriptionFixture>(
    "prescriptions/single-199.json",
  );

  const alertsOf: Record<string, unknown[]> = {
    "9001": [RESISTANT],
    "9002": [RESISTANT_CLASS],
  };

  fixture.data.prescription = fixture.data.prescription.map((item) => ({
    ...item,
    alertsComplete: alertsOf[`${item.idPrescriptionDrug}`] ?? [],
  }));

  return fixture;
};

const cultureCell = (page: Page) =>
  page
    .locator(".ant-col", { hasText: "Alertas" })
    .last()
    .locator(".alert-culture");

test("the expanded item spells out the culture alert", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWithCultureAlerts(),
  });

  await page.goto("/prescricao/199");

  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();

  // the alert count next to the score opens the row that details the alerts
  const row = page.locator("tr", { hasText: "Dipirona 500mg" }).first();
  await row.locator(".score-container .ant-tag").first().click();

  await expect(page.getByText("Alertas Nível Alto")).toBeVisible();
  await expect(page.getByText(RESISTANT.text)).toBeVisible();
});

test("the prescription items show the culture alerts by name", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWithCultureAlerts(),
  });

  await page.goto("/prescricao/199");

  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();

  // the alerts perspective is the view that shows the type of each alert
  await page.locator("button:has(.anticon-alert)").first().click();

  const resistant = page.locator("tr", { hasText: "Dipirona 500mg" }).first();
  const resistantClass = page
    .locator("tr", { hasText: "Omeprazol 20mg" })
    .first();

  // the acronym of each type, not the raw translation key
  await expect(resistant.getByText("CR", { exact: true })).toBeVisible();
  await expect(resistantClass.getByText("CRC", { exact: true })).toBeVisible();

  // the popover names the alert and spells out which culture raised it
  await resistant.getByText("CR", { exact: true }).hover();
  await expect(
    page.getByText("Cultura com resistência ao medicamento"),
  ).toBeVisible();
  await expect(page.getByText(RESISTANT.text)).toBeVisible();
});

test("the alerts card counts the culture alerts", async ({ page, mockApi }) => {
  const fixture = prescriptionWithCultureAlerts();
  fixture.data.alertStats = {
    ...fixture.data.alertStats,
    cultureResistant: 1,
    cultureResistantClass: 1,
  };

  mockApi.override("GET /prescriptions/:id", { json: fixture });

  await page.goto("/prescricao/199");

  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();

  // both kinds of resistance are counted together, in a cell the card fits
  // into the rows it already had
  const cell = cultureCell(page);
  await expect(cell).toHaveText("2");
  await expect(cell).toHaveClass(/(^|\s)alert(\s|$)/);
});

test("the culture cell is not flagged without a culture alert", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWithCultureAlerts(),
  });

  await page.goto("/prescricao/199");

  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();

  const cell = cultureCell(page);
  await expect(cell).toHaveText("0");
  await expect(cell).not.toHaveClass(/(^|\s)alert(\s|$)/);
});
