import { test, expect } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";

/**
 * Interventions recorded by an infection control review
 * (POST /infection-control/review with createIntervention) carry
 * idInfectionControlEvaluation and are kept by infection control: without
 * WRITE_INFECTION_CONTROL the screening shows them, tagged, but neither the
 * intervention form (src/components/Forms/Intervention) nor the outcome form
 * (features/intervention/InterventionOutcome) lets them be changed. The
 * outcome form learns it from GET /intervention/outcome-data (header.locked);
 * the backend refuses the change either way.
 */

const icIntervention = {
  idIntervention: 401,
  id: "9001",
  idPrescription: "199",
  idPrescriptionDrug: "9001",
  idInfectionControlEvaluation: "501",
  admissionNumber: 9999,
  drugName: "Dipirona 500mg",
  status: "s",
  date: new Date().toISOString().slice(0, 19),
  reasonDescription: "Antimicrobiano - Espectro inadequado",
  idInterventionReason: [31],
  observation: "Espectro amplo demais",
};

const LOCKED_MESSAGE =
  "Esta intervenção foi registrada pelo controle de infecção e só pode ser alterada por ele.";

test.beforeEach(({ mockApi }) => {
  const prescription = loadFixture<{ data: { interventions: unknown[] } }>(
    "prescriptions/single-199.json",
  );
  prescription.data.interventions = [icIntervention];
  mockApi.override("GET /prescriptions/:id", { json: prescription });
  mockApi.override("GET /intervention/reasons", {
    json: {
      status: "success",
      data: [
        {
          id: 31,
          name: "Espectro inadequado",
          parentName: "Antimicrobiano",
          relationType: 0,
          suspension: false,
          substitution: false,
          customEconomy: false,
          ram: false,
          blocking: false,
          infectionControl: true,
        },
      ],
    },
  });
});

test("the outcome form is locked for whoever is not infection control", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /intervention/outcome-data", (route) => {
    const fixture = loadFixture<{
      data: { idIntervention: number; header: Record<string, unknown> };
    }>("interventions/outcome-data-null.json");
    fixture.data.idIntervention = icIntervention.idIntervention;
    fixture.data.header.infectionControl = true;
    fixture.data.header.locked = true;
    return route.fulfill({ status: 200, json: fixture });
  });

  await page.goto("/prescricao/199");
  await expect(page.getByText("Dipirona 500mg").first()).toBeVisible();
  await page.getByRole("tab", { name: /Intervenções/ }).click();

  // the list tells it came from infection control
  const row = page.locator(".ant-table-row").filter({
    hasText: "Antimicrobiano - Espectro inadequado",
  });
  await expect(row).toContainText("Controle de infecção");

  await row.locator(".gtm-bt-tab-interv-status").click();
  await page.getByRole("menuitem", { name: "Aceita", exact: true }).click();

  const modal = page.locator(".ant-modal", {
    hasText: "Aceitar Intervenção",
  });
  await expect(modal.getByTestId("intervention-outcome-locked")).toHaveText(
    LOCKED_MESSAGE,
  );
  // only closing is left
  await expect(
    modal.getByRole("button", { name: "Aceitar Intervenção" }),
  ).toHaveCount(0);
  await expect(modal.getByRole("button", { name: "Cancelar" })).toBeVisible();
  expect(
    mockApi.requests.filter((r) => r.path === "/intervention/set-outcome"),
  ).toHaveLength(0);
});

test("the intervention form is locked for whoever is not infection control", async ({
  page,
}) => {
  await page.goto("/prescricao/199");
  await expect(page.getByText("Dipirona 500mg").first()).toBeVisible();

  // the drug's interventions are listed first, tagged
  await page.locator(".gtm-bt-interv").first().click();
  const choose = page.locator(".ant-modal", { hasText: "Intervenções" });
  await expect(choose).toContainText("Controle de infecção");
  await choose.locator(".intervention").click();

  const form = page.locator(".ant-modal", {
    has: page.getByTestId("intervention-form-locked"),
  });
  await expect(form.getByTestId("intervention-form-locked")).toHaveText(
    LOCKED_MESSAGE,
  );
  await expect(
    form.locator("#btn-interv-save-action button").first(),
  ).toBeDisabled();
  // nor undone
  await expect(form.locator(".gtm-bt-undo-interv")).toHaveCount(0);
});
