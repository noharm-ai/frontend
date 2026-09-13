import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { openSelect, pickOption } from "../support/antd";

/**
 * Regulation prioritization (/regulacao,
 * src/features/regulation/Prioritization).
 *
 * The list is entirely server-driven: every filter change, every ordering
 * change and every page change re-POSTs /regulation/prioritization with the
 * whole filter set, and the table only renders what came back. Patient names
 * are not part of that payload — they are resolved in a second round trip to
 * the getname service once the list settles.
 *
 * Multiple action is the one place where the page mutates rows without
 * re-fetching: POST /regulation/move answers with the new stage/risk per
 * solicitation and the reducer patches those rows in place.
 */

const TODAY = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
}).format(new Date());

const DEPARTMENTS = [
  { idSegment: 1, idDepartment: 10, label: "UBS Centro" },
  { idSegment: 1, idDepartment: 20, label: "UBS Jardim" },
];

const TYPES = [
  { id: 501, name: "Ressonância", type: 1 },
  { id: 502, name: "Cardiologia", type: 2 },
];

const solicitation = (overrides: Record<string, unknown>) => ({
  date: `${TODAY}T08:30:00`,
  birthdate: "1980-05-10T00:00:00",
  department: "UBS Centro",
  ...overrides,
});

const LIST = [
  solicitation({
    id: 7001,
    idPatient: 101,
    idRegSolicitationType: 501,
    type: "Ressonância",
    age: 45,
    risk: 3,
    globalScore: 95,
    stage: 1,
  }),
  solicitation({
    id: 7002,
    idPatient: 102,
    idRegSolicitationType: 502,
    type: "Cardiologia",
    age: 62,
    risk: 1,
    globalScore: 40,
    stage: 0,
    department: "UBS Jardim",
  }),
  solicitation({
    id: 7003,
    idPatient: 103,
    idRegSolicitationType: 502,
    type: null,
    age: 30,
    risk: 4,
    globalScore: 12,
    stage: 99,
  }),
];

const NAMES = [
  { status: "success", idPatient: 101, name: "Fulano Beltrano" },
  { status: "success", idPatient: 102, name: "Ciclano de Tal" },
  { status: "success", idPatient: 103, name: "Maria Teste" },
];

const rows = (page: Page) =>
  page.locator(".ant-table-tbody tr.ant-table-row").filter({ visible: true });

const searchCalls = (mockApi: MockApi) =>
  mockApi.requests.filter(
    (r) => r.method === "POST" && r.path === "/regulation/prioritization",
  );

/**
 * The payload of the most recent search. Asserts one was sent first, so a page
 * that never searched fails with that, and not with a TypeError on `undefined`.
 */
const lastSearch = (mockApi: MockApi) => {
  const calls = searchCalls(mockApi);
  expect(
    calls,
    "no search reached /regulation/prioritization",
  ).not.toHaveLength(0);
  return JSON.parse(calls.at(-1)!.postData!);
};

/** The filter fields carry no id, so each one is reached through its label. */
const filterField = (page: Page, label: string) =>
  page.locator(`xpath=//label[normalize-space(text())="${label}"]/parent::div`);

const modalRow = (page: Page, label: string) =>
  page.getByRole("dialog").locator(".form-row").filter({ hasText: label });

function installHandlers(
  mockApi: MockApi,
  { list = LIST, count = LIST.length } = {},
) {
  mockApi.override("GET /segments/departments", {
    json: { status: "success", data: DEPARTMENTS },
  });
  mockApi.override("GET /regulation/types", {
    json: { status: "success", data: TYPES },
  });
  mockApi.override("POST /regulation/prioritization", {
    json: { status: "success", data: { list, count } },
  });
  mockApi.override("POST /names", { json: NAMES });
}

async function openList(page: Page, expectedRows = LIST.length) {
  await page.goto("/regulacao");
  await expect(page.getByRole("heading", { name: "Regulação" })).toBeVisible();
  await expect(rows(page)).toHaveCount(expectedRows);
}

test("the list renders each solicitation with its type, risk, stage and resolved name", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi);
  await openList(page);

  const first = rows(page).first();
  await expect(first).toContainText("Ressonância");
  await expect(first).toContainText("45");
  await expect(first).toContainText("Urgência");
  await expect(first).toContainText("Aguardando agendamento");

  // names never travel with the list: they arrive from the getname service
  await expect(page.getByText("Fulano Beltrano")).toBeVisible();
  await expect(page.getByText("Ciclano de Tal")).toBeVisible();
  const namesCall = mockApi.requests.find((r) => r.path === "/names");
  expect(namesCall, "the getname service was never called").toBeDefined();
  expect(JSON.parse(namesCall!.postData!).patients).toEqual([101, 102, 103]);

  // a solicitation whose type could not be named falls back to the raw id
  await expect(rows(page).nth(2)).toContainText("502");
  await expect(rows(page).nth(2)).toContainText("Finalizado");

  await expect(page.getByText("1-3 de 3 itens").first()).toBeVisible();
});

test("the first search asks for today only, page one and the default ordering", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi);
  await openList(page);

  expect(lastSearch(mockApi)).toEqual({
    startDate: TODAY,
    endDate: null,
    typeType: null,
    idList: [],
    idDepartmentList: [],
    riskList: [],
    typeList: [],
    stageList: [],
    idPatientList: [],
    limit: 100,
    offset: 0,
    order: [
      { field: "date_truncate", direction: "asc" },
      { field: "risk", direction: "desc" },
      { field: "global_score", direction: "desc" },
    ],
  });
});

