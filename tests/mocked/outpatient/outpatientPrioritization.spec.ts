import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { openSelect, openSelectById, pickOption } from "../support/antd";

/**
 * Outpatient prioritization (/pacientes-ambulatoriais,
 * src/features/outpatient) — the patient list of the PRIMARYCARE journey.
 *
 * Everything the page shows comes from a single POST /patient/list, and the
 * filter panel is the only thing that changes its body: the main filters
 * (segmento, setores, data de agendamento) are always visible, the rest live
 * behind "Ver mais" and are counted in its badge. Patient names are not in
 * that payload — they are resolved afterwards through POST /names and kept in
 * the patient cache, which is why the name column starts as a spinner.
 *
 * Below the filters the table is entirely client-side: the search box filters
 * by name, atendimento or patient id, and only the rows carrying marcadores
 * can be expanded.
 */

const DEPARTMENTS = [
  { idSegment: 1, idDepartment: 10, label: "AMBULATORIO CENTRAL" },
  // same department reachable from two segments: the select must dedupe it
  { idSegment: 2, idDepartment: 10, label: "AMBULATORIO CENTRAL" },
  { idSegment: 2, idDepartment: 20, label: "AMBULATORIO NORTE" },
];

const PATIENTS = [
  {
    idPatient: 501,
    idPrescription: 9001,
    admissionNumber: 111111,
    namePatient: null,
    observation: "<p>Primeira linha</p><p>Segunda linha</p>",
    refDate: "2026-03-10T00:00:00",
    birthdate: "1980-05-10T00:00:00",
    admissionDate: "2026-01-05T00:00:00",
    loadingName: false,
    tags: ["Diabetes", "Hipertensão"],
  },
  {
    idPatient: 502,
    idPrescription: 9002,
    admissionNumber: 222222,
    namePatient: null,
    observation: null,
    refDate: "2026-03-11T00:00:00",
    birthdate: "1975-02-20T00:00:00",
    admissionDate: "2026-01-06T00:00:00",
    loadingName: false,
    tags: [],
  },
  {
    idPatient: 503,
    idPrescription: 9003,
    admissionNumber: 333333,
    namePatient: null,
    observation: null,
    refDate: "2026-03-12T00:00:00",
    birthdate: "1990-09-01T00:00:00",
    admissionDate: "2026-01-07T00:00:00",
    loadingName: false,
    tags: ["Oncologia"],
  },
];

const NAMES: Record<number, string> = {
  501: "Fulano Beltrano",
  502: "Ciclano de Tal",
  503: "Maria Teste",
};

const TAGS = [
  { id: 1, name: "Diabetes", tagType: "patient", active: true },
  { id: 2, name: "Oncologia", tagType: "patient", active: true },
];

const rows = (page: Page) => page.locator(".ant-table-tbody tr.ant-table-row");

const listCalls = (mockApi: MockApi) =>
  mockApi.requests
    .filter((r) => r.method === "POST" && r.path === "/patient/list")
    .map((r) => JSON.parse(r.postData!));

const installHandlers = (mockApi: MockApi, list: unknown[] = PATIENTS) => {
  mockApi.override("GET /segments/departments", {
    json: { status: "success", data: DEPARTMENTS },
  });
  mockApi.override("POST /patient/list", {
    json: { status: "success", data: list },
  });
  mockApi.override("GET /tag/list", {
    json: { status: "success", data: TAGS },
  });
  mockApi.override("POST /names", async (route) => {
    const { patients } = JSON.parse(route.request().postData() ?? "{}");
    await route.fulfill({
      json: (patients as number[]).map((idPatient) => ({
        status: "success",
        idPatient,
        name: NAMES[idPatient],
      })),
    });
  });
};

async function openList(page: Page, expectedRows = PATIENTS.length) {
  await page.goto("/pacientes-ambulatoriais");
  await expect(page.getByRole("heading", { name: "Pacientes" })).toBeVisible();
  await expect(rows(page)).toHaveCount(expectedRows);
}

/** Runs the search and waits for the request it triggers to be recorded. */
async function search(page: Page, mockApi: MockApi) {
  const before = listCalls(mockApi).length;
  await page.locator("button.gtm-btn-search").click();
  await expect
    .poll(() => listCalls(mockApi).length)
    .toBeGreaterThan(before);
}

