import { test, expect } from "../support/mockApi";

/**
 * Filled filter fields get a yellow `warning` highlight (styles/Form.style).
 *
 * Regression: antd 6 renders the single-select label as a bare text node inside
 * `.ant-select-content` and overlays `.ant-select-input` on top of it
 * (position: absolute; inset: 0). The highlight rule painted an opaque
 * background on that input, so picking a patient status filtered the list but
 * left the field looking empty. Playwright reports the label as visible either
 * way — occlusion is not part of its visibility check — so assert the overlay
 * stays transparent instead.
 */
test("shows the selected option in a highlighted single select", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /segments/departments", {
    json: { status: "success", data: [] },
  });

  await page.goto("/priorizacao/pacientes/cards");
  await page.getByRole("button", { name: "Ver mais" }).click();

  const patientStatus = page
    .locator(".ant-select")
    .filter({ has: page.locator("#patientStatus") });

  await patientStatus.click();
  await page.getByText("Paciente internado", { exact: true }).last().click();

  // the highlight is on, and the label is rendered
  await expect(patientStatus).toHaveClass(/warning/);
  await expect(patientStatus.locator(".ant-select-content")).toHaveText(
    "Paciente internado",
  );

  // the input overlaying the label must not paint over it
  const inputBackground = await patientStatus
    .locator("input")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(inputBackground).toBe("rgba(0, 0, 0, 0)");
});