test("a filter change only reaches the backend when the search is triggered", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi);
  await openList(page);
  const searchesOnLoad = searchCalls(mockApi).length;

  await openSelect(filterField(page, "Etapa:"));
  await pickOption(page, "Aguardando agendamento");
  await page.keyboard.press("Escape");

  // picking a filter value is local until the search button is pressed
  expect(searchCalls(mockApi)).toHaveLength(searchesOnLoad);

  await openSelect(filterField(page, "UBS:"));
  await pickOption(page, "UBS Jardim");
  await page.keyboard.press("Escape");

  await page.locator("button.gtm-btn-search").click();

  await expect
    .poll(() => searchCalls(mockApi).length, { timeout: 10000 })
    .toBe(searchesOnLoad + 1);
  const payload = lastSearch(mockApi);
  expect(payload.stageList).toEqual([1]);
  expect(payload.idDepartmentList).toEqual([20]);
  // a new search always restarts at the first page
  expect(payload.offset).toBe(0);
});

test("paging keeps the filters and moves the offset", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi, { count: 150 });
  await openList(page);
  const searchesOnLoad = searchCalls(mockApi).length;

  await expect(page.getByText("1-100 de 150 itens").first()).toBeVisible();

  await page.locator(".ant-pagination-item-2").first().click();

  await expect
    .poll(() => searchCalls(mockApi).length, { timeout: 10000 })
    .toBe(searchesOnLoad + 1);
  const payload = lastSearch(mockApi);
  expect(payload.offset).toBe(100);
  expect(payload.limit).toBe(100);
  expect(payload.startDate).toBe(TODAY);
});

test("a multiple action patches the selected rows with what the move returned", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi);
  mockApi.override("POST /regulation/move", {
    json: {
      status: "success",
      data: [
        { id: 7001, stage: 6, risk: 3 },
        { id: 7002, stage: 6, risk: 1 },
      ],
    },
  });
  await openList(page);
  const searchesOnLoad = searchCalls(mockApi).length;

  await page.getByRole("button", { name: "Ativar seleção múltipla" }).click();
  await expect(
    page.getByRole("button", { name: "0 selecionados" }),
  ).toBeVisible();

  await rows(page).nth(0).getByRole("button").last().click();
  await rows(page).nth(1).getByRole("button").last().click();
  await expect(
    page.getByRole("button", { name: "2 selecionados" }),
  ).toBeVisible();

  await page.locator(".ant-dropdown-trigger").last().click();
  await page.getByRole("menuitem", { name: "Ação Múltipla" }).click();

  const modal = page.getByRole("dialog");
  await expect(modal.getByText("Ação Múltipla")).toBeVisible();

  // the modal is saved empty first: the action is required
  await modal.getByRole("button", { name: "Salvar" }).click();
  await expect(modal.getByText("Campo obrigatório").first()).toBeVisible();
  expect(
    mockApi.requests.filter((r) => r.path === "/regulation/move"),
  ).toHaveLength(0);

  await openSelect(modalRow(page, "Ação:"));
  await pickOption(page, "Alterar etapa");

  // the observation is a rich-text field, so it is typed into the editor body
  await modal.locator(".tiptap").click();
  await page.keyboard.type("Encaminhado para realização");

  await openSelect(modalRow(page, "Próxima etapa:"));
  await pickOption(page, "Aguardando realização");

  await modal.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Ação aplicada com sucesso!")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  const moved = mockApi.requests.filter((r) => r.path === "/regulation/move");
  expect(moved).toHaveLength(1);
  const payload = JSON.parse(moved[0].postData!);
  expect(payload.ids).toEqual([7001, 7002]);
  expect(payload.action).toBe(1);
  expect(payload.nextStage).toBe(6);
  expect(payload.actionData.observation).toContain(
    "Encaminhado para realização",
  );

  // the two moved rows are patched in place, without a new search
  expect(searchCalls(mockApi)).toHaveLength(searchesOnLoad);
  await expect(rows(page).nth(0)).toContainText("Aguardando realização");
  await expect(rows(page).nth(1)).toContainText("Aguardando realização");
  // the untouched row keeps its stage
  await expect(rows(page).nth(2)).toContainText("Finalizado");
});

test("leaving the selection mode drops the selected rows", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi);
  await openList(page);

  await page.getByRole("button", { name: "Ativar seleção múltipla" }).click();
  await rows(page).nth(0).getByRole("button").last().click();
  await expect(
    page.getByRole("button", { name: "1 selecionados" }),
  ).toBeVisible();

  await page.locator(".ant-dropdown-trigger").last().click();
  await page.getByRole("menuitem", { name: "Remover seleção" }).click();

  await expect(
    page.getByRole("button", { name: "Ativar seleção múltipla" }),
  ).toBeVisible();

  // re-entering the mode starts from an empty selection
  await page.getByRole("button", { name: "Ativar seleção múltipla" }).click();
  await expect(
    page.getByRole("button", { name: "0 selecionados" }),
  ).toBeVisible();
});

test("an empty result shows the empty state and still offers the creation button", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi, { list: [], count: 0 });

  await page.goto("/regulacao");

  await expect(page.getByText("Nenhuma solicitação encontrada.")).toBeVisible();
  await expect(rows(page)).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Criar solicitação" }),
  ).toBeVisible();
  // with nothing to resolve, the getname service is left alone
  expect(mockApi.requests.filter((r) => r.path === "/names")).toHaveLength(0);
});

test("a failing search surfaces the error and leaves the table empty", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi);
  mockApi.override("POST /regulation/prioritization", {
    status: 500,
    json: { status: "error", message: "boom" },
  });

  await page.goto("/regulacao");

  await expect(
    page.getByText("Ops! Algo de errado aconteceu.").first(),
  ).toBeVisible();
  await expect(page.getByText("Nenhuma solicitação encontrada.")).toBeVisible();
});
