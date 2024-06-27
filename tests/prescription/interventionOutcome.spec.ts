import { test, expect } from "@playwright/test";

test("outcome: suspension", async ({ page }) => {
  await page.goto("/prescricao/198");

  await page
    .getByRole("heading", { name: "Prescrição nº 198 Liberada em" })
    .click();
  await page.getByText("Paciente 99").click();
  await page
    .getByRole("row", { name: "Expandir linha 1 BISACODIL 5 mg" })
    .getByRole("button")
    .nth(1)
    .click();

  await page.locator(".ant-select-selection-overflow").click();
  await page.locator(".rc-virtual-list-holder-inner").hover();
  await page.mouse.wheel(0, 1000);
  await page.mouse.wheel(0, 500);

  await page.getByText("Suspensão da terapia").click();

  // // close dropdown
  await page.locator(".ant-modal-body").click();

  await expect(page.getByText("Tipo economia: Suspensão")).toBeVisible();

  await page.getByRole("textbox").click();
  await page.getByRole("textbox").fill("teste");
  await page.locator(".ant-modal-content .ant-dropdown-trigger").hover();
  await page.getByText("Salvar e marcar como Aceita").click();

  await page.getByRole("button", { name: "caret-down" }).click();
  await expect(
    page
      .locator("div")
      .filter({
        hasText:
          /^Dose dispensada \(mg\):Frequência\/Dia:Custo \/ \(mg\):R\$Custo KIT:R\$$/,
      })
      .getByRole("spinbutton")
      .first()
  ).toHaveValue("5,000000");
  await expect(
    page
      .locator("div")
      .filter({
        hasText:
          /^Dose dispensada \(mg\):Frequência\/Dia:Custo \/ \(mg\):R\$Custo KIT:R\$$/,
      })
      .getByRole("spinbutton")
      .nth(1)
  ).toHaveValue("2,000000");
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Custo \/ \(mg\):R\$$/ })
      .getByRole("spinbutton")
  ).toHaveValue("4,520000");
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Custo KIT:R\$$/ })
      .getByRole("spinbutton")
  ).toHaveValue("0,000000");

  expect(
    page
      .locator("div")
      .filter({ hasText: /^Custo por dia:R\$$/ })
      .getByRole("spinbutton")
  ).toHaveValue("45,200000");

  await page
    .locator("div")
    .filter({ hasText: /^Custo \/ \(mg\):R\$$/ })
    .getByLabel("Increase Value")
    .click();
  await page
    .locator("div")
    .filter({ hasText: /^Custo KIT:R\$$/ })
    .getByLabel("Increase Value")
    .click();

  expect(
    page
      .locator("div")
      .filter({ hasText: /^Custo por dia:R\$$/ })
      .getByRole("spinbutton")
  ).toHaveValue("57,200000");

  await page.getByRole("button", { name: "Confirmar desfecho" }).click();
});

test("outcome: substitution", async ({ page }) => {
  await page.goto("/prescricao/198");

  await page
    .getByRole("heading", { name: "Prescrição nº 198 Liberada em" })
    .click();
  await page.getByText("Paciente 99").click();
  await page
    .getByRole("row", { name: "Expandir linha 0 ENALAPRIL 20" })
    .getByRole("button")
    .nth(1)
    .click();

  await page.locator(".ant-select-selection-overflow").click();
  await page.locator(".rc-virtual-list-holder-inner").hover();
  await page.mouse.wheel(0, 1000);

  await page.getByText("Substituição").click();

  // // close dropdown
  await page.locator(".ant-modal-body").click();

  await expect(page.getByText("Tipo economia: Substituição")).toBeVisible();

  await page.getByRole("textbox").click();
  await page.getByRole("textbox").fill("teste");
  await page.locator(".ant-modal-content .ant-dropdown-trigger").hover();
  await page.getByText("Salvar e marcar como Aceita").click();

  // price origin
  await expect(page.locator(".ant-input-number-input").first()).toHaveValue(
    "209,800000"
  );

  //price destination
  await expect(
    page.locator(
      "div:nth-child(2) > div > div:nth-child(2) > .form-input > .ant-space > div > .ant-input-number-group-wrapper > .ant-input-number-wrapper > .ant-input-number > .ant-input-number-input-wrap > .ant-input-number-input"
    )
  ).toHaveValue("104,900000");

  // final value
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Economia\/Dia:R\$Manual$/ })
      .getByRole("spinbutton")
  ).toHaveValue("104,900000");

  // increase kit value
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "caret-down" })
    .nth(1)
    .click();
  await page
    .locator(
      "div:nth-child(2) > div > .collapsible > div:nth-child(4) > .form-input > .ant-space > div > .ant-input-number-group-wrapper > .ant-input-number-wrapper > .ant-input-number > .ant-input-number-handler-wrap > span"
    )
    .first()
    .click();
  await page
    .locator(
      "div:nth-child(2) > div > .collapsible > div:nth-child(4) > .form-input > .ant-space > div > .ant-input-number-group-wrapper > .ant-input-number-wrapper > .ant-input-number > .ant-input-number-handler-wrap > span"
    )
    .first()
    .click();

  //check price again
  await expect(
    page.locator(
      "div:nth-child(2) > div > div:nth-child(2) > .form-input > .ant-space > div > .ant-input-number-group-wrapper > .ant-input-number-wrapper > .ant-input-number > .ant-input-number-input-wrap > .ant-input-number-input"
    )
  ).toHaveValue("106,900000");

  // check final value
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Economia\/Dia:R\$Manual$/ })
      .getByRole("spinbutton")
  ).toHaveValue("102,900000");

  await page.getByRole("button", { name: "Confirmar desfecho" }).click();
});

test("outcome: custom", async ({ page }) => {
  await page.goto("/prescricao/198");

  await page
    .getByRole("heading", { name: "Prescrição nº 198 Liberada em" })
    .click();
  await page.getByText("Paciente 99").click();

  await page.getByText("Paciente 99").click();
  await page
    .locator("section")
    .getByRole("button", { name: "warning" })
    .click();
  await page.locator(".ant-select-selection-overflow").click();
  await page.getByText("Alta antecipada").click();

  // // close dropdown
  await page.locator(".ant-modal-body").click();

  await page.getByRole("textbox").click();
  await page.getByRole("textbox").fill("teste paciente");
  await page.locator(".ant-modal-content .ant-dropdown-trigger").hover();
  await page.getByText("Salvar e marcar como Aceita").click();

  await page.getByRole("button", { name: "Confirmar desfecho" }).click();
  await expect(page.getByText("Quantidade de Dias de")).toBeVisible();

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
  await page.getByRole("button", { name: "Confirmar desfecho" }).click();
});
