import { test, expect } from "@playwright/test";
import {
  interventionReasonSelect,
  openDrugIntervention,
  openPatientIntervention,
  saveInterventionAs,
  selectOption,
} from "../support/prescription";

test("add intervention", async ({ page }) => {
  await page.goto("/prescricao/199");

  await page
    .getByRole("heading", { name: "Prescrição nº 199 Liberada em" })
    .click();
  await page
    .getByText("Paciente 99")
    .waitFor({ state: "visible", timeout: 30000 });

  await openDrugIntervention(page, 1);

  // wait to load reasons
  const reasons = await interventionReasonSelect(page);

  await reasons.click();
  await selectOption(page, "Alergia").click();

  // close dropdown
  await reasons.click();

  await page.getByRole("textbox").click();
  await page.getByRole("textbox").fill("teste");
  await page.getByRole("button", { name: "Salvar" }).click();

  await openDrugIntervention(page, 1);
  await expect(page.locator(".ant-modal-body .intervention")).toHaveCount(1);
  await expect(page.getByText("Alergia")).toBeVisible();
});

test("add multiple interventions and rollback", async ({ page }) => {
  await page.goto("/prescricao/199");

  await expect(page.getByText("Medicamentos")).toBeVisible({ timeout: 30000 });

  // click intervention button
  await openDrugIntervention(page, 2);

  // wait to load reasons
  let reasons = await interventionReasonSelect(page);

  await reasons.click();
  // select intervention reason
  await selectOption(page, "Alergia").click();

  // close dropdown
  await reasons.click();

  await page.getByRole("textbox").click();
  await page.getByRole("textbox").fill("teste");
  await page.getByRole("button", { name: "Salvar" }).click();

  // click intervention button
  await openDrugIntervention(page, 2);
  // should have 1 intervention
  await expect(page.locator(".ant-modal-body .intervention")).toHaveCount(1);
  // add another intervention
  await page.getByRole("button", { name: "plus Nova intervenção" }).click();
  // select intervention reason
  // wait to load reasons
  reasons = await interventionReasonSelect(page);

  await reasons.click();
  // the seeded reason list has two "Aprazamento" entries
  await selectOption(page, "Aprazamento").nth(1).click();
  // close dropdown
  await reasons.click();

  await page.getByRole("textbox").click();
  await page.getByRole("textbox").fill("teste");

  await saveInterventionAs(page, "Salvar e marcar como Aceita");
  await page.getByRole("button", { name: "Aceitar Intervenção" }).click();

  //check created interventions
  await openDrugIntervention(page, 2);

  //should have 2 interventions
  await expect(page.locator(".ant-modal-body .intervention")).toHaveCount(2);
  await expect(page.getByText("Aprazamento")).toBeVisible({ timeout: 30000 });
  await expect(page.getByText("Alergia")).toBeVisible({ timeout: 30000 });
  await expect(page.getByText("Pendente", { exact: true })).toBeVisible({
    timeout: 30000,
  });
  await expect(page.getByText("Aceita", { exact: true })).toBeVisible({
    timeout: 30000,
  });

  await page.locator(".ant-modal-confirm-btns button").first().click();

  await openDrugIntervention(page, 2);
  await page.getByText("Pendente", { exact: true }).click();
  // scoped to the modal: the page header has a rollback button of its own
  // whenever the prescription happens to be checked
  await page
    .locator(".ant-modal")
    .getByRole("button", { name: "rollback" })
    .click();
  await openDrugIntervention(page, 2);

  //should have 1 intervention
  await expect(page.locator(".ant-modal-body .intervention")).toHaveCount(1);
});

test("add patient intervention", async ({ page }) => {
  await page.goto("/prescricao/199");

  await page
    .getByRole("heading", { name: "Prescrição nº 199 Liberada em" })
    .click();

  await page
    .locator(".gtm-bt-patient-intervention")
    .waitFor({ state: "visible", timeout: 30000 });

  await openPatientIntervention(page);

  // wait to load reasons
  const reasons = await interventionReasonSelect(page);

  await reasons.click();
  await selectOption(page, "Diluição", { exact: true }).click();

  // close dropdown
  await reasons.click();

  await page.getByRole("textbox").click();
  await page.getByRole("textbox").fill("teste paciente");
  await page.getByRole("button", { name: "Salvar" }).click();

  // check if it was created
  await openPatientIntervention(page);
  await expect(page.locator(".ant-modal-body .intervention")).toHaveCount(1);
});
