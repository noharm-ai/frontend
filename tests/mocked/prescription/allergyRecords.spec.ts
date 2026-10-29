import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";
import { loadFixture } from "../support/defaultHandlers";

/**
 * Allergy records (features/prescription/AllergyRecords). In the allergy card
 * ("Ver mais"), maintainers open every alergia row of the patient (backend
 * allergy_service.list_allergy_records). fkmedicamento does not always
 * reference a medicamento record: with one, the record shows the drug and its
 * substance; without, the name and substance stored in the record itself.
 */

// each test logs in with its own permissions
test.use({ storageState: { cookies: [], origins: [] } });

const BASE_PERMISSIONS = [
  "READ_BASIC_FEATURES",
  "WRITE_BASIC_FEATURES",
  "READ_PRESCRIPTION",
  "WRITE_PRESCRIPTION",
];

const RECORDS = [
  {
    idDrug: "501",
    drug: {
      name: "Amoxicilina 500mg",
      sctid: "2001",
      substance: "Amoxicilina",
    },
    drugName: "AMOXICILINA",
    sctid: null,
    substance: null,
    active: true,
    createdAt: "2026-01-01T10:00:00",
  },
  {
    idDrug: "777",
    drug: null,
    drugName: "DIPIRONA GOTAS",
    sctid: "2002",
    substance: "Dipirona",
    active: true,
    createdAt: "2026-01-02T10:00:00",
  },
  {
    idDrug: null,
    drug: null,
    drugName: "CONTRASTE IODADO",
    sctid: "2999",
    substance: null,
    active: false,
    createdAt: null,
  },
];

const openAllergyCard = async (page: Page) => {
  await page.goto("/prescricao/199");
  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Ver mais" }).click();
};

test("the records are only offered to maintainers", async ({
  page,
  mockApi,
}) => {
  const fixture = loadFixture<{ data: Record<string, unknown> }>(
    "prescriptions/single-199.json",
  );
  fixture.data.notesAllergies = [
    { text: "Dipirona", date: "2026-01-02T10:00:00", source: "pep" },
  ];
  mockApi.override("GET /prescriptions/:id", { json: fixture });

  await loginWithPermissions(page, mockApi, BASE_PERMISSIONS);
  await openAllergyCard(page);

  await expect(page.getByText("Dipirona", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Ver registros de alergia" }),
  ).toHaveCount(0);
});

test("each record shows the drug or, without one, its own name", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/:id/allergy-records", {
    json: { status: "success", data: RECORDS },
  });

  await loginWithPermissions(page, mockApi, [
    ...BASE_PERMISSIONS,
    "MAINTAINER",
  ]);
  // the patient has no allergy to list: maintainers still get the card
  await openAllergyCard(page);
  await page.getByRole("button", { name: "Ver registros de alergia" }).click();

  const modal = page.locator(".ant-modal", {
    hasText: "Registros de alergia do paciente",
  });
  await expect(
    modal.getByText(
      "3 registros: 1 com medicamento cadastrado, 2 sem medicamento cadastrado",
    ),
  ).toBeVisible();

  const row = (text: string) =>
    modal.getByRole("row").filter({ hasText: text });

  const withDrug = row("Amoxicilina 500mg");
  await expect(withDrug.getByText("Medicamento cadastrado")).toBeVisible();
  await expect(withDrug.getByText("Amoxicilina (2001)")).toBeVisible();
  await expect(withDrug.getByRole("cell", { name: "501" })).toBeVisible();
  // the record's own name is not what identifies it here
  await expect(withDrug.getByText("AMOXICILINA", { exact: true })).toHaveCount(
    0,
  );

  const withoutDrug = row("DIPIRONA GOTAS");
  await expect(
    withoutDrug.getByText("Sem medicamento cadastrado"),
  ).toBeVisible();
  await expect(withoutDrug.getByRole("cell", { name: "777" })).toBeVisible();
  await expect(withoutDrug.getByText("Dipirona (2002)")).toBeVisible();

  const inactive = row("CONTRASTE IODADO");
  await expect(inactive).toHaveClass(/inactive/);
  await expect(inactive.getByText("Inativa")).toBeVisible();
  await expect(
    inactive.getByText("sctid 2999 sem substância cadastrada"),
  ).toBeVisible();
});

test("a patient without records says so", async ({ page, mockApi }) => {
  mockApi.override("GET /prescriptions/:id/allergy-records", {
    json: { status: "success", data: [] },
  });

  await loginWithPermissions(page, mockApi, [
    ...BASE_PERMISSIONS,
    "MAINTAINER",
  ]);
  await openAllergyCard(page);
  await page.getByRole("button", { name: "Ver registros de alergia" }).click();

  await expect(
    page.getByText("Nenhum registro de alergia para este paciente"),
  ).toBeVisible();
});
