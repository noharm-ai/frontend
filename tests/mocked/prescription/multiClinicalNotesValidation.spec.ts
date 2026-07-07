import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";
import { loginWithFeatures } from "../support/featureLogin";

/**
 * Validation behavior of the multi clinical notes form
 * (src/features/clinicalNotes/ClinicalNotesForm/ClinicalNotesForm.tsx),
 * reachable only with the MULTI_CLINICAL_NOTES feature.
 *
 * Freezes the yup conditional rules so the yup 0.32 -> 1.x upgrade can be
 * verified against them:
 *   - notes: always required
 *   - notesType: required only when the prescription has clinicalNotesTypes
 *     (.when("hasClinicalNotesType"))
 *   - concilia: required only when the prescription has a conciliation
 *     (.when("hasConciliation"))
 */

const prescriptionWith = (patch: Record<string, unknown>) => {
  const fixture = loadFixture<{ data: Record<string, unknown> }>(
    "prescriptions/single-199.json",
  );
  fixture.data = { ...fixture.data, ...patch };
  return fixture;
};

const upsertCalls = (mockApi: MockApi) =>
  mockApi.requests.filter(
    (r) => r.method === "POST" && r.path === "/prescription-clinical-note",
  );

test.use({ storageState: { cookies: [], origins: [] } });

test.beforeEach(({ mockApi }) => {
  mockApi.override("GET /prescription-clinical-note/:idPrescription", {
    json: { status: "success", data: [] },
  });
  mockApi.override("POST /prescription-clinical-note", {
    json: { status: "success", data: {} },
  });
});

test("multi clinical note requires notes and notesType when types exist", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWith({
      clinicalNotesTypes: [{ id: 1, name: "Farmácia Clínica" }],
    }),
  });

  await loginWithFeatures(page, mockApi, ["MULTI_CLINICAL_NOTES"]);

  await page.goto("/prescricao/199");
  await expect(page.getByText("Dipirona 500mg")).toBeVisible();

  // opening the list with no existing notes auto-opens the form
  await page.locator(".gtm-bt-clinical-notes").click();
  await expect(page.getByText("Nova Evolução")).toBeVisible();
  await expect(
    page.getByText("Selecione o tipo de evolução"),
  ).toBeVisible();

  // submit empty: notes + notesType blocked
  await page.locator(".gtm-bt-save-clinical-notes-multi").click();
  await expect(page.locator(".form-error")).toHaveCount(2);
  expect(upsertCalls(mockApi)).toHaveLength(0);

  // fill both fields and save
  await page.getByText("Selecione o tipo de evolução").click();
  await page.getByRole("option", { name: "Farmácia Clínica" }).click();
  await page.locator("textarea").fill("Evolução de teste");

  await page.locator(".gtm-bt-save-clinical-notes-multi").click();
  await expect(
    page.getByText("Uhu! Evolução salva com sucesso! :)"),
  ).toBeVisible();

  const calls = upsertCalls(mockApi);
  expect(calls).toHaveLength(1);
  expect(JSON.parse(calls[0].postData!)).toMatchObject({
    text: "Evolução de teste",
    idClinicalNoteType: 1,
  });
});

test("multi clinical note requires conciliation type when prescription has one", async ({
  page,
  mockApi,
}) => {
  // concilia === "s" renders the conciliation select with an empty value
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWith({ concilia: "s" }),
  });

  await loginWithFeatures(page, mockApi, ["MULTI_CLINICAL_NOTES"]);

  await page.goto("/prescricao/199");
  await expect(page.getByText("Dipirona 500mg")).toBeVisible();

  await page.locator(".gtm-bt-clinical-notes").click();
  await expect(page.getByText("Nova Evolução")).toBeVisible();
  await expect(
    page.getByText("Selecione o tipo de conciliação"),
  ).toBeVisible();

  // submit empty: concilia + notes blocked
  await page.locator(".gtm-bt-save-clinical-notes-multi").click();
  await expect(page.locator(".form-error")).toHaveCount(2);
  expect(upsertCalls(mockApi)).toHaveLength(0);

  // fill both fields and save
  await page.getByText("Selecione o tipo de conciliação").click();
  await page.getByRole("option", { name: "Alta" }).click();
  await page.locator("textarea").fill("Conciliação de teste");

  await page.locator(".gtm-bt-save-clinical-notes-multi").click();
  await expect(
    page.getByText("Uhu! Evolução salva com sucesso! :)"),
  ).toBeVisible();

  const calls = upsertCalls(mockApi);
  expect(calls).toHaveLength(1);
  expect(JSON.parse(calls[0].postData!)).toMatchObject({
    text: "Conciliação de teste",
    concilia: "a",
  });
});
