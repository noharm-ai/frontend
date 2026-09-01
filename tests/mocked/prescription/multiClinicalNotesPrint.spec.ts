import { test, expect } from "../support/mockApi";
import { loginWithAuth, loginWithFeatures } from "../support/featureLogin";

/**
 * Print action of the multi clinical notes list modal
 * (src/features/clinicalNotes/ClinicalNotesList/ClinicalNotesList.tsx),
 * reachable only with the MULTI_CLINICAL_NOTES feature.
 *
 * Users with the READ_NAV permission can print the clinical notes
 * registered in NoHarm; the printed page carries the institution header
 * stored in the "nav-header" memory. Without READ_NAV the print action
 * is not offered.
 */

// default permission set from fixtures/auth/authenticate.json
const BASE_PERMISSIONS = [
  "READ_BASIC_FEATURES",
  "WRITE_BASIC_FEATURES",
  "READ_PRESCRIPTION",
  "WRITE_PRESCRIPTION",
  "READ_SUPPORT",
  "WRITE_SUPPORT",
  "READ_USERS",
];

const NOTES_LIST = {
  status: "success",
  data: [
    {
      id: 1,
      idPrescription: 199,
      admissionNumber: 5,
      notes: "Evolução registrada pela equipe de navegação",
      notesType: null,
      concilia: null,
      createdAt: "2026-08-30T10:00:00",
      updatedAt: "2026-08-30T10:00:00",
      userName: "E2E Test",
      createdByName: "Maria Teste",
      tpStatus: 0,
    },
  ],
};

test.use({ storageState: { cookies: [], origins: [] } });

test.beforeEach(({ mockApi }) => {
  mockApi.override("GET /prescription-clinical-note/:idPrescription", {
    json: NOTES_LIST,
  });
});

test("READ_NAV users can print a clinical note with the institution header", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /memory/:type", {
    json: {
      status: "success",
      data: [{ key: 1, value: { header: "<p>Hospital Fictício de Teste</p>" } }],
    },
  });

  await loginWithAuth(page, mockApi, {
    features: ["MULTI_CLINICAL_NOTES"],
    permissions: [...BASE_PERMISSIONS, "READ_NAV"],
  });

  await page.goto("/prescricao/199");
  await expect(page.getByText("Dipirona 500mg")).toBeVisible();

  await page.locator(".gtm-bt-clinical-notes").click();
  await expect(page.getByText("Maria Teste")).toBeVisible();

  // keep the print window open so its content can be asserted
  await page.context().addInitScript(() => {
    window.print = () => {};
    window.close = () => {};
  });

  const [popup] = await Promise.all([
    page.waitForEvent("popup"),
    page.getByRole("button", { name: "Imprimir" }).click(),
  ]);

  await expect(
    popup.getByText("Evolução registrada pela equipe de navegação"),
  ).toBeVisible();
  await expect(popup.getByText("Hospital Fictício de Teste")).toBeVisible();
  await expect(popup.getByText("30/08/2026 10:00 — Maria Teste")).toBeVisible();

  expect(
    mockApi.requests.filter(
      (r) => r.method === "GET" && r.path === "/memory/nav-header",
    ),
  ).toHaveLength(1);
});

test("without READ_NAV the print action is not offered", async ({
  page,
  mockApi,
}) => {
  await loginWithFeatures(page, mockApi, ["MULTI_CLINICAL_NOTES"]);

  await page.goto("/prescricao/199");
  await expect(page.getByText("Dipirona 500mg")).toBeVisible();

  await page.locator(".gtm-bt-clinical-notes").click();
  await expect(page.getByText("Maria Teste")).toBeVisible();

  await expect(page.getByRole("button", { name: "Editar" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Imprimir" }),
  ).toHaveCount(0);
});
