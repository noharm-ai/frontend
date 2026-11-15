import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loginWithAuth } from "../support/featureLogin";
import { openSelectById } from "../support/antd";

/**
 * Test case prescriptions (features/prescription/PrescriptionTestCase). From
 * the menu (Curadoria), maintainers open a page to create a prescription as if
 * the hospital had sent it; the backend (prescription_test_case_service) runs
 * prescalc on it and answers with the prescription-day to open. Menu and page
 * need the schema feature PRESCRIPTION_TEST_CASE (the schema's own, never a
 * user feature) and a maintainer; the backend checks the same feature (and is
 * not served in production).
 */

// each test logs in with its own features and permissions
test.use({ storageState: { cookies: [], origins: [] } });

const FEATURE = "PRESCRIPTION_TEST_CASE";

const PERMISSIONS = [
  "READ_BASIC_FEATURES",
  "WRITE_BASIC_FEATURES",
  "READ_PRESCRIPTION",
  "WRITE_PRESCRIPTION",
];

const PAGE = "/prescricao-teste";
const MENU_ITEM = "#gtm-lnk-prescription-test-case";
// always under Curadoria: proves the submenu opened
const ADMIN_MENU_ITEM = "#gtm-lnk-admin";

const respond = (data: unknown) => ({ json: { status: "success", data } });

/** Hovers Curadoria once, until its submenu shows (its items render then) */
async function hoverCuration(page: Page) {
  await page
    .locator(".ant-menu-submenu-title")
    .filter({ hasText: "Curadoria" })
    .hover({ timeout: 2000 });
  await expect(page.locator(ADMIN_MENU_ITEM)).toBeVisible({ timeout: 2000 });
}

/*
 * Right after login the landing page (the patient cards) is still loading, and
 * the Curadoria submenu can close again under the pointer: a click on one of
 * its items then lands on a card, or waits for an item that no longer shows.
 * Hover again until the step it is needed for gets through.
 */
const RETRY = { timeout: 15000 };

/** Opens the Curadoria submenu */
async function openCuration(page: Page) {
  await expect(() => hoverCuration(page)).toPass(RETRY);
}

/** The page, through the menu */
async function openPage(page: Page) {
  await expect(async () => {
    await hoverCuration(page);
    await page.locator(MENU_ITEM).click({ timeout: 2000 });
    await expect(page).toHaveURL(new RegExp(`${PAGE}$`), { timeout: 2000 });
  }).toPass(RETRY);
  await expect(page.getByText("Novo atendimento")).toBeVisible();
}

async function login(
  page: Page,
  mockApi: MockApi,
  {
    maintainer,
    feature,
  }: { maintainer: boolean; feature: "schema" | "user" | null },
) {
  await loginWithAuth(page, mockApi, {
    permissions: maintainer ? [...PERMISSIONS, "MAINTAINER"] : PERMISSIONS,
    features: feature === "schema" ? [FEATURE] : [],
    userFeatures: feature === "user" ? [FEATURE] : [],
  });
}

const UNAVAILABLE =
  "Disponível apenas para a curadoria, em schema com a prescrição de teste habilitada.";

/** Lists for the form: one department, one drug and its units and frequencies */
function mockFormLists(mockApi: MockApi) {
  mockApi.override(
    "GET /segments/departments",
    respond([{ idSegment: 1, idDepartment: 7, label: "UTI Teste" }]),
  );
  mockApi.override(
    "GET /lists/routes",
    respond([{ id: "VO", name: "Via oral" }]),
  );
  mockApi.override(
    "GET /drugs",
    respond([{ idDrug: "123456789012345678", name: "DIPIRONA 500 MG CP" }]),
  );
  mockApi.override(
    "GET /drugs/resources/:idDrug/:idSegment",
    respond({
      units: [
        { id: "mg", description: "Miligrama", amount: 3 },
        { id: "mg", description: "Miligrama", amount: 0 },
      ],
      frequencies: [{ id: "6", description: "6/6h", amount: 2 }],
    }),
  );
}

async function pickOption(page: Page, id: string, option: string) {
  await openSelectById(page, id);
  await page
    .locator(".ant-select-dropdown:visible .ant-select-item-option")
    .filter({ hasText: option })
    .click();
}

test("maintainers are not offered the page without the schema feature", async ({
  page,
  mockApi,
}) => {
  await login(page, mockApi, { maintainer: true, feature: null });
  await openCuration(page);
  await expect(page.locator(MENU_ITEM)).toHaveCount(0);

  // nor is the form shown at its address
  await page.goto(PAGE);
  await expect(page.getByText(UNAVAILABLE)).toBeVisible();
  await expect(page.getByText("Novo atendimento")).toHaveCount(0);
});

test("a user feature does not turn the page on", async ({ page, mockApi }) => {
  await login(page, mockApi, { maintainer: true, feature: "user" });
  await openCuration(page);
  await expect(page.locator(MENU_ITEM)).toHaveCount(0);

  await page.goto(PAGE);
  await expect(page.getByText(UNAVAILABLE)).toBeVisible();
});

