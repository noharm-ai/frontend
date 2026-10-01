import { test, expect } from "../support/mockApi";

/**
 * /prescricao/atendimento/:admissionNumber (the link_atendimento column of
 * custom reports) opens the most recent prescription of the admission, using
 * the header search: aggregated prescriptions newest first, plus the
 * conciliation, which is skipped.
 */

const result = (idPrescription: string, date: string, concilia: string | null = null) => ({
  type: "prescription",
  idPrescription,
  admissionNumber: 9999,
  date,
  status: "0",
  agg: !concilia,
  concilia,
});

test("opens the most recent prescription of the admission", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/search", {
    json: {
      status: "success",
      data: [
        result("92600000000009999", "2024-03-02T00:00:00", "s"),
        result("198", "2024-02-29T00:00:00"),
        result("199", "2024-03-01T00:00:00"),
      ],
    },
  });

  await page.goto("/prescricao/atendimento/9999");

  await expect(page).toHaveURL(/\/prescricao\/199$/);
  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible({ timeout: 15000 });

  const searched = mockApi.requests.find((r) => r.path === "/prescriptions/search");
  expect(searched).toBeTruthy();
});

test("says so when the admission has no prescription", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/search", {
    json: { status: "success", data: [] },
  });

  await page.goto("/prescricao/atendimento/9999");

  await expect(
    page.getByText("Nenhuma prescrição encontrada para o atendimento 9999."),
  ).toBeVisible({ timeout: 15000 });
  await expect(page).toHaveURL(/\/prescricao\/atendimento\/9999$/);
});
