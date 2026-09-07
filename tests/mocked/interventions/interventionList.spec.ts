import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { openSelectById, pickOption } from "../support/antd";

/**
 * The intervention list page (/intervencoes,
 * src/components/InterventionList).
 *
 * Two filter layers live on this page and are easy to conflate:
 *   - the search filters, which go to the backend (POST
 *     /intervention/search) and replace the list;
 *   - the "**" local filters, applied in the browser over whatever the
 *     search returned. Situação and Responsável go through the antd column
 *     filteredValue, Prescritor/Setor/Motivo through filterList().
 *
 * The counters beside each Situação option always describe the whole search
 * result, and the bulk-outcome toolbar only offers the pending rows the
 * local filters left on screen.
 */

const REASONS = [
  { id: 10, name: "Ajuste de Dose", parentName: null },
  { id: 20, name: "Via Inadequada", parentName: null },
  { id: 30, name: "Duplicidade", parentName: null },
];

const intervention = (
  idIntervention: number,
  overrides: Record<string, unknown>,
) => ({
  idIntervention,
  id: `${idIntervention}`,
  idPrescription: `${900 + idIntervention}`,
  idPrescriptionDrug: `${idIntervention}`,
  admissionNumber: 9999,
  date: new Date().toISOString().slice(0, 19),
  dose: 1,
  measureUnit: { value: "mg", label: "mg" },
  frequency: { value: 1, label: "1x ao dia" },
  route: "IV",
  time: "08:00",
  error: false,
  cost: false,
  ...overrides,
});

const LIST = [
  intervention(1, {
    drugName: "Vancomicina",
    status: "s",
    user: "Ana Farmaceutica",
    prescriber: "Dr. Carlos",
    department: "UTI",
    reasonDescription: "Ajuste de Dose",
    idInterventionReason: [10],
  }),
  intervention(2, {
    drugName: "Dipirona",
    status: "s",
    user: "Bruno Farmaceutico",
    prescriber: "Dra. Diana",
    department: "Emergencia",
    reasonDescription: "Via Inadequada",
    idInterventionReason: [20],
  }),
  intervention(3, {
    drugName: "Omeprazol",
    status: "a",
    user: "Ana Farmaceutica",
    prescriber: "Dr. Carlos",
    department: "UTI",
    reasonDescription: "Ajuste de Dose",
    idInterventionReason: [10],
  }),
  intervention(4, {
    drugName: "Heparina",
    status: "n",
    user: "Bruno Farmaceutico",
    prescriber: "Dra. Diana",
    department: "UTI",
    reasonDescription: "Duplicidade",
    idInterventionReason: [30],
  }),
];

const installHandlers = (mockApi: MockApi, list: unknown[] = LIST) => {
  mockApi.override("GET /intervention/reasons", {
    json: { status: "success", data: REASONS },
  });
  mockApi.override("POST /intervention/search", {
    json: { status: "success", data: list },
  });
};

const rows = (page: Page) => page.locator(".ant-table-tbody tr.ant-table-row");

const openDropdown = (page: Page) =>
  page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)");

/**
 * Picks one option in a local filter Select. The multi-value filters keep
 * their dropdown open after a pick, so it is closed again to leave the page
 * in the same state whichever filter was used.
 */
async function pickLocalFilter(page: Page, filterId: string, option: string) {
  await openSelectById(page, filterId);
  await pickOption(page, option);
  await page.keyboard.press("Escape");
}

async function openList(page: Page) {
  await page.goto("/intervencoes");
  await expect(
    page.getByRole("heading", { name: "Intervenções" }),
  ).toBeVisible();
  await expect(rows(page)).toHaveCount(LIST.length);
}

const searchCalls = (mockApi: MockApi) =>
  mockApi.requests.filter(
    (r) => r.method === "POST" && r.path === "/intervention/search",
  );

