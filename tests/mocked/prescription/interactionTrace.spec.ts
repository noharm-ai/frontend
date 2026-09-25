import type { Page, Route } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";
import { openSelect, pickOption } from "../support/antd";

/**
 * Interaction trace (features/prescription/InteractionTrace). A maintainer
 * selects items in the prescription drug list (multiple selection) and opens
 * "Detalhar interação" from the selection actions: two items are explained
 * against each other, a single one against an allergy picked in the modal.
 * The trace says why the interaction analysis (backend
 * alert_interaction_service) raised an alert or not.
 */

const BASE_PERMISSIONS = [
  "READ_BASIC_FEATURES",
  "WRITE_BASIC_FEATURES",
  "READ_PRESCRIPTION",
  "WRITE_PRESCRIPTION",
];

const OPTIONS = {
  idPrescription: "199",
  evaluatedAt: "2026-01-01T10:00:00",
  isCpoe: false,
  agg: false,
  items: [
    {
      idPrescriptionDrug: "9001",
      idPrescription: "199",
      drug: "Dipirona 500mg",
      substance: "Dipirona",
      sctid: "1001",
      source: "Medicamentos",
      suspended: false,
      eligible: true,
      ineligibilityReason: null,
    },
    {
      idPrescriptionDrug: "9002",
      idPrescription: "199",
      drug: "Omeprazol 20mg",
      substance: "Omeprazol",
      sctid: "1002",
      source: "Medicamentos",
      suspended: false,
      eligible: true,
      ineligibilityReason: null,
    },
  ],
  allergies: [],
  allergiesWithoutSubstance: [],
  trace: null,
};

const side = (item: (typeof OPTIONS.items)[number]) => ({
  ...item,
  intravenous: false,
  group: null,
  frequency: 1,
  interval: null,
  prescriptionDate: "2026-01-01T08:00:00",
  expireDate: "2026-01-02T08:00:00",
});

const TRACE = {
  from: side(OPTIONS.items[0]),
  to: side(OPTIONS.items[1]),
  isAllergy: false,
  compared: true,
  alerted: false,
  summary:
    "Nenhum alerta: há relação ativa entre as substâncias, mas as regras do tipo de relação não foram atendidas (veja o detalhe abaixo).",
  notes: [],
  checks: [
    {
      rule: "eligible",
      passed: true,
      message: "Dipirona 500mg: participa da análise de interações.",
    },
    {
      rule: "eligible",
      passed: true,
      message: "Omeprazol 20mg: participa da análise de interações.",
    },
    {
      rule: "period",
      passed: true,
      message: "Os itens têm a mesma data de vigência.",
    },
  ],
  relations: [
    {
      sctida: "1001",
      sctidb: "1002",
      substanceA: "Dipirona",
      substanceB: "Omeprazol",
      kind: "iy",
      label: "Incompatibilidade em Y",
      active: true,
      level: "high",
      // relation texts are stored as HTML
      text: "<p><strong>GRAVE</strong>. Texto de teste da relação.</p>",
    },
  ],
  kinds: [
    {
      kind: "iy",
      label: "Incompatibilidade em Y",
      directions: [
        {
          from: "Dipirona 500mg",
          to: "Omeprazol 20mg",
          relation: null,
          rules: [
            {
              rule: "not_allergy",
              passed: true,
              message:
                "Este tipo de relação só é avaliado entre dois itens prescritos (não se aplica a alergias).",
            },
            {
              rule: "intravenous",
              passed: false,
              message:
                "Os dois itens precisam ser intravenosos (Dipirona 500mg: não; Omeprazol 20mg: não).",
            },
          ],
          alerted: false,
          alert: null,
          message: "Há relação ativa, mas uma regra não foi atendida.",
        },
      ],
    },
    {
      kind: "it",
      label: "Interação Medicamentosa",
      directions: [
        {
          from: "Dipirona 500mg",
          to: "Omeprazol 20mg",
          relation: null,
          rules: [],
          alerted: false,
          alert: null,
          message: "Não há relação cadastrada neste sentido.",
        },
      ],
    },
  ],
};
// the first direction carries the relation found above
TRACE.kinds[0].directions[0].relation = TRACE.relations[0] as never;

const openPrescription = async (page: Page) => {
  await page.goto("/prescricao/199");
  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();
};

const selectDrugs = async (page: Page, names: string[]) => {
  await page.getByRole("button", { name: "Ativar seleção múltipla" }).click();
  for (const name of names) {
    await page
      .locator("tr", { hasText: name })
      .locator(".anticon-border")
      .first()
      .click();
  }
  await expect(
    page.getByRole("button", { name: `${names.length} selecionados` }),
  ).toBeVisible();
};