test("lists the outpatients of the default filters and resolves their names", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi);
  await openList(page);

  // the first search is fired by the filter on mount, with no interaction
  expect(listCalls(mockApi)[0]).toEqual({
    // the page opens on segment 1 whenever any segment exists — it is a
    // hardcoded default, not the first segment of the list
    idSegment: 1,
    idDepartment: [],
    nextAppointmentStartDate: null,
    nextAppointmentEndDate: null,
    scheduledBy: [],
    attendedBy: [],
    appointment: null,
    dischargeDateStart: null,
    dischargeDateEnd: null,
    tags: null,
  });

  await expect(rows(page).nth(0)).toContainText("Fulano Beltrano");
  await expect(rows(page).nth(1)).toContainText("Ciclano de Tal");
  await expect(rows(page).nth(2)).toContainText("Maria Teste");

  // only the first paragraph of the observation reaches the column
  await expect(rows(page).nth(0)).toContainText("Primeira linha");
  await expect(rows(page).nth(0)).not.toContainText("Segunda linha");

  await expect(rows(page).nth(0)).toContainText("10/03/2026");

  // the action is a Button, not an anchor: it opens the prescription of the
  // row in a new tab through window.open
  const popupPromise = page.waitForEvent("popup");
  await rows(page).nth(0).locator("button.gtm-bt-detail-patient").click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(/\/prescricao\/9001$/);
});

test("the setor options follow the selected segmento", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi);
  await openList(page);

  await openSelectById(page, "departments");
  const options = page.locator(
    ".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option",
  );
  // segment 1 owns a single department, and the one it shares with segment 2
  // is listed once
  await expect(options).toHaveCount(1);
  await expect(options).toHaveText("AMBULATORIO CENTRAL");

  await pickOption(page, "AMBULATORIO CENTRAL");
  await page.keyboard.press("Escape");
  await search(page, mockApi);

  expect(listCalls(mockApi).at(-1)).toMatchObject({
    idSegment: 1,
    idDepartment: [10],
  });
});

test("the secondary filters are counted in the badge and sent with the search", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi);
  await openList(page);

  await page.getByRole("button", { name: "Ver mais" }).click();

  await openSelect(
    page.locator(".ant-select").filter({ hasText: "tipo de conciliação" }),
  );
  await pickOption(page, "Com agendamento");

  await openSelect(
    page.locator(".ant-select").filter({ hasText: "Selecione os marcadores" }),
  );
  await pickOption(page, "Diabetes");
  await page.keyboard.press("Escape");

  // segmento, setores and the appointment dates are excluded from the count,
  // so only the two filters chosen above are announced
  await expect(page.locator(".ant-badge-count")).toHaveText("2");

  await search(page, mockApi);

  expect(listCalls(mockApi).at(-1)).toMatchObject({
    appointment: "scheduled",
    tags: ["Diabetes"],
  });
});

test("only the rows carrying marcadores expand", async ({ page, mockApi }) => {
  installHandlers(mockApi);
  await openList(page);

  // the untagged patient keeps the column spacer instead of a real control
  await expect(
    rows(page).nth(1).locator("button.ant-table-row-expand-icon"),
  ).toHaveClass(/ant-table-row-expand-icon-spaced/);
  await expect(
    rows(page).nth(0).locator("button.ant-table-row-expand-icon"),
  ).toHaveClass(/ant-table-row-expand-icon-collapsed/);

  await page.locator("button.expand-all").click();

  await expect(page.getByText("Diabetes")).toBeVisible();
  await expect(page.getByText("Hipertensão")).toBeVisible();
  await expect(page.getByText("Oncologia")).toBeVisible();
  await expect(page.getByText("Sem marcadores")).toHaveCount(0);

  // collapsing leaves the rows in the DOM (antd only hides them), so the
  // assertion has to be about visibility and not about presence
  await page.locator("button.expand-all").click();
  await expect(page.getByText("Oncologia")).toBeHidden();
  await expect(page.getByText("Diabetes")).toBeHidden();
});

test("the search box filters by name and by atendimento, without a new request", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi);
  await openList(page);
  const requestsBefore = listCalls(mockApi).length;

  const searchBox = page.getByPlaceholder("Buscar por paciente ou nº");

  // three characters or fewer leave the list untouched
  await searchBox.fill("Ful");
  await expect(rows(page)).toHaveCount(PATIENTS.length);

  await searchBox.fill("beltrano");
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).nth(0)).toContainText("Fulano Beltrano");

  // the atendimento matches exactly, and the name filter is case/accent blind
  await searchBox.fill("333333");
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).nth(0)).toContainText("Maria Teste");

  await searchBox.fill("");
  await expect(rows(page)).toHaveCount(PATIENTS.length);

  expect(listCalls(mockApi)).toHaveLength(requestsBefore);
});

test("a failing list reports the error and leaves the empty state", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi);
  mockApi.override("POST /patient/list", {
    status: 500,
    json: { status: "error", message: "boom" },
  });

  await page.goto("/pacientes-ambulatoriais");

  await expect(
    page.getByText("Ops! Algo de errado aconteceu.").first(),
  ).toBeVisible();
  await expect(
    page.getByRole("cell").getByText("Nenhum registro encontrado"),
  ).toBeVisible();
  await expect(rows(page)).toHaveCount(0);
});
