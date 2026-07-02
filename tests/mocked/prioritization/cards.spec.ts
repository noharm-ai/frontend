import { test, expect } from "../support/mockApi";

test("lists patient cards and opens the prescription popup", async ({
  page,
}) => {
  await page.goto("/priorizacao/pacientes/cards");

  await page.getByRole("main").getByRole("button", { name: "search" }).click();

  await expect(page.getByText("Paciente 99")).toBeVisible();
  await expect(page.getByText("UTI ADULTO")).toBeVisible();

  const popupPromise = page.waitForEvent("popup");
  // click the card body (the patient name itself opens a details modal)
  await page.getByText("UTI ADULTO").click();
  const popup = await popupPromise;

  // longer timeout: the dev server compiles the screening bundle on demand
  await expect(
    popup.getByRole("heading", { name: "Prescrição nº 199" }),
  ).toBeVisible({ timeout: 15000 });
  await expect(popup.getByText("Paciente 99")).toBeVisible({ timeout: 15000 });
});
