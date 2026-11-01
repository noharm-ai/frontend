import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";
import { loadFixture } from "../support/defaultHandlers";
import { openSelect, pickOption } from "../support/antd";

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

// the maintainer button of the allergy card
const configureButton = (page: Page) =>
  page.locator(".allergy").getByRole("button", { name: "Configurar" });

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
  await expect(configureButton(page)).toHaveCount(0);
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
  await configureButton(page).click();

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
  await expect(
    withDrug.getByLabel("Medicamento cadastrado", { exact: true }),
  ).toHaveText("501");
  await expect(withDrug.getByText("Amoxicilina (2001)")).toBeVisible();
  // the record's own name is not what identifies it here
  await expect(withDrug.getByText("AMOXICILINA", { exact: true })).toHaveCount(
    0,
  );

  const withoutDrug = row("DIPIRONA GOTAS");
  await expect(
    withoutDrug.getByLabel("Sem medicamento cadastrado", { exact: true }),
  ).toHaveText("777");
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
  await configureButton(page).click();

  await expect(
    page.getByText("Nenhum registro de alergia para este paciente"),
  ).toBeVisible();
});

test("the substance of a record without drug is set for its name", async ({
  page,
  mockApi,
}) => {
  // the records read after the edit carry the new substance
  let updated = false;
  mockApi.override("GET /prescriptions/:id/allergy-records", (route) => {
    const data = updated
      ? RECORDS.map((r) =>
          r.idDrug === "777"
            ? { ...r, sctid: "2003", substance: "Ibuprofeno" }
            : r,
        )
      : RECORDS;

    return route.fulfill({ json: { status: "success", data } });
  });
  mockApi.override("GET /substance", {
    json: {
      status: "success",
      data: [
        { sctid: "2002", name: "Dipirona", active: true },
        { sctid: "2003", name: "Ibuprofeno", active: true },
      ],
    },
  });
  mockApi.override("PUT /allergy-records/substance", (route) => {
    updated = true;
    return route.fulfill({ json: { status: "success", data: { updated: 2 } } });
  });

  await loginWithPermissions(page, mockApi, [
    ...BASE_PERMISSIONS,
    "MAINTAINER",
  ]);
  await openAllergyCard(page);
  await configureButton(page).click();

  const modal = page.locator(".ant-modal", {
    hasText: "Registros de alergia do paciente",
  });
  const row = (text: string) =>
    modal.getByRole("row").filter({ hasText: text });
  const edit = { name: "Alterar substância" };

  // the substance of a catalogued drug comes from the drug
  await expect(row("Amoxicilina 500mg").getByRole("button", edit)).toHaveCount(
    0,
  );

  await row("DIPIRONA GOTAS").getByRole("button", edit).click();
  await openSelect(row("DIPIRONA GOTAS"));
  await pickOption(page, "Ibuprofeno");
  await row("DIPIRONA GOTAS").getByRole("button", { name: "Salvar" }).click();

  const confirm = page.locator(".ant-popconfirm");
  await expect(confirm).toContainText(
    'Altera todos os registros de alergia, de todos os pacientes, com o nome "DIPIRONA GOTAS"',
  );
  await confirm.getByRole("button", { name: "Salvar" }).click();

  await expect(
    page.getByText("Substância alterada em 2 registros"),
  ).toBeVisible();
  await expect(
    row("DIPIRONA GOTAS").getByText("Ibuprofeno (2003)"),
  ).toBeVisible();

  const puts = mockApi.requests
    .filter(
      (r) => r.method === "PUT" && r.path === "/allergy-records/substance",
    )
    .map((r) => JSON.parse(r.postData!));
  expect(puts).toEqual([
    { idDrug: "777", drugName: "DIPIRONA GOTAS", sctid: "2003" },
  ]);
});

test("the substance of a record without drug can be removed", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/:id/allergy-records", {
    json: { status: "success", data: RECORDS },
  });
  mockApi.override("GET /substance", {
    json: {
      status: "success",
      data: [{ sctid: "2002", name: "Dipirona", active: true }],
    },
  });
  mockApi.override("PUT /allergy-records/substance", {
    json: { status: "success", data: { updated: 1 } },
  });

  await loginWithPermissions(page, mockApi, [
    ...BASE_PERMISSIONS,
    "MAINTAINER",
  ]);
  await openAllergyCard(page);
  await configureButton(page).click();

  const row = page
    .locator(".ant-modal")
    .getByRole("row")
    .filter({ hasText: "DIPIRONA GOTAS" });
  await row.getByRole("button", { name: "Alterar substância" }).click();

  // nothing changed yet
  await expect(row.getByRole("button", { name: "Salvar" })).toBeDisabled();

  await row.locator(".ant-select").hover();
  await row.locator(".ant-select-clear").click();
  await row.getByRole("button", { name: "Salvar" }).click();

  const confirm = page.locator(".ant-popconfirm");
  await expect(confirm).toContainText("Remover a substância deste nome?");
  await confirm.getByRole("button", { name: "Salvar" }).click();

  await expect(
    page.getByText("Substância alterada em 1 registro", { exact: true }),
  ).toBeVisible();

  const puts = mockApi.requests
    .filter(
      (r) => r.method === "PUT" && r.path === "/allergy-records/substance",
    )
    .map((r) => JSON.parse(r.postData!));
  expect(puts).toEqual([
    { idDrug: "777", drugName: "DIPIRONA GOTAS", sctid: null },
  ]);
});

test("the card shows the recorded names or the missing substance", async ({
  page,
  mockApi,
}) => {
  const fixture = loadFixture<{ data: Record<string, unknown> }>(
    "prescriptions/single-199.json",
  );
  fixture.data.notesAllergies = [
    {
      text: "Dipirona",
      date: "2026-01-02T10:00:00",
      source: "pep",
      drugNames: ["DIPIRONA GOTAS", "NOVALGINA"],
      hasSubstance: true,
    },
    {
      text: "Sulfa",
      date: "2026-01-01T10:00:00",
      source: "pep",
      drugNames: [],
      hasSubstance: false,
    },
    // NoHarm Care notes carry no flag
    { text: "Penicilina", date: "2026-01-03T10:00:00", source: "care", id: 1 },
  ];
  mockApi.override("GET /prescriptions/:id", { json: fixture });

  await loginWithPermissions(page, mockApi, BASE_PERMISSIONS);
  await openAllergyCard(page);

  const card = page.locator(".allergy.full-height");
  await expect(card.getByText("Dipirona", { exact: true })).toBeVisible();
  await expect(
    card.getByText("Registrado como: DIPIRONA GOTAS, NOVALGINA"),
  ).toBeVisible();
  await expect(card.getByText("Sulfa", { exact: true })).toBeVisible();
  await expect(card.getByText(/Registrado como/)).toHaveCount(1);
  await expect(
    card
      .locator(".list-item")
      .filter({ hasText: "Sulfa" })
      .getByText("Sem substância associada"),
  ).toBeVisible();
  await expect(card.getByText("Sem substância associada")).toHaveCount(1);
});