test("only maintainers are offered the page with the schema feature", async ({
  page,
  mockApi,
}) => {
  await login(page, mockApi, { maintainer: false, feature: "schema" });
  // no Curadoria menu at all
  await expect(
    page.locator(".ant-menu-submenu-title").filter({ hasText: "Curadoria" }),
  ).toHaveCount(0);

  await page.goto(PAGE);
  await expect(page.getByText(UNAVAILABLE)).toBeVisible();
  await expect(page.getByText("Novo atendimento")).toHaveCount(0);
});

test("creates a test case and opens its prescription-day", async ({
  page,
  mockApi,
}) => {
  mockFormLists(mockApi);
  mockApi.override(
    "POST /prescriptions/test-case",
    respond({
      idPrescription: "2001",
      admissionNumber: 10001,
      idPatient: "501",
      idSegment: 1,
      idPrescriptionDay: "2611100110010001",
      items: ["2001000"],
    }),
  );

  await login(page, mockApi, { maintainer: true, feature: "schema" });
  await openPage(page);

  const form = page.getByRole("main");
  const pending = form.getByText("Alterações não salvas");

  // one card per section, linked from the side column
  for (const section of ["Atendimento", "Prescrição", "Itens"]) {
    await expect(
      form.locator(".ant-anchor-link-title").filter({ hasText: section }),
    ).toBeVisible();
  }
  await expect(pending).toHaveCount(0);

  await form.getByLabel("Peso (kg)").fill("70");
  // the side column warns until the prescription is created
  await expect(pending).toBeVisible();
  await pickOption(page, "gender", "Feminino");
  await pickOption(page, "idDepartment", "UTI Teste");
  await form.getByLabel("Leito").fill("T-01");

  await form.locator("#items_0_drug").fill("dipi");
  await page
    .locator(".ant-select-dropdown:visible .ant-select-item-option")
    .filter({ hasText: "DIPIRONA 500 MG CP" })
    .click();
  // the item is listed in the side column by its drug
  await expect(
    form
      .locator(".ant-anchor-link-title")
      .filter({ hasText: "DIPIRONA 500 MG CP" }),
  ).toBeVisible();
  await form.getByLabel("Dose").fill("500");
  await pickOption(page, "items_0_measureUnit", "Miligrama");
  await pickOption(page, "items_0_frequency", "6/6h");
  await form.getByLabel("Horário").fill("06 12 18 24");
  await form.getByLabel("Via").fill("VO");

  await form.getByRole("button", { name: "Criar e processar" }).click();

  await expect(form.getByText("Prescrição de teste criada")).toBeVisible();
  await expect(
    form.getByText("Prescrição 2001, atendimento 10001."),
  ).toBeVisible();
  await expect(
    form.getByRole("link", { name: "Abrir prescrição-dia" }),
  ).toHaveAttribute("href", "/prescricao/2611100110010001");

  const create = mockApi.requests.find(
    (r) => r.method === "POST" && r.path === "/prescriptions/test-case",
  );
  expect(create).toBeTruthy();
  const body = JSON.parse(create!.postData ?? "{}");
  expect(body.admissionNumber).toBeNull();
  expect(body.patient).toEqual({
    birthdate: null,
    gender: "F",
    weight: 70,
    height: null,
  });
  expect(body.idDepartment).toBe("7");
  expect(body.bed).toBe("T-01");
  expect(body.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
  expect(body.items).toEqual([
    {
      // the id stays a string: it does not fit a javascript number
      idDrug: "123456789012345678",
      source: "Medicamentos",
      dose: 500,
      measureUnit: "mg",
      frequency: "6",
      interval: "06 12 18 24",
      route: "VO",
      notes: null,
    },
  ]);

  // the next prescription goes to the same admission
  await form
    .getByRole("button", { name: "Nova prescrição neste atendimento" })
    .click();
  await expect(form.getByLabel("Número do atendimento")).toHaveValue("10001");
});

test("shows the backend's refusal", async ({ page, mockApi }) => {
  mockFormLists(mockApi);
  mockApi.override("POST /prescriptions/test-case", {
    status: 400,
    json: {
      status: "error",
      message: "Setor sem segmento",
      code: "errors.invalidParams",
    },
  });

  await login(page, mockApi, { maintainer: true, feature: "schema" });
  await openPage(page);

  const form = page.getByRole("main");
  await pickOption(page, "idDepartment", "UTI Teste");
  await form.locator("#items_0_drug").fill("dipi");
  await page
    .locator(".ant-select-dropdown:visible .ant-select-item-option")
    .filter({ hasText: "DIPIRONA 500 MG CP" })
    .click();
  await form.getByRole("button", { name: "Criar e processar" }).click();

  await expect(page.getByText("Setor sem segmento")).toBeVisible();
  // the form stays, to fix and send again
  await expect(
    form.getByRole("button", { name: "Criar e processar" }),
  ).toBeVisible();
});
