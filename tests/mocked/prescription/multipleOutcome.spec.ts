import type { Page, Route } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";
import { pickOption } from "../support/antd";

/**
 * Bulk intervention outcome ("Desfecho múltiplo",
 * src/features/intervention/MultipleOutcome).
 *
 * The flow loops over the single-item endpoints — GET
 * /intervention/outcome-data then POST /intervention/set-outcome per
 * intervention — auto-applying deterministic outcomes and queueing
 * accepted substitution/custom-economy interventions for individual
 * review.
 */

type OutcomeFixtureMap = Record<string, string>;

const interventionRow = (
  idIntervention: number,
  drugName: string,
  status = "s",
) => ({
  idIntervention,
  id: "0",
  idPrescription: "199",
  idPrescriptionDrug: "0",
  admissionNumber: 9999,
  drugName,
  status,
  date: new Date().toISOString().slice(0, 19),
  reasonDescription: "Ajuste de Dose",
});

/** GET /prescriptions/199 with the given interventions on board. */
const prescriptionWithInterventions = (
  rows: ReturnType<typeof interventionRow>[],
) => {
  const fixture = loadFixture<{ data: { interventions: unknown[] } }>(
    "prescriptions/single-199.json",
  );
  fixture.data.interventions = rows;
  return { json: fixture };
};

/**
 * GET /intervention/outcome-data keyed by the idIntervention query param.
 * The requested id is patched into the fixture (the app posts
 * outcomeData.idIntervention back on set-outcome). Also records the
 * `edit` query param, which must never be sent by the bulk flow.
 */
const outcomeDataHandler = (
  fixtures: OutcomeFixtureMap,
  editParams: (string | null)[],
) => {
  return (route: Route) => {
    const url = new URL(route.request().url());
    const id = url.searchParams.get("idIntervention")!;
    editParams.push(url.searchParams.get("edit"));

    const fixture = loadFixture<{ data: { idIntervention: number } }>(
      fixtures[id],
    );
    fixture.data.idIntervention = Number(id);
    return route.fulfill({ status: 200, json: fixture });
  };
};

const setOutcomeCalls = (mockApi: MockApi) =>
  mockApi.requests
    .filter((r) => r.method === "POST" && r.path === "/intervention/set-outcome")
    .map((r) => JSON.parse(r.postData!));

async function openInterventionsTab(page: Page) {
  await page.goto("/prescricao/199");
  await expect(page.getByText("Dipirona 500mg").first()).toBeVisible();
  await page.getByRole("tab", { name: /Intervenções/ }).click();
}

/** The three-dot trigger on the right side of the bulk Dropdown.Button. */
const openBulkMenu = (page: Page) =>
  page.locator(".bulk-outcome-actions .ant-dropdown-trigger").click();

async function selectAllPending(page: Page) {
  await openBulkMenu(page);
  await page
    .getByRole("menuitem", { name: "Selecionar todas pendentes" })
    .click();
}

async function applyOutcome(page: Page, outcomeLabel: string) {
  await openBulkMenu(page);
  await page.getByRole("menuitem", { name: outcomeLabel, exact: true }).click();

  // confirm stage of the bulk modal
  const modal = page.locator(".ant-modal", { hasText: "Desfecho múltiplo" });
  await expect(modal).toBeVisible();
  await modal.getByRole("button", { name: "Aplicar desfechos" }).click();
  return modal;
}