test("the Situação filter narrows the table without touching the counters", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi);
  await openList(page);
  const searchesOnLoad = searchCalls(mockApi).length;

  // every counter describes the whole search result
  await openSelectById(page, "intervFilterStatus");
  await expect(
    openDropdown(page).locator(".ant-select-item-option"),
  ).toHaveText([
    /^Pendentes 2$/,
    /^Aceitas 1$/,
    /^Não aceitas 1$/,
    /^Não aceitas \(Justificadas\) 0$/,
    /^Não se aplica 0$/,
    /^Todas 4$/,
  ]);

  await pickOption(page, "Pendentes");

  await expect(rows(page)).toHaveCount(2);
  await expect(page.getByRole("cell", { name: "Vancomicina" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Dipirona" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "Omeprazol" })).toHaveCount(0);

  // the counters keep describing the search, not the filtered table
  await openSelectById(page, "intervFilterStatus");
  await expect(
    openDropdown(page).locator(".ant-select-item-option").last(),
  ).toHaveText(/^Todas 4$/);

  // nothing was re-fetched: the status filter is applied in the browser
  expect(searchCalls(mockApi)).toHaveLength(searchesOnLoad);
});

test("Prescritor and Setor stack, and a new search clears the local filters", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi);
  await openList(page);
  const searchesOnLoad = searchCalls(mockApi).length;

  await pickLocalFilter(page, "intervFilterDept", "UTI");
  await expect(rows(page)).toHaveCount(3);
  await expect(page.getByRole("cell", { name: "Dipirona" })).toHaveCount(0);

  // stacking narrows further: UTI *and* Dr. Carlos
  await pickLocalFilter(page, "intervFilterPrescriber", "Dr. Carlos");
  await expect(rows(page)).toHaveCount(2);
  await expect(page.getByRole("cell", { name: "Heparina" })).toHaveCount(0);

  // a new search resets every local filter (resetLocalFilters)
  await page.locator("button.gtm-btn-search").click();

  await expect(rows(page)).toHaveCount(LIST.length);
  await expect(page.getByRole("cell", { name: "Dipirona" })).toBeVisible();

  const calls = searchCalls(mockApi);
  expect(calls).toHaveLength(searchesOnLoad + 1);
  const payload = JSON.parse(calls[calls.length - 1].postData!);
  // the default period is the last 15 days, open-ended
  const expectedStart = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
  expect(payload.startDate).toBe(expectedStart.toISOString().slice(0, 10));
  expect(payload.endDate).toBeNull();
});

test("the Motivo filter matches on the reason id, not on the description", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi);
  await openList(page);

  await pickLocalFilter(page, "intervFilterOutcome", "Duplicidade");
  await expect(rows(page)).toHaveCount(1);
  await expect(page.getByRole("cell", { name: "Heparina" })).toBeVisible();

  // multi-select: the second reason widens the selection back
  await pickLocalFilter(page, "intervFilterOutcome", "Via Inadequada");
  await expect(rows(page)).toHaveCount(2);
  await expect(page.getByRole("cell", { name: "Dipirona" })).toBeVisible();
});

test("the bulk toolbar only offers the pending rows left by the filters", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi);
  await openList(page);

  await pickLocalFilter(page, "intervFilterStatus", "Aceitas");
  await expect(rows(page)).toHaveCount(1);

  // no pending row on screen: the whole bulk action is disabled
  await expect(
    page.getByRole("button", { name: "Ativar seleção múltipla" }),
  ).toBeDisabled();

  await pickLocalFilter(page, "intervFilterStatus", "Todas");
  await expect(rows(page)).toHaveCount(LIST.length);

  await page.locator(".bulk-outcome-actions .ant-dropdown-trigger").click();
  await page
    .getByRole("menuitem", { name: "Selecionar todas pendentes" })
    .click();

  // the two pending interventions, not the four rows on screen
  await expect(
    page.getByRole("button", { name: "2 selecionadas" }),
  ).toBeVisible();
});

test("an empty search result shows the empty state and no bulk action", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi, []);

  await page.goto("/intervencoes");

  await expect(page.getByText("Nenhuma intervenção encontrada.")).toBeVisible();
  await expect(rows(page)).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Ativar seleção múltipla" }),
  ).toBeDisabled();
});
