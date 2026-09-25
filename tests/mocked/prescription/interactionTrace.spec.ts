import type { Route } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";
import { openSelect, pickOption } from "../support/antd";

/**
 * Interaction trace (features/prescription/InteractionTrace), opened from the
 * patient card menu. It explains, for a pair of items picked by a maintainer,
 * why the interaction analysis (backend alert_interaction_service) raised an
 * alert or not. The first request lists the pickable items; picking the pair
 * sends a second one carrying both ids.
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
      text: "Texto de teste",
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

const openPatientMenu = async (page: import("@playwright/test").Page) => {
  await page.locator(".gtm-bt-patient-menu").click();
};

test.use({ storageState: { cookies: [], origins: [] } });

test("the menu entry is only offered to maintainers", async ({
  page,
  mockApi,
}) => {
  await loginWithPermissions(page, mockApi, BASE_PERMISSIONS);
  await page.goto("/prescricao/199");
  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();

  await openPatientMenu(page);
  await expect(page.getByText("Recalcular prescrição")).toBeVisible();
  await expect(page.getByText("Detalhar interações")).toHaveCount(0);
});

test("picking two items explains the interaction analysis", async ({
  page,
  mockApi,
}) => {
  const traceParams: URLSearchParams[] = [];
  mockApi.override("GET /prescriptions/interaction-trace", (route: Route) => {
    const url = new URL(route.request().url());
    traceParams.push(url.searchParams);
    const paired = url.searchParams.has("idPrescriptionDrugTo");

    return route.fulfill({
      json: {
        status: "success",
        data: { ...OPTIONS, trace: paired ? TRACE : null },
      },
    });
  });

  await loginWithPermissions(page, mockApi, [
    ...BASE_PERMISSIONS,
    "MAINTAINER",
  ]);
  await page.goto("/prescricao/199");
  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();

  await openPatientMenu(page);
  await page.getByText("Detalhar interações").click();

  const modal = page.locator(".ant-modal", {
    hasText: "Explicação das interações",
  });
  await expect(modal.getByText("Selecione dois itens")).toBeVisible();

  const selects = modal.locator(".ant-select");
  await openSelect(selects.nth(0));
  await pickOption(page, "Dipirona 500mg");
  // the first dropdown still lists Omeprazol while it animates closed
  await expect(
    page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)"),
  ).toHaveCount(0);
  await openSelect(selects.nth(1));
  await pickOption(page, "Omeprazol 20mg");

  await expect(modal.getByText(TRACE.summary)).toBeVisible();
  await expect(
    modal.getByText("Os dois itens precisam ser intravenosos", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    modal.getByText("Sem relação cadastrada: Interação Medicamentosa"),
  ).toBeVisible();

  // an incomplete pair is never sent: the list is loaded without any item and
  // the trace only once both are picked (dev StrictMode may repeat each call)
  expect(
    traceParams.filter(
      (p) => p.has("idPrescriptionDrugFrom") !== p.has("idPrescriptionDrugTo"),
    ),
  ).toHaveLength(0);
  const last = traceParams[traceParams.length - 1];
  expect(last.get("idPrescriptionDrugFrom")).toBe("9001");
  expect(last.get("idPrescriptionDrugTo")).toBe("9002");
});