test("applies a negative outcome in bulk and skips already-closed interventions", async ({
  page,
  mockApi,
}) => {
  const editParams: (string | null)[] = [];

  mockApi.override(
    "GET /prescriptions/:id",
    prescriptionWithInterventions([
      interventionRow(301, "Dipirona 500mg"),
      interventionRow(302, "Omeprazol 20mg"),
      interventionRow(303, "BISACODIL 10 mg CP"),
      // pending in the (stale) table, but already closed server-side
      interventionRow(305, "Paracetamol 750mg"),
    ]),
  );
  mockApi.override(
    "GET /intervention/outcome-data",
    outcomeDataHandler(
      {
        "301": "interventions/outcome-data-null.json",
        "302": "interventions/outcome-data-suspension.json",
        "303": "interventions/outcome-data-substitution.json",
        "305": "interventions/outcome-data-closed.json",
      },
      editParams,
    ),
  );
  mockApi.override("POST /intervention/set-outcome", {
    json: { status: "success", data: true },
  });

  await openInterventionsTab(page);
  await selectAllPending(page);
  await expect(
    page.getByRole("button", { name: "4 selecionadas" }),
  ).toBeVisible();

  const modal = await applyOutcome(page, "Não aceita");

  // report: 3 applied, the stale-closed one skipped, no review needed
  await expect(
    modal.getByText("Desfechos aplicados com sucesso!"),
  ).toBeVisible();
  await expect(
    modal.getByText("Aplicados: 3 | Ignorados: 1 | Erros: 0"),
  ).toBeVisible();

  const calls = setOutcomeCalls(mockApi);
  expect(calls).toHaveLength(3);
  expect(calls.map((c) => c.idIntervention).sort()).toEqual([301, 302, 303]);
  calls.forEach((call) => {
    expect(call).toMatchObject({
      outcome: "n",
      economyDayValue: "0",
      economyDayValueManual: true,
      economyDayAmount: 1,
      economyDayAmountManual: true,
    });
  });

  // the bulk flow must never send the edit param
  expect(editParams).toEqual([null, null, null, null]);

  // skip report lists the closed intervention
  await modal.getByText("Ignorados (1)").click();
  await expect(modal.getByText("Paracetamol 750mg")).toBeVisible();
  await expect(modal.getByText("Já possui desfecho")).toBeVisible();

  await modal
    .locator(".ant-modal-footer")
    .getByRole("button", { name: "Fechar" })
    .click();
  await expect(modal).not.toBeVisible();

  // list status was synced: the applied rows now show "Não aceita"
  await expect(page.locator(".ant-table").getByText("Não aceita")).toHaveCount(
    3,
  );
});

test("accepting in bulk auto-applies calculable economies and reviews the rest", async ({
  page,
  mockApi,
}) => {
  const editParams: (string | null)[] = [];

  mockApi.override(
    "GET /prescriptions/:id",
    prescriptionWithInterventions([
      interventionRow(301, "Dipirona 500mg"),
      interventionRow(302, "Omeprazol 20mg"),
      interventionRow(303, "BISACODIL 10 mg CP"),
      interventionRow(304, "Intervenção no paciente"),
    ]),
  );
  mockApi.override(
    "GET /intervention/outcome-data",
    outcomeDataHandler(
      {
        "301": "interventions/outcome-data-null.json",
        "302": "interventions/outcome-data-suspension.json",
        "303": "interventions/outcome-data-substitution.json",
        "304": "interventions/outcome-data-custom.json",
      },
      editParams,
    ),
  );
  mockApi.override("POST /intervention/set-outcome", {
    json: { status: "success", data: true },
  });

  await openInterventionsTab(page);
  await selectAllPending(page);

  const modal = await applyOutcome(page, "Aceita");

  // substitution (303) needs review: confirm with the pre-selected destiny
  await expect(modal.getByText("Revisão 1 de 2")).toBeVisible();
  await expect(modal.getByText("BISACODIL 10 mg CP").first()).toBeVisible();
  await modal.getByRole("button", { name: "Confirmar e próximo" }).click();

  // custom economy (304) needs review: day amount is required
  await expect(modal.getByText("Revisão 2 de 2")).toBeVisible();
  await modal
    .locator(".form-row", { hasText: "Qtd. de dias de economia" })
    .locator(".ant-input-number-input")
    .fill("3");
  await modal.getByRole("button", { name: "Confirmar e próximo" }).click();

  await expect(
    modal.getByText("Desfechos aplicados com sucesso!"),
  ).toBeVisible();
  await expect(
    modal.getByText("Aplicados: 4 | Ignorados: 0 | Erros: 0"),
  ).toBeVisible();

  const calls = setOutcomeCalls(mockApi);
  expect(calls).toHaveLength(4);

  // auto-applied: no economy
  const nullCall = calls.find((c) => c.idIntervention === 301);
  expect(nullCall).toMatchObject({
    outcome: "a",
    economyDayValueManual: false,
    economyDayAmountManual: false,
  });

  // auto-applied: suspension with the backend-calculated value
  const suspensionCall = calls.find((c) => c.idIntervention === 302);
  expect(suspensionCall).toMatchObject({
    outcome: "a",
    economyDayValue: 45.2,
    economyDayValueManual: false,
    economyDayAmountManual: false,
  });

  // reviewed: substitution keeps the pre-selected destiny
  const substitutionCall = calls.find((c) => c.idIntervention === 303);
  expect(substitutionCall).toMatchObject({
    outcome: "a",
    idPrescriptionDrugDestiny: "48",
    economyDayValue: 22.6,
    economyDayValueManual: false,
  });

  // reviewed: custom economy is fully manual
  const customCall = calls.find((c) => c.idIntervention === 304);
  expect(customCall).toMatchObject({
    outcome: "a",
    economyDayValue: 15.5,
    economyDayValueManual: true,
    economyDayAmount: 3,
    economyDayAmountManual: true,
  });

  expect(editParams).toEqual([null, null, null, null]);
});

