import { test, expect } from "@playwright/test";

test("add intervention", async ({ page }) => {
  await page.goto("/prescricao/199");

  await page
    .getByRole("heading", { name: "Prescrição nº 199 Liberada em" })
    .click();
  await page.getByText("Paciente 99").click();
  //await page.getByRole("row").nth(0).getByRole("button").nth(1).click();
  await page
    .locator(".ant-table tr:nth-child(2)")
    .getByRole("button")
    .nth(1)
    .click();
  await page.locator(".ant-select-selector").click();
  await page.getByText("Alergia").click();

  // // close dropdown
  await page.locator(".ant-select-selector").click();

  await page.getByRole("textbox").click();
  await page.getByRole("textbox").fill("teste");
  await page.getByRole("button", { name: "Salvar" }).click();

  await page
    .locator(".ant-table tr:nth-child(2)")
    .getByRole("button")
    .nth(1)
    .click();
  await page.getByText("Alergia").click();
});

test("add multiple interventions and rollback", async ({ page }) => {
  await page.goto("/prescricao/199");

  await expect(page.getByText("Medicamentos")).toBeVisible();

  // click intervention button
  await page
    .locator(".ant-table tr:nth-child(3)")
    .getByRole("button")
    .nth(1)
    .click();
  await page.locator(".ant-select-selector").click();
  // select intervention reason
  await page.getByText("Alergia").click();

  // close dropdown
  await page.locator(".ant-select-selector").click();

  await page.getByRole("textbox").click();
  await page.getByRole("textbox").fill("teste");
  await page.getByRole("button", { name: "Salvar" }).click();

  // click intervention button
  await page
    .locator(".ant-table tr:nth-child(3)")
    .getByRole("button")
    .nth(1)
    .click();
  // should have 1 intervention
  await expect(page.locator(".ant-modal-body .intervention")).toHaveCount(1);
  // add another intervention
  await page.getByRole("button", { name: "plus Nova intervenção" }).click();
  // select intervention reason
  await page.locator(".ant-select-selector").click();
  await page.getByText("Aprazamento").nth(1).click();
  // close dropdown
  await page.locator(".ant-select-selector").click();

  await page.getByRole("textbox").click();
  await page.getByRole("textbox").fill("teste");

  await page.locator(".ant-modal-content .ant-dropdown-trigger").hover();
  await page.getByText("Salvar e marcar como Aceita").click();
  await page.getByRole("button", { name: "Aceitar Intervenção" }).click();

  //check created interventions
  await page
    .locator(".ant-table tr:nth-child(3)")
    .getByRole("button")
    .nth(1)
    .click();

  //should have 2 interventions
  await expect(page.locator(".ant-modal-body .intervention")).toHaveCount(2);
  await expect(page.getByText("Aprazamento")).toBeVisible();
  await expect(page.getByText("Alergia")).toBeVisible();
  await expect(page.getByText("Pendente", { exact: true })).toBeVisible();
  await expect(page.getByText("Aceita", { exact: true })).toBeVisible();

  await page.locator(".ant-modal-confirm-btns button").first().click();

  await page
    .locator(".ant-table tr:nth-child(3)")
    .getByRole("button")
    .nth(1)
    .click();
  await page.getByText("Pendente", { exact: true }).click();
  await page.getByRole("button", { name: "rollback" }).click();
  await page
    .locator(".ant-table tr:nth-child(3)")
    .getByRole("button")
    .nth(1)
    .click();

  //should have 1 intervention
  await expect(page.locator(".ant-modal-body .intervention")).toHaveCount(1);
});

test("add patient intervention", async ({ page }) => {
  await page.goto("/prescricao/199");

  await page
    .getByRole("heading", { name: "Prescrição nº 199 Liberada em" })
    .click();
  await page.getByText("Paciente 99").click();

  await page.getByText("Paciente 99").click();
  await page.locator(".gtm-bt-patient-intervention").first().click();
  await page.locator(".ant-select-selector").click();
  await page.getByText("Diluição", { exact: true }).click();

  // // close dropdown
  await page.locator(".ant-select-selector").click();

  await page.getByRole("textbox").click();
  await page.getByRole("textbox").fill("teste paciente");
  await page.getByRole("button", { name: "Salvar" }).click();

  // check if it was created
  await page.locator(".gtm-bt-patient-intervention").first().click();
  await expect(page.locator(".ant-modal-body .intervention")).toHaveCount(1);
});
