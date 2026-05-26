import { test, expect } from "@playwright/test";

test.describe("clinical notes", () => {
  test.describe.configure({ mode: "serial" });

  test("add evolution", async ({ page }) => {
    await page.goto("/prescricao/199");

    await page
      .getByText("Paciente 99")
      .waitFor({ state: "visible", timeout: 30000 });

    await page.locator(".gtm-bt-clinical-notes").click();

    await page.getByRole("textbox").click();
    await page.getByRole("textbox").fill("teste evolução");
    await page.getByRole("button", { name: "Salvar" }).click();

    await page
      .getByText("Uhu! Evolução salva com sucesso! :)")
      .waitFor({ state: "visible", timeout: 10000 });
  });

  test("add evolution and verify list", async ({ page }) => {
    await page.goto("/prescricao/199");

    await page
      .getByText("Paciente 99")
      .waitFor({ state: "visible", timeout: 30000 });

    // list has 1 item from previous test → list modal opens with "Nova Evolução" footer button
    await page.locator(".gtm-bt-clinical-notes").click();

    await page
      .getByRole("button", { name: "plus Nova Evolução" })
      .waitFor({ state: "visible", timeout: 10000 });

    await page.getByRole("button", { name: "plus Nova Evolução" }).click();

    await page
      .locator("h2.modal-title")
      .filter({ hasText: "Nova Evolução" })
      .waitFor({ state: "visible", timeout: 10000 });

    await page.getByRole("textbox").click();
    await page.getByRole("textbox").fill("teste evolução 2");
    await page.getByRole("button", { name: "Salvar" }).click();

    await page
      .getByText("Uhu! Evolução salva com sucesso! :)")
      .waitFor({ state: "visible", timeout: 10000 });

    // re-open list and verify 2 items
    await page.locator(".gtm-bt-clinical-notes").click();

    await page
      .getByRole("button", { name: "plus Nova Evolução" })
      .waitFor({ state: "visible", timeout: 10000 });

    await expect(page.locator(".ant-list-item")).toHaveCount(2);
  });
});