/** Opens the dropdown next to the "N selecionados" button. */
const openSelectionActions = async (page: Page) => {
  await page
    .locator(".ant-space-compact, .ant-dropdown-button", {
      has: page.getByRole("button", { name: /selecionados/ }),
    })
    .getByRole("button")
    .last()
    .hover();
};

/** Answers the trace with the options, adding TRACE once a pair is sent. */
const mockTrace = (mockApi: MockApi) => {
  const traceParams: URLSearchParams[] = [];
  mockApi.override("GET /prescriptions/interaction-trace", (route: Route) => {
    const params = new URL(route.request().url()).searchParams;
    traceParams.push(params);
    const paired =
      params.has("idPrescriptionDrugTo") || params.has("sctidAllergy");

    return route.fulfill({
      json: {
        status: "success",
        data: { ...OPTIONS, trace: paired ? TRACE : null },
      },
    });
  });

  return traceParams;
};

test.use({ storageState: { cookies: [], origins: [] } });

test("the action is only offered to maintainers", async ({ page, mockApi }) => {
  await loginWithPermissions(page, mockApi, BASE_PERMISSIONS);
  await openPrescription(page);
  await selectDrugs(page, ["Dipirona 500mg", "Omeprazol 20mg"]);

  await openSelectionActions(page);
  await expect(page.getByText("Enviar intervenção")).toBeVisible();
  await expect(page.getByText("Detalhar interação")).toHaveCount(0);
});

test("two selected drugs are explained against each other", async ({
  page,
  mockApi,
}) => {
  const traceParams = mockTrace(mockApi);
  await loginWithPermissions(page, mockApi, [
    ...BASE_PERMISSIONS,
    "MAINTAINER",
  ]);
  await openPrescription(page);
  await selectDrugs(page, ["Dipirona 500mg", "Omeprazol 20mg"]);

  await openSelectionActions(page);
  await page.getByText("Detalhar interação", { exact: true }).click();

  const modal = page.locator(".ant-modal", {
    hasText: "Explicação das interações",
  });
  await expect(modal.getByText(TRACE.summary)).toBeVisible();
  await expect(
    modal.getByText("Os dois itens precisam ser intravenosos", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    modal.getByText("Sem relação cadastrada: Interação Medicamentosa"),
  ).toBeVisible();
  // both items side by side, one row per compared attribute
  const intravenousRow = modal.locator("tr", { hasText: "Intravenoso" });
  await expect(intravenousRow.locator("td")).toHaveText(["não", "não"]);
  // the HTML is rendered, not shown as markup
  await expect(modal.locator("strong", { hasText: "GRAVE" })).toBeVisible();
  await expect(modal.getByText("<strong>", { exact: false })).toHaveCount(0);
  // the pair comes from the list: nothing left to pick in the modal
  await expect(modal.locator(".ant-select")).toHaveCount(0);

  // every request carried the pair (dev StrictMode may repeat it)
  expect(traceParams.length).toBeGreaterThan(0);
  for (const params of traceParams) {
    expect(params.get("idPrescriptionDrugFrom")).toBe("9001");
    expect(params.get("idPrescriptionDrugTo")).toBe("9002");
  }
});

test("a single selected drug is explained against an allergy", async ({
  page,
  mockApi,
}) => {
  const traceParams = mockTrace(mockApi);
  mockApi.override("GET /prescriptions/interaction-trace", (route: Route) => {
    const params = new URL(route.request().url()).searchParams;
    traceParams.push(params);

    return route.fulfill({
      json: {
        status: "success",
        data: {
          ...OPTIONS,
          allergies: [{ sctid: "2001", name: "Penicilina" }],
          trace: params.has("sctidAllergy")
            ? {
                ...TRACE,
                isAllergy: true,
                kinds: [],
                summary: "Resumo alergia",
              }
            : null,
        },
      },
    });
  });
  await loginWithPermissions(page, mockApi, [
    ...BASE_PERMISSIONS,
    "MAINTAINER",
  ]);
  await openPrescription(page);
  await selectDrugs(page, ["Dipirona 500mg"]);

  await openSelectionActions(page);
  await page.getByText("Detalhar interação com alergia").click();

  const modal = page.locator(".ant-modal", {
    hasText: "Explicação das interações",
  });
  await expect(modal.getByText("Selecione uma alergia para ver")).toBeVisible();

  await openSelect(modal);
  await pickOption(page, "Penicilina");
  await expect(modal.getByText("Resumo alergia")).toBeVisible();

  const last = traceParams[traceParams.length - 1];
  expect(last.get("idPrescriptionDrugFrom")).toBe("9001");
  expect(last.get("sctidAllergy")).toBe("2001");
  expect(traceParams.some((p) => p.has("idPrescriptionDrugTo"))).toBe(false);
});
