import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loginWithFeatures } from "../support/featureLogin";

/**
 * The prioritization list refreshes the status of the prescriptions it is
 * showing whenever the window regains focus, so a check or a review made in
 * another tab shows up without a new search.
 *
 * Regression: the refresh used to dispatch the raw response payload. A response
 * without a `data` key crashed the reducer ("can't access property findIndex"),
 * and an empty `data` wiped the list, because the reducer keeps only the
 * prescriptions present in the payload.
 */
const STATUS_LIST = "POST /prescriptions/status-list";
const STATUS_LIST_PATH = "/prescriptions/status-list";

async function openCardList(page: Page) {
  await page.goto("/priorizacao/pacientes/cards");
  await page.getByRole("main").getByRole("button", { name: "search" }).click();
  await expect(page.getByText("Paciente 99")).toBeVisible();
}

async function refreshOnFocus(page: Page, mockApi: MockApi) {
  const polls = () =>
    mockApi.requests.filter((r) => r.path === STATUS_LIST_PATH).length;
  const before = polls();

  await page.evaluate(() => window.dispatchEvent(new Event("focus")));

  // the refresh is fire-and-forget, so wait for the poll to be answered
  await expect.poll(polls).toBeGreaterThan(before);
}

test("keeps the list when the status refresh returns no data", async ({
  page,
  mockApi,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await openCardList(page);

  mockApi.override(STATUS_LIST, { json: { status: "success" } });
  await refreshOnFocus(page, mockApi);

  await expect(page.getByText("Paciente 99")).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("keeps the list when the status refresh returns an empty list", async ({
  page,
  mockApi,
}) => {
  await openCardList(page);

  mockApi.override(STATUS_LIST, { json: { status: "success", data: [] } });
  await refreshOnFocus(page, mockApi);

  await expect(page.getByText("Paciente 99")).toBeVisible();
});

// the review tag on the card is behind the per-user PATIENT_REVISION feature,
// which the shared storage state does not carry
test.describe("with patient revision", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("carries a review made elsewhere into the list", async ({
    page,
    mockApi,
  }) => {
    await loginWithFeatures(page, mockApi, ["PATIENT_REVISION"]);
    await openCardList(page);

    const review = page
      .locator(".attributes-item", { hasText: "Revisão" })
      .locator(".attributes-item-value");
    await expect(review).toHaveText("Pendente");

    // the polled ids are echoed back so the row matches the list item: the
    // fixture list carries a numeric idPrescription where the API sends a string
    mockApi.override(STATUS_LIST, (route) => {
      const { idPrescriptionList } = JSON.parse(
        route.request().postData() ?? "{}",
      );

      return route.fulfill({
        json: {
          status: "success",
          data: idPrescriptionList.map((idPrescription: string | number) => ({
            idPrescription,
            status: "0",
            reviewType: 1,
          })),
        },
      });
    });
    await refreshOnFocus(page, mockApi);

    await expect(review).toHaveText("Revisado");
  });
});
