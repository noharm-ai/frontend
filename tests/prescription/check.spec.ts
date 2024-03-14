import { test, expect } from "@playwright/test";

test("check individual prescription and rollback", async ({ page }) => {
  await page.goto("/prescricao/199");

  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" })
  ).toBeVisible();
  await expect(page.getByText("Paciente 99")).toBeVisible();

  // check
  await page.getByRole("button", { name: "check Checar" }).click();
  await expect(page.getByText("Checada porE2E Test")).toBeVisible();

  // rollback
  await page.getByRole("button", { name: "rollback" }).click();

  await expect(
    page.getByRole("button", { name: "check Checar" })
  ).toBeVisible();
});

test("check aggregate prescription and rollback", async ({ page }) => {
  // first find aggregate prescription using fast search
  // we need to do that because ID keeps changing
  await page.goto("/priorizacao/pacientes/cards");

  await page.getByPlaceholder("Buscar por nº de atendimento").click();
  await page.getByPlaceholder("Buscar por nº de atendimento").fill("9999");
  await page
    .getByRole("banner")
    .getByRole("button", { name: "search" })
    .click();
  await expect(page.getByText("Atendimento 9999").first()).toBeVisible();
  const page1Promise = page.waitForEvent("popup");
  await page.getByText("Atendimento 9999").first().click();

  const prescriptionPage = await page1Promise;
  await expect(
    prescriptionPage.getByRole("button", { name: "9999" })
  ).toBeVisible();

  // check
  await prescriptionPage.getByRole("button", { name: "check Checar" }).click();
  await expect(prescriptionPage.getByText("Checada porE2E Test")).toBeVisible();

  await expect(
    prescriptionPage.locator(".ant-collapse-item.checked")
  ).toHaveCount(3);

  // rollback
  await prescriptionPage.getByRole("button", { name: "rollback" }).click();

  await expect(
    prescriptionPage.getByRole("button", { name: "check Checar" })
  ).toBeVisible();
});