test("skipping a review item reports it without posting", async ({
  page,
  mockApi,
}) => {
  mockApi.override(
    "GET /prescriptions/:id",
    prescriptionWithInterventions([
      interventionRow(303, "BISACODIL 10 mg CP"),
      interventionRow(304, "Intervenção no paciente"),
    ]),
  );
  mockApi.override(
    "GET /intervention/outcome-data",
    outcomeDataHandler(
      {
        "303": "interventions/outcome-data-substitution.json",
        "304": "interventions/outcome-data-custom.json",
      },
      [],
    ),
  );
  mockApi.override("POST /intervention/set-outcome", {
    json: { status: "success", data: true },
  });

  await openInterventionsTab(page);
  await selectAllPending(page);

  const modal = await applyOutcome(page, "Aceita");

  await expect(modal.getByText("Revisão 1 de 2")).toBeVisible();
  await modal.getByRole("button", { name: "Pular" }).click();

  await expect(modal.getByText("Revisão 2 de 2")).toBeVisible();
  await modal.getByRole("button", { name: "Cancelar restantes" }).click();

  await expect(
    modal.getByText("Aplicados: 0 | Ignorados: 2 | Erros: 0"),
  ).toBeVisible();
  expect(setOutcomeCalls(mockApi)).toHaveLength(0);
});

test("applies a bulk outcome from the interventions list page", async ({
  page,
  mockApi,
}) => {
  const editParams: (string | null)[] = [];

  const listRow = (idIntervention: number, drugName: string, status = "s") => ({
    ...interventionRow(idIntervention, drugName, status),
    user: "Usuário Teste",
    prescriber: "Dr. Prescritor",
    department: "UTI",
    idInterventionReason: [1],
  });

  mockApi.override("POST /intervention/search", {
    json: {
      status: "success",
      data: [
        listRow(301, "Dipirona 500mg"),
        listRow(302, "Omeprazol 20mg"),
        listRow(306, "Paracetamol 750mg", "a"), // closed: not selectable
      ],
    },
  });
  mockApi.override("GET /intervention/reasons", {
    json: { status: "success", data: [] },
  });
  mockApi.override(
    "GET /intervention/outcome-data",
    outcomeDataHandler(
      {
        "301": "interventions/outcome-data-null.json",
        "302": "interventions/outcome-data-suspension.json",
      },
      editParams,
    ),
  );
  mockApi.override("POST /intervention/set-outcome", {
    json: { status: "success", data: true },
  });

  await page.goto("/intervencoes");
  await expect(page.getByText("Dipirona 500mg")).toBeVisible();

  await selectAllPending(page);
  await expect(
    page.getByRole("button", { name: "2 selecionadas" }),
  ).toBeVisible();

  const modal = await applyOutcome(page, "Não aceita");

  await expect(
    modal.getByText("Desfechos aplicados com sucesso!"),
  ).toBeVisible();
  await expect(
    modal.getByText("Aplicados: 2 | Ignorados: 0 | Erros: 0"),
  ).toBeVisible();

  const calls = setOutcomeCalls(mockApi);
  expect(calls).toHaveLength(2);
  expect(calls.map((c) => c.idIntervention).sort()).toEqual([301, 302]);
  expect(editParams).toEqual([null, null]);

  await modal
    .locator(".ant-modal-footer")
    .getByRole("button", { name: "Fechar" })
    .click();

  // list status synced: the two rows now show "Não aceita" status tags
  await expect(
    page.locator(".ant-table").getByText("Não aceita", { exact: true }),
  ).toHaveCount(2);

  // nothing pending anymore: the bulk button stays visible but disabled
  const bulkButton = page.getByRole("button", {
    name: "Ativar seleção múltipla",
  });
  await expect(bulkButton).toBeVisible();
  await expect(bulkButton).toBeDisabled();
  await bulkButton.hover({ force: true });
  await expect(
    page.getByText("Não há intervenções pendentes para aplicar desfecho"),
  ).toBeVisible();
});

