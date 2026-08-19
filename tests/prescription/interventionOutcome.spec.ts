import { test, expect } from "@playwright/test";
import {
  interventionReasonSelect,
  openDrugIntervention,
  openPatientIntervention,
  saveInterventionAs,
  selectOption,
} from "../support/prescription";

test("outcome: suspension", async ({ page }) => {
  await page.goto("/prescricao/198");

  await page
    .getByRole("heading", { name: "Prescrição nº 198 Liberada em" })
    .click();
  await page
    .getByText("Paciente 99")
    .waitFor({ state: "visible", timeout: 30000 });

  await openDrugIntervention(page, 0);

  const reasons = await interventionReasonSelect(page);

  await reasons.click();
  await page.locator(".rc-virtual-list-holder-inner").hover();
  await page.mouse.wheel(0, 1000);

  await selectOption(page, "Suspensão da terapia").click();

  // // close dropdown
  await reasons.click();

  await expect(page.getByText("Tipo economia: Suspensão")).toBeVisible({
    timeout: 30000,
  });

  await page.getByRole("textbox").click();
  await page.getByRole("textbox").fill("teste");
  await saveInterventionAs(page, "Salvar e marcar como Aceita");

  await page.locator(".btn-calc-details-origin").click();
  await expect(
    page
      .locator("div")
      .filter({
        hasText:
          /^Dose dispensada \(mg\):Frequência\/Dia:Custo \/ \(mg\):R\$Custo KIT:R\$$/,
      })
      .getByRole("spinbutton")
      .first(),
  ).toHaveValue("5,000000");
  await expect(
    page
      .locator("div")
      .filter({
        hasText:
          /^Dose dispensada \(mg\):Frequência\/Dia:Custo \/ \(mg\):R\$Custo KIT:R\$$/,
      })
      .getByRole("spinbutton")
      .nth(1),
  ).toHaveValue("2,000000");
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Custo \/ \(mg\):R\$$/ })
      .getByRole("spinbutton"),
  ).toHaveValue("4,520000");
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Custo KIT:R\$$/ })
      .getByRole("spinbutton"),
  ).toHaveValue("0,000000");

  expect(
    page
      .locator("div")
      .filter({ hasText: /^Custo por dia:R\$$/ })
      .getByRole("spinbutton"),
  ).toHaveValue("45,200000");

  await page.locator(".input-price").hover();
  await page.locator(".input-price").getByLabel("Increase Value").click();
  await page.locator(".input-price-kit").hover();
  await page.locator(".input-price-kit").getByLabel("Increase Value").click();

  expect(
    page
      .locator("div")
      .filter({ hasText: /^Custo por dia:R\$$/ })
      .getByRole("spinbutton"),
  ).toHaveValue("57,200000");

  await page.getByRole("button", { name: "Aceitar Intervenção" }).click();
});

test("outcome: substitution", async ({ page }) => {
  await page.goto("/prescricao/198");

  await page
    .getByRole("heading", { name: "Prescrição nº 198 Liberada em" })
    .click();
  await page
    .getByText("Paciente 99")
    .waitFor({ state: "visible", timeout: 30000 });
  await openDrugIntervention(page, 1);

  const reasons = await interventionReasonSelect(page);

  await reasons.click();
  await page.locator(".rc-virtual-list-holder-inner").hover();
  await page.mouse.wheel(0, 1000);

  await selectOption(page, "Substituição").click();

  // // close dropdown
  await reasons.click();

  await expect(page.getByText("Tipo economia: Substituição")).toBeVisible({
    timeout: 30000,
  });

  await page.getByRole("textbox").click();
  await page.getByRole("textbox").fill("teste");
  await saveInterventionAs(page, "Salvar e marcar como Aceita");

  // price origin
  await expect(page.locator("#origin-price-per-day").first()).toHaveValue(
    "209,800000",
  );

  //price destination
  await expect(page.locator("#destiny-price-per-day")).toHaveValue(
    "104,900000",
  );

  // final value
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Economia\/Dia:R\$Manual$/ })
      .getByRole("spinbutton"),
  ).toHaveValue("104,900000");

  // increase kit value
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "caret-down" })
    .nth(1)
    .click();
  await page.locator("#destiny-price-kit").locator("..").first().hover();
  const increase = page
    .locator("#destiny-price-kit")
    .locator("..")
    .locator(".ant-input-number-action-up");

  await increase.click();
  await increase.click();

  //check price again
  await expect(page.locator("#destiny-price-per-day")).toHaveValue(
    "106,900000",
  );

  // check final value
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Economia\/Dia:R\$Manual$/ })
      .getByRole("spinbutton"),
  ).toHaveValue("102,900000");

  await page.getByRole("button", { name: "Aceitar Intervenção" }).click();
});

