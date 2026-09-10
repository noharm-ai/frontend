import { test, expect } from "../support/mockApi";

/**
 * Regression: the status refresh fired on window focus used to dispatch the
 * raw response payload. A response without a `data` key crashed the reducer
 * ("can't access property findIndex"), and an empty `data` wiped the list,
 * because the reducer keeps only the prescriptions present in the payload.
 */
async function openCardList(page: import("@playwright/test").Page) {
  await page.goto("/priorizacao/pacientes/cards");
  await page.getByRole("main").getByRole("button", { name: "search" }).click();
  await expect(page.getByText("Paciente 99")).toBeVisible();
}

test("keeps the list when the status refresh returns no data", async ({
  page,
  mockApi,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await openCardList(page);

  mockApi.override("POST /prescriptions/status-list", {
    json: { status: "success" },
  });

  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect
    .poll(
      () =>
        mockApi.requests.filter((r) => r.path === "/prescriptions/status-list")
          .length,
    )
    .toBeGreaterThan(0);

  await expect(page.getByText("Paciente 99")).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("keeps the list when the status refresh returns an empty list", async ({
  page,
  mockApi,
}) => {
  await openCardList(page);

  mockApi.override("POST /prescriptions/status-list", {
    json: { status: "success", data: [] },
  });

  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect
    .poll(
      () =>
        mockApi.requests.filter((r) => r.path === "/prescriptions/status-list")
          .length,
    )
    .toBeGreaterThan(0);

  await expect(page.getByText("Paciente 99")).toBeVisible();
});
