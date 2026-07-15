import { test, expect } from "../support/mockApi";

/**
 * Scenario that is impossible to set up with the seeded e2e database:
 * a segment with no pending prescriptions at all.
 */
test("shows empty state when there are no prescriptions", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions", {
    json: { status: "success", data: [] },
  });

  await page.goto("/priorizacao/pacientes/cards");
  await page.getByRole("main").getByRole("button", { name: "search" }).click();

  await expect(
    page.getByRole("main").getByText("Nenhum registro encontrado"),
  ).toBeVisible();
});
