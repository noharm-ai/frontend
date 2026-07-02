import { test, expect } from "../support/mockApi";

test("check prescription and rollback", async ({ page, mockApi }) => {
  await page.goto("/prescricao/199");

  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();
  await expect(page.getByText("Paciente 99")).toBeVisible();
  await expect(page.getByText("Dipirona 500mg")).toBeVisible();

  // check
  await page.getByRole("button", { name: "check Checar" }).click();
  await expect(page.getByText("Checada porE2E Test")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "check Checar" }),
  ).toBeHidden();

  // rollback
  await page.getByRole("button", { name: "rollback" }).click();
  await expect(page.getByRole("button", { name: "check Checar" })).toBeVisible();

  // the UI sent one request per status transition
  const statusCalls = mockApi.requests.filter(
    (r) => r.path === "/prescriptions/status",
  );
  expect(statusCalls).toHaveLength(2);
  expect(JSON.parse(statusCalls[0].postData!)).toMatchObject({
    idPrescription: "199",
    status: "s",
  });
  expect(JSON.parse(statusCalls[1].postData!)).toMatchObject({
    idPrescription: "199",
    status: "0",
  });
});
