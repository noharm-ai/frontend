import { gzipSync } from "node:zlib";
import { readFile } from "node:fs/promises";
import dayjs from "dayjs";
import type { Page } from "@playwright/test";

import { test, expect, API_URL } from "../support/mockApi";

/**
 * Intervention report CSV export. The cached report file is produced by
 * long-running-tasks (reports/InterventionReport.py); the CSV columns are the
 * keys of its first row, each translated through reportcsv.<key>.
 *
 * outcomeAt (outcome date/time) was added to the file later, so exports of
 * files generated before it must keep working, just without that column.
 * Above 100 rows the CSV is built in a Web Worker with its own date parsing,
 * so both paths are covered.
 */

const REPORT_URL = "/relatorios/intervencoes";
const CACHE_URL = `${API_URL}/cache/intervention.json.gz`;
const WORKER_THRESHOLD = 100;

// the screen filters by [start of month, header.date - 1 day]
const REFERENCE = dayjs().startOf("day");
const DAY = REFERENCE.subtract(1, "day");
const OUTCOME_AT = `${DAY.format("YYYY-MM-DD")}T14:32:10.123456`;
const OUTCOME_AT_CSV = `${DAY.format("DD/MM/YYYY")} 14:32`;

type Row = Record<string, unknown>;

// same keys, in the same order, as InterventionReport.py builds them
const buildRow = (index: number, overrides: Row = {}): Row => ({
  idPrescription: `${9000 + index}`,
  idPrescriptionDrug: `${90000 + index}`,
  admissionNumber: `${500 + index}`,
  date: `${DAY.format("YYYY-MM-DD")}T09:15:00`,
  error: false,
  cost: false,
  status: "a",
  statusDescription: "Aceita",
  expendedDose: null,
  economyDays: null,
  responsible: "Fulano Beltrano",
  department: "Setor Teste",
  segment: "Segmento Teste",
  drug: "Medicamento Teste 10mg",
  reason: ["Dose inadequada"],
  prescriber: "Ciclano de Tal",
  observation: "Observacao de teste",
  dose: 1,
  measureUnit: "comprimido",
  frequency: "1x ao dia",
  idPatient: 700 + index,
  attrAntimicro: false,
  attrMav: false,
  attrControl: false,
  attrNotStandard: false,
  attrQuimio: false,
  outcomeResponsible: "Maria Teste",
  outcomeAt: OUTCOME_AT,
  insurance: "Convenio Teste",
  idPrescriptionFinal: 9000 + index,
  tags: [],
  ramDetection: null,
  ramInternalNotificationCode: null,
  ramAnvisaCode: null,
  ramBrand: null,
  ramBatch: null,
  ramExpiration: null,
  ramSymptoms: null,
  ramSuspended: null,
  ramDescribedInLeaflet: null,
  ramSeverity: null,
  ramSeverityDetail: null,
  ramCausality: null,
  drugPeriod: null,
  prescriptionDate: `${DAY.format("YYYY-MM-DD")}T08:00:00`,
  substance: "Substancia Teste",
  substanceClass: null,
  substanceClassParent: null,
  economyType: "Não possui",
  economyDayValue: null,
  idIntervention: 100 + index,
  age: 50,
  ...overrides,
});

const PENDING: Row = {
  status: "s",
  statusDescription: "Pendente",
  outcomeResponsible: null,
  outcomeAt: null,
};

const withoutOutcomeAt = (row: Row): Row => {
  const { outcomeAt: _outcomeAt, ...rest } = row;
  return rest;
};

// values are JSON.stringify-ed, so a quote is only ever escaped as \"
const parseCsvLine = (line: string): string[] => {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === "\\" && quoted) {
      current += line[++i];
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells;
};

const exportReport = async (page: Page, mockApi: any, rows: Row[]) => {
  mockApi.override("GET /reports/general/INTERVENTION", {
    json: {
      status: "success",
      data: { cached: true, url: CACHE_URL, availableReports: [] },
    },
  });

  const file = {
    header: {
      date: REFERENCE.format("YYYY-MM-DDTHH:mm:ss"),
      dateRange: "70",
      updatedAt: REFERENCE.format("YYYY-MM-DDTHH:mm:ss"),
      version: "1.0",
      count: rows.length,
      type: "current",
    },
    body: rows,
  };

  mockApi.override("GET /cache/intervention.json.gz", (route: any) =>
    route.fulfill({
      status: 200,
      contentType: "application/octet-stream",
      body: gzipSync(Buffer.from(JSON.stringify(file))),
    }),
  );

  await page.goto(REPORT_URL);

  // the export reads the filters applied after the file loads
  const total = page
    .locator(".stats-title", { hasText: /^Intervenções$/ })
    .locator("xpath=following-sibling::div[1]");
  await expect(total).toHaveText(rows.length.toLocaleString("pt-BR"), {
    timeout: 15000,
  });

  await page
    .locator(".ant-float-btn")
    .filter({ has: page.locator('[aria-label="menu"]') })
    .click();

  const downloadPromise = page.waitForEvent("download");
  await page
    .locator(".ant-float-btn")
    .filter({ has: page.locator('[aria-label="download"]') })
    .click();
  const download = await downloadPromise;

  const csv = await readFile(await download.path(), "utf8");
  const [header, ...lines] = csv.split("\r\n").map(parseCsvLine);

  return { header, lines };
};

test("exports the outcome date and time next to the outcome responsible", async ({
  page,
  mockApi,
}) => {
  const rows = [buildRow(1), buildRow(2, PENDING)];

  const { header, lines } = await exportReport(page, mockApi, rows);

  const responsibleIndex = header.indexOf("RESPONSAVEL DESFECHO");
  const outcomeIndex = header.indexOf("DATA DESFECHO");
  expect(outcomeIndex).toBe(responsibleIndex + 1);
  expect(header.filter((name) => name.startsWith("reportcsv."))).toEqual([]);

  expect(lines).toHaveLength(2);
  expect(lines[0][outcomeIndex]).toBe(OUTCOME_AT_CSV);
  expect(lines[1][outcomeIndex]).toBe("");
});

test("files generated before outcomeAt still export, without the column", async ({
  page,
  mockApi,
}) => {
  const rows = [buildRow(1), buildRow(2, PENDING)].map(withoutOutcomeAt);

  const { header, lines } = await exportReport(page, mockApi, rows);

  expect(header).toContain("RESPONSAVEL DESFECHO");
  expect(header).not.toContain("DATA DESFECHO");
  expect(header.filter((name) => name.startsWith("reportcsv."))).toEqual([]);
  expect(lines).toHaveLength(2);
});

test("large exports built in the worker format the outcome date too", async ({
  page,
  mockApi,
}) => {
  const rows = Array.from({ length: WORKER_THRESHOLD + 20 }, (_, index) =>
    buildRow(index, index % 2 ? PENDING : {}),
  );

  const { header, lines } = await exportReport(page, mockApi, rows);

  const outcomeIndex = header.indexOf("DATA DESFECHO");
  expect(outcomeIndex).toBe(header.indexOf("RESPONSAVEL DESFECHO") + 1);
  expect(lines).toHaveLength(rows.length);
  expect(lines[0][outcomeIndex]).toBe(OUTCOME_AT_CSV);
  expect(lines[1][outcomeIndex]).toBe("");
});