test("outcome: custom", async ({ page }) => {
  await page.goto("/prescricao/198");

  await page
    .getByRole("heading", { name: "Prescrição nº 198 Liberada em" })
    .click();
  await page
    .getByText("Paciente 99")
    .waitFor({ state: "visible", timeout: 30000 });

  await openPatientIntervention(page);

  const reasons = await interventionReasonSelect(page);

  await reasons.click();
  await selectOption(page, "Alta antecipada").click();

  // // close dropdown
  await reasons.click();

  await page.getByRole("textbox").click();
  await page.getByRole("textbox").fill("teste paciente");
  await saveInterventionAs(page, "Salvar e marcar como Aceita");

  await page.getByRole("button", { name: "Aceitar Intervenção" }).click();
  await expect(page.getByText("Quantidade de Dias de")).toBeVisible({
    timeout: 30000,
  });

  await page
    .locator("div")
    .filter({ hasText: /^Economia\/Dia:R\$Manual$/ })
    .getByRole("spinbutton")
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^Economia\/Dia:R\$Manual$/ })
    .getByRole("spinbutton")
    .fill("123");
  await page
    .locator("div")
    .filter({ hasText: /^Qtd\. de dias de economia: DiasManual$/ })
    .getByRole("spinbutton")
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^Qtd\. de dias de economia: DiasManual$/ })
    .getByRole("spinbutton")
    .fill("3");
  await page.getByRole("button", { name: "Aceitar Intervenção" }).click();
});

test("outcome: suspension (not accepted)", async ({ page }) => {
  await page.goto("/prescricao/198");

  await page
    .getByRole("heading", { name: "Prescrição nº 198 Liberada em" })
    .click();
  await page
    .getByText("Paciente 99")
    .waitFor({ state: "visible", timeout: 30000 });
  await openDrugIntervention(page, 2);

  const reasons = await interventionReasonSelect(page);

  await reasons.click();
  await page.locator(".rc-virtual-list-holder-inner").hover();
  await page.mouse.wheel(0, 1000);

  await selectOption(page, "Suspensão da terapia").click();

  // // close dropdown
  await reasons.click();

  await expect(page.getByText("Tipo economia: Suspensão")).toBeVisible({
    timeout: 30000,
  });

  await page.getByRole("textbox").click();
  await page.getByRole("textbox").fill("teste");
  await saveInterventionAs(page, "Salvar e marcar como Não Aceita");

  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Qtd\. de dias de economia: DiasManual$/ })
      .getByRole("spinbutton"),
  ).toHaveValue("1");

  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Qtd\. de dias de economia: DiasManual$/ })
      .getByRole("spinbutton"),
  ).toBeEnabled();

  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Economia\/Dia:R\$Manual$/ })
      .getByRole("spinbutton"),
  ).toHaveValue("0,000000");

  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Economia\/Dia:R\$Manual$/ })
      .getByRole("spinbutton"),
  ).toBeEnabled();

  await page.getByRole("button", { name: "Não Aceitar Intervenção" }).click();

  // check interventions tab
  await page
    .locator("#rc-tabs-1-tab-intervention")
    .getByText("Intervenções")
    .click();
  await page.getByRole("button", { name: "rollback" }).last().click();

  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Economia\/Dia:R\$Manual$/ })
      .getByRole("spinbutton"),
  ).toHaveValue("0,000000");

  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Economia\/Dia:R\$Manual$/ })
      .getByRole("spinbutton"),
  ).toBeDisabled();

  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Qtd\. de dias de economia: DiasManual$/ })
      .getByRole("spinbutton"),
  ).toHaveValue("1");

  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Qtd\. de dias de economia: DiasManual$/ })
      .getByRole("spinbutton"),
  ).toBeDisabled();
});
