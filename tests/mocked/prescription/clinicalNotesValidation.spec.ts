import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";
import { loginWithFeatures } from "../support/featureLogin";

/**
 * Validation behavior of the legacy clinical notes form
 * (src/components/Forms/ClinicalNotes/index.jsx).
 *
 * Freezes the yup conditional rules so the yup 0.32 -> 1.x upgrade can be
 * verified against them:
 *   - notes: always required
 *   - notesType: required only when the prescription has clinicalNotesTypes
 *     (.when("hasClinicalNotesType"))
 *   - concilia: required only when the prescription has a conciliation
 *     (.when("hasConciliation"))
 *   - date: required only on the schedule flow (.when("action")), which is
 *     only reachable with the PRIMARYCARE feature
 */

const prescriptionWith = (patch: Record<string, unknown>) => {
  const fixture = loadFixture<{ data: Record<string, unknown> }>(
    "prescriptions/single-199.json",
  );
  fixture.data = { ...fixture.data, ...patch };
  return fixture;
};

const putPrescriptionCalls = (mockApi: MockApi) =>
  mockApi.requests.filter(
    (r) => r.method === "PUT" && r.path === "/prescriptions/199",
  );

test("clinical note requires notes and notesType when types exist", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWith({
      clinicalNotesTypes: [{ id: 1, name: "Farmácia Clínica" }],
    }),
  });
  mockApi.override("PUT /prescriptions/:id", {
    json: { status: "success", data: {} },
  });

  await page.goto("/prescricao/199");
  await expect(page.getByText("Dipirona 500mg")).toBeVisible();

  await page.locator(".gtm-bt-clinical-notes").click();
  await expect(
    page.getByText("Selecione o tipo de evolução"),
  ).toBeVisible();

  // submit empty: notes + notesType blocked
  await page.locator(".gtm-bt-save-clinical-notes").click();
  await expect(page.locator(".ant-modal .form-error")).toHaveCount(2);
  expect(putPrescriptionCalls(mockApi)).toHaveLength(0);

  // fill both fields and save
  await page.getByText("Selecione o tipo de evolução").click();
  await page.getByRole("option", { name: "Farmácia Clínica" }).click();
  await page.locator(".ant-modal textarea").fill("Evolução de teste");

  await page.locator(".gtm-bt-save-clinical-notes").click();
  await expect(
    page.getByText("Uhu! Evolução salva com sucesso! :)"),
  ).toBeVisible();

  const calls = putPrescriptionCalls(mockApi);
  expect(calls).toHaveLength(1);
  expect(JSON.parse(calls[0].postData!)).toMatchObject({
    notes: "Evolução de teste",
    notesType: 1,
  });
});

test("clinical note requires conciliation type when prescription has one", async ({
  page,
  mockApi,
}) => {
  // concilia === "s" renders the conciliation select with an empty value
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWith({ concilia: "s" }),
  });
  mockApi.override("PUT /prescriptions/:id", {
    json: { status: "success", data: {} },
  });

  await page.goto("/prescricao/199");
  await expect(page.getByText("Dipirona 500mg")).toBeVisible();

  await page.locator(".gtm-bt-clinical-notes").click();
  await expect(
    page.getByText("Selecione o tipo de conciliação"),
  ).toBeVisible();

  // submit empty: concilia + notes blocked
  await page.locator(".gtm-bt-save-clinical-notes").click();
  await expect(page.locator(".ant-modal .form-error")).toHaveCount(2);
  expect(putPrescriptionCalls(mockApi)).toHaveLength(0);

  // fill both fields and save
  await page.getByText("Selecione o tipo de conciliação").click();
  await page.getByRole("option", { name: "Admissão" }).click();
  await page.locator(".ant-modal textarea").fill("Conciliação de teste");

  await page.locator(".gtm-bt-save-clinical-notes").click();
  await expect(
    page.getByText("Uhu! Evolução salva com sucesso! :)"),
  ).toBeVisible();

  const calls = putPrescriptionCalls(mockApi);
  expect(calls).toHaveLength(1);
  expect(JSON.parse(calls[0].postData!)).toMatchObject({
    notes: "Conciliação de teste",
    concilia: "b",
  });
});

test.describe("schedule flow (PRIMARYCARE)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("schedule requires a date", async ({ page, mockApi }) => {
    mockApi.override("POST /notes", { json: { status: "success", data: {} } });

    await loginWithFeatures(page, mockApi, ["PRIMARYCARE"]);

    await page.goto("/prescricao/199");
    await expect(page.getByText("Dipirona 500mg")).toBeVisible();

    await page.locator(".gtm-bt-clinical-notes-schedule").click();
    await expect(page.getByText("Agendar consulta")).toBeVisible();

    const postNotesCalls = () =>
      mockApi.requests.filter(
        (r) => r.method === "POST" && r.path === "/notes",
      );

    // submit empty: date + notes blocked
    await page.locator(".gtm-bt-save-clinical-notes").click();
    await expect(page.locator(".ant-modal .form-error")).toHaveCount(2);
    expect(postNotesCalls()).toHaveLength(0);

    // notes alone are not enough: date is still required
    await page.locator(".ant-modal textarea").fill("Agendamento de teste");
    await page.locator(".gtm-bt-save-clinical-notes").click();
    await expect(page.locator(".ant-modal .form-error")).toHaveCount(1);
    expect(postNotesCalls()).toHaveLength(0);

    // pick a valid (future) date and save
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    const dateText = `${pad(tomorrow.getDate())}/${pad(
      tomorrow.getMonth() + 1,
    )}/${tomorrow.getFullYear()} 10:00`;

    await page.locator(".ant-modal .ant-picker input").fill(dateText);
    await page.keyboard.press("Enter");

    await page.locator(".gtm-bt-save-clinical-notes").click();
    await expect(
      page.getByText("Uhu! Agendamento salvo com sucesso! :)"),
    ).toBeVisible();

    expect(postNotesCalls()).toHaveLength(1);
    const body = JSON.parse(postNotesCalls()[0].postData!);
    expect(body).toMatchObject({ notes: "Agendamento de teste" });
    expect(body.date).toContain(
      `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(
        tomorrow.getDate(),
      )}`,
    );
  });
});
