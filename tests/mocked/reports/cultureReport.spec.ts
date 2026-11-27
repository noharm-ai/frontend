import { readFileSync } from "node:fs";
import type { Download, Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";

/**
 * "Culturas" (features/reports/CultureReport): a report of the patient card's
 * Relatórios tab that lists the patient's culture collections
 * (GET /reports/culture), filters them on the client by exam, material and
 * microorganism, expands a collection into its antibiogram and predictions,
 * and exports the antibiogram flattened to CSV.
 */

const ENDPOINT = "GET /reports/culture";

const ITEMS = [
  {
    key: "c1",
    id: 1,
    idExamItem: 900001,
    collectionDate: "2024-03-01T12:00:00",
    releaseDate: "2024-03-04T08:00:00",
    examName: "Hemocultura Teste",
    examMaterialName: "Sangue Teste",
    previousResult: "Gram negativo<br>em análise",
    microorganism: "Microorganismo Teste A",
    colony: "Colônia Teste",
    gram: null,
    extraInfo: "",
    cultures: [
      {
        drug: "Medicamento Teste A",
        result: "Sensível",
        microorganismAmount: "<=1",
        microorganism: "Microorganismo Teste A",
      },
      {
        drug: "Medicamento Teste B",
        result: "Resistente",
        microorganismAmount: ">=16",
        microorganism: "Microorganismo Teste A",
      },
      // the same drug tested against a second microorganism
      {
        drug: "Medicamento Teste A",
        result: "Resistente",
        microorganismAmount: ">=32",
        microorganism: "Microorganismo Teste B",
      },
    ],
    predictions: [],
  },
  {
    key: "c2",
    id: 2,
    idExamItem: 900002,
    collectionDate: "2024-03-02T12:00:00",
    releaseDate: null,
    examName: "Urocultura Teste",
    examMaterialName: "Urina Teste",
    previousResult: null,
    microorganism: null,
    // colony, gram and extraInfo left out by the backend
    cultures: [],
    predictions: [
      { drug: "Medicamento Teste C", prediction: "R", probability: 0.07 },
      // no prediction: must not read as susceptible
      { drug: "Medicamento Teste D", prediction: null, probability: 0.29 },
      { drug: "Medicamento Teste E", prediction: "S", probability: 0.875 },
    ],
  },
];

const reportRequests = (mockApi: { requests: { path: string }[] }) =>
  mockApi.requests.filter((r) => r.path === "/reports/culture");

const reportTable = (page: Page) =>
  page.locator(".ant-modal .ant-table").first();

const csvLines = async (download: Download) =>
  readFileSync((await download.path())!)
    .toString("utf8")
    .split("\r\n");

const openReport = async (page: Page) => {
  await page.goto("/prescricao/199");
  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();

  await page.getByRole("tab", { name: "pie-chart" }).click();
  await page.locator(".report-list li", { hasText: "Culturas" }).click();
};

test("lists the cultures, expands one and filters them by exam", async ({
  page,
  mockApi,
}) => {
  mockApi.override(ENDPOINT, {
    json: { status: "success", data: ITEMS },
  });

  const reportRequest = page.waitForRequest((r) =>
    r.url().includes("/reports/culture"),
  );
  await openReport(page);

  // the report asks for the open prescription's patient
  const params = new URL((await reportRequest).url()).searchParams;
  expect(params.get("idPatient")).toBeTruthy();

  await expect(
    page.getByRole("heading", { name: "Relatório: Culturas" }).first(),
  ).toBeVisible();

  const table = reportTable(page);
  await expect(table.locator(".ant-table-row")).toHaveCount(2);
  await expect(table).toContainText("2 registro(s)");
  await expect(table).toContainText("Hemocultura Teste");
  await expect(table).toContainText("Urocultura Teste");
  // only the first line of the previous result, without the HTML
  await expect(table).toContainText("Gram negativo");

  // expanding the released culture shows its antibiogram
  await table
    .locator(".ant-table-row", { hasText: "Hemocultura Teste" })
    .click();
  const expanded = table.locator(".ant-table-expanded-row").first();
  await expect(expanded).toContainText("Descrição da Colônia");
  await expect(expanded).toContainText("Colônia Teste");
  await expect(expanded).not.toContainText("Bacterioscópico");
  await expect(expanded).not.toContainText("Complemento");
  await expect(expanded).toContainText("Medicamento Teste B");
  await expect(expanded).toContainText("Resistente");
  await expect(expanded).toContainText(">=16");
  // a drug repeated for another microorganism keeps its own row
  const antibiogram = expanded.locator(".ant-table").last();
  await expect(antibiogram.locator(".ant-table-row")).toHaveCount(3);
  await expect(
    antibiogram.locator(".ant-table-row", { hasText: ">=32" }),
  ).toContainText("Medicamento Teste A");

  // the pending culture says so and shows its prediction on demand
  await table
    .locator(".ant-table-row", { hasText: "Urocultura Teste" })
    .click();
  const pending = table.locator(".ant-table-expanded-row").last();
  await expect(pending).toContainText("Resultado pendente");
  // fields the backend left out get no row
  await expect(pending).not.toContainText("Descrição da Colônia");
  await expect(pending).not.toContainText("Bacterioscópico");
  await expect(pending).not.toContainText("Complemento");
  await pending
    .getByRole("button", { name: "Exibir Predição de Resultados" })
    .click();
  const predictions = pending
    .locator(".ant-table.ai-data, .ai-data .ant-table")
    .first();
  const predictionRow = (drug: string) =>
    predictions.locator(".ant-table-row", { hasText: drug });
  await expect(predictions.locator(".ant-table-row")).toHaveCount(3);
  await expect(predictionRow("Medicamento Teste C")).toContainText(
    "Resistente",
  );
  await expect(predictionRow("Medicamento Teste C")).toContainText("7%");
  await expect(predictionRow("Medicamento Teste C")).not.toContainText("7.0");
  await expect(predictionRow("Medicamento Teste D")).toContainText("-");
  await expect(predictionRow("Medicamento Teste D")).not.toContainText(
    "Sensível",
  );
  await expect(predictionRow("Medicamento Teste D")).toContainText("29%");
  await expect(predictionRow("Medicamento Teste E")).toContainText("Sensível");
  await expect(predictionRow("Medicamento Teste E")).toContainText("88%");

  // sorting by the prediction puts the drug without one first
  await predictions
    .getByRole("columnheader", { name: /Sensibilidade/ })
    .click();
  await expect(predictions.locator(".ant-table-row").first()).toContainText(
    "Medicamento Teste D",
  );

  // filter by exam
  const exam = page
    .locator(".ant-modal .ant-select", { has: page.locator("input") })
    .first();
  await exam.click();
  await page
    .locator(".ant-select-item-option", { hasText: "Urocultura Teste" })
    .click();
  await page.keyboard.press("Escape");
  await page
    .locator(".ant-modal")
    .getByRole("button", { name: "search" })
    .click();

  await expect(table).toContainText("1 registro(s)");
  await expect(table).not.toContainText("Hemocultura Teste");
});

test("exports one CSV line per antibiogram drug", async ({ page, mockApi }) => {
  mockApi.override(ENDPOINT, {
    json: { status: "success", data: ITEMS },
  });

  await openReport(page);
  await expect(reportTable(page)).toContainText("2 registro(s)");

  const dialog = page.getByRole("dialog");
  await dialog
    .locator(".ant-float-btn")
    .filter({ has: page.locator('[aria-label="menu"]') })
    .click();
  const downloadPromise = page.waitForEvent("download");
  await dialog
    .locator(".ant-float-btn")
    .filter({ has: page.locator('[aria-label="download"]') })
    .click();
  const lines = await csvLines(await downloadPromise);
  // the collection (in the order the backend sends its fields) without the
  // drug and prediction lists and the internal ids, then the drug: one line
  // per antibiogram drug of the released culture, one for the pending culture
  expect(lines).toEqual([
    "DATA DE COLETA,DATA LIBERACAO,EXAME,MATERIAL,RESULTADO PREVIO,MICROORGANISMO,COLONIA,GRAM,COMPLEMENTO,MEDICAMENTO,SENSIBILIDADE,MIC",
    '"01/03/2024 12:00","04/03/2024 08:00","Hemocultura Teste","Sangue Teste","Gram negativo<br>em análise","Microorganismo Teste A","Colônia Teste","","","Medicamento Teste A","Sensível","<=1"',
    '"01/03/2024 12:00","04/03/2024 08:00","Hemocultura Teste","Sangue Teste","Gram negativo<br>em análise","Microorganismo Teste A","Colônia Teste","","","Medicamento Teste B","Resistente",">=16"',
    '"01/03/2024 12:00","04/03/2024 08:00","Hemocultura Teste","Sangue Teste","Gram negativo<br>em análise","Microorganismo Teste B","Colônia Teste","","","Medicamento Teste A","Resistente",">=32"',
    '"02/03/2024 12:00","","Urocultura Teste","Urina Teste","","",,,,,,',
  ]);
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
  const failed = reportRequests(mockApi).length;
  expect(failed).toBeGreaterThan(0);
  await expect(page.locator(".ant-modal .ant-table-row")).toHaveCount(0);

  mockApi.override(ENDPOINT, {
    json: { status: "success", data: ITEMS },
  });
  await confirm.getByRole("button", { name: "Tentar novamente" }).click();

  await expect(reportTable(page)).toContainText("2 registro(s)");
  expect(reportRequests(mockApi).length).toBeGreaterThan(failed);
});
