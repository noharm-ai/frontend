import { test, expect } from "../support/mockApi";

/**
 * Backend failure scenario: the prioritization list endpoint returns 500.
 * With the real dockerized backend this state cannot be triggered on demand.
 */
test("shows an error when the prescriptions endpoint fails", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions", {
    status: 500,
    json: { status: "error", message: "Internal server error" },
  });

  await page.goto("/priorizacao/pacientes/cards");
  await page.getByRole("main").getByRole("button", { name: "search" }).click();

  await expect(page.getByText(/erro/i).first()).toBeVisible();
});