test("selection is capped at 30 interventions", async ({ page, mockApi }) => {
  const rows = Array.from({ length: 35 }, (_, i) =>
    interventionRow(400 + i, `Medicamento ${400 + i}`),
  );

  mockApi.override(
    "GET /prescriptions/:id",
    prescriptionWithInterventions(rows),
  );

  await openInterventionsTab(page);
  await selectAllPending(page);

  await expect(
    page.getByText("Máximo de 30 intervenções selecionadas por vez"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "30 selecionadas" }),
  ).toBeVisible();

  // individual toggles beyond the cap are blocked too
  await page
    .locator("tr", { hasText: "Medicamento 434" })
    .locator(".anticon-border")
    .click();
  await expect(
    page.getByRole("button", { name: "30 selecionadas" }),
  ).toBeVisible();
});

test("saving a multiple intervention with an outcome runs the bulk flow", async ({
  page,
  mockApi,
}) => {
  const editParams: (string | null)[] = [];

  mockApi.override("GET /intervention/reasons", {
    json: {
      status: "success",
      data: [
        {
          id: 1,
          name: "Ajuste de Dose",
          parentName: null,
          parenName: null,
          relationType: 0,
          suspension: false,
          substitution: false,
          customEconomy: false,
          ram: false,
          blocking: false,
        },
      ],
    },
  });
  mockApi.override("PUT /intervention", {
    json: {
      status: "success",
      data: [
        { ...interventionRow(311, "Dipirona 500mg"), id: "10" },
        { ...interventionRow(312, "Omeprazol 20mg"), id: "11" },
      ],
    },
  });
  mockApi.override(
    "GET /intervention/outcome-data",
    outcomeDataHandler(
      {
        "311": "interventions/outcome-data-null.json",
        "312": "interventions/outcome-data-null.json",
      },
      editParams,
    ),
  );
  mockApi.override("POST /intervention/set-outcome", {
    json: { status: "success", data: true },
  });

  await page.goto("/prescricao/199");
  await expect(page.getByText("Dipirona 500mg")).toBeVisible();

  // select two drugs
  await page
    .getByRole("button", { name: "Ativar seleção múltipla" })
    .click();
  await page
    .locator("tr", { hasText: "Dipirona 500mg" })
    .locator(".anticon-border")
    .click();
  await page
    .locator("tr", { hasText: "Omeprazol 20mg" })
    .locator(".anticon-border")
    .click();

  // send the multiple intervention
  await page
    .locator(".ant-dropdown-trigger", { hasText: "" })
    .filter({ has: page.locator(".anticon-ellipsis") })
    .first()
    .click();
  await page.getByRole("menuitem", { name: "Enviar intervenção" }).click();

  const interventionModal = page.locator(".ant-modal", {
    hasText: "Intervenção Múltipla",
  });
  await expect(interventionModal).toBeVisible();
  await page
    .locator(".ant-select.ant-select-loading")
    .waitFor({ state: "detached" });

  await page.locator("#reason").click();
  await pickOption(page, "Ajuste de Dose");
  await page.locator("#reason").click(); // close dropdown

  // save with an outcome — previously disabled in multiple mode
  await interventionModal
    .locator(".ant-dropdown-trigger")
    .filter({ has: page.locator(".anticon-ellipsis") })
    .click();
  await page
    .getByRole("menuitem", { name: "Salvar e marcar como Não Aceita", exact: true })
    .click();

  // bulk flow runs straight away (no confirm stage)
  const bulkModal = page.locator(".ant-modal", {
    hasText: "Desfecho múltiplo",
  });
  await expect(
    bulkModal.getByText("Desfechos aplicados com sucesso!"),
  ).toBeVisible();
  await expect(
    bulkModal.getByText("Aplicados: 2 | Ignorados: 0 | Erros: 0"),
  ).toBeVisible();

  const calls = setOutcomeCalls(mockApi);
  expect(calls).toHaveLength(2);
  expect(calls.map((c) => c.idIntervention).sort()).toEqual([311, 312]);
  calls.forEach((call) => {
    expect(call).toMatchObject({
      outcome: "n",
      economyDayValue: "0",
      economyDayValueManual: true,
      economyDayAmount: 1,
      economyDayAmountManual: true,
    });
  });
  expect(editParams).toEqual([null, null]);
});
