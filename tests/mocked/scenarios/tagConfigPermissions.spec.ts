import { test, expect } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";
import { openSelect } from "../support/antd";

/**
 * READ_TAGS vs WRITE_TAGS on /admin/tags, plus the navigation-tag carve-out
 * WRITE_PATIENT_TAGS gets. PRESCRIPTION_ANALYST and TRAINING hold READ_TAGS
 * without any tag write permission, so read-only mode has real users.
 */

const BASE_PERMISSIONS = ["READ_BASIC_FEATURES", "READ_PRESCRIPTION"];

const tags = [
  {
    name: "ALTO RISCO",
    tagType: 1,
    active: true,
    createdAt: "2026-01-05T10:00:00",
    updatedAt: "2026-01-10T10:00:00",
  },
  {
    name: "NAVEGACAO_ONCOLOGIA",
    tagType: 2,
    active: false,
    createdAt: "2026-01-05T10:00:00",
    updatedAt: null,
  },
];

const installTagHandlers = (mockApi: {
  override: (key: string, handler: unknown) => void;
}) => {
  mockApi.override("POST /admin/tag/list", {
    json: { status: "success", data: tags },
  });
  mockApi.override("GET /user-admin/contact-list", {
    json: {
      status: "success",
      data: [{ id: 9, name: "Ana Gestora", email: "ana@example.com" }],
    },
  });
};

test.use({ storageState: { cookies: [], origins: [] } });

test("READ_TAGS alone shows the tags read-only", async ({ page, mockApi }) => {
  installTagHandlers(mockApi);
  await loginWithPermissions(page, mockApi, [
    ...BASE_PERMISSIONS,
    "READ_TAGS",
    "READ_NAV",
  ]);

  await page.goto("/admin/tags");

  await expect(
    page.getByRole("cell", { name: "ALTO RISCO", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Paciente (Navegação)")).toBeVisible();

  await expect(
    page.getByRole("button", { name: "Adicionar marcador" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Editar marcador" }),
  ).toHaveCount(0);

  const action = page
    .getByRole("button", { name: "Visualizar marcador" })
    .first();
  await expect(action).toBeVisible();
  await action.click();

  const modal = page.getByRole("dialog");
  await expect(modal).toBeVisible();
  await expect(modal.getByRole("button", { name: "Salvar" })).toHaveCount(0);
  await expect(
    modal.locator(".ant-modal-footer").getByRole("button", { name: "Fechar" }),
  ).toBeVisible();

  const activeRow = modal.locator(".form-row").filter({ hasText: "Ativo:" });
  await expect(activeRow.locator("button.ant-switch")).toBeDisabled();
  await modal
    .locator(".ant-modal-footer")
    .getByRole("button", { name: "Fechar" })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  // the alert links to the config managers to ask for a change
  await expect(
    page.getByText(
      "Você não possui permissão para criar ou alterar marcadores",
    ),
  ).toBeVisible();
  await page.getByTestId("config-manager-link").click();
  await expect(
    page.getByRole("dialog").getByRole("cell", { name: "Ana Gestora" }),
  ).toBeVisible();
});

// WRITE_PATIENT_TAGS + READ_NAV (NAVIGATOR) may write navigation tags only,
// matching the tagType check in admin_tag_service.upsert_tag.
test("WRITE_PATIENT_TAGS writes navigation tags only", async ({
  page,
  mockApi,
}) => {
  installTagHandlers(mockApi);
  await loginWithPermissions(page, mockApi, [
    ...BASE_PERMISSIONS,
    "READ_TAGS",
    "WRITE_PATIENT_TAGS",
    "READ_NAV",
  ]);

  await page.goto("/admin/tags");

  await expect(
    page.getByRole("button", { name: "Adicionar marcador" }),
  ).toBeVisible();
  await expect(page.getByTestId("config-manager-link")).toHaveCount(0);

  const patientRow = page.getByRole("row", { name: /ALTO RISCO/ });
  await expect(
    patientRow.getByRole("button", { name: "Visualizar marcador" }),
  ).toBeVisible();

  const navRow = page.getByRole("row", { name: /NAVEGACAO_ONCOLOGIA/ });
  await expect(
    navRow.getByRole("button", { name: "Editar marcador" }),
  ).toBeVisible();

  // the patient tag opens read-only, the navigation tag opens editable
  await patientRow.getByRole("button", { name: "Visualizar marcador" }).click();
  let modal = page.getByRole("dialog");
  await expect(modal.getByRole("button", { name: "Salvar" })).toHaveCount(0);
  await modal
    .locator(".ant-modal-footer")
    .getByRole("button", { name: "Fechar" })
    .click();

  await navRow.getByRole("button", { name: "Editar marcador" }).click();
  modal = page.getByRole("dialog");
  await expect(modal.getByRole("button", { name: "Salvar" })).toBeVisible();
  await modal.getByRole("button", { name: "Cancelar" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  // a new tag may only be a navigation tag
  await page.getByRole("button", { name: "Adicionar marcador" }).click();
  modal = page.getByRole("dialog");
  await openSelect(modal.locator(".form-row").filter({ hasText: "Tipo:" }));

  const options = page.locator(
    ".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option",
  );
  await expect(options).toHaveCount(1);
  await expect(options).toHaveText("Marcador de navegação do paciente");
});

// PRESCRIPTION_ANALYST has WRITE_PATIENT_TAGS but no READ_NAV: navigation tags
// are neither listed nor selectable for them, so the page is read-only.
test("WRITE_PATIENT_TAGS without READ_NAV stays read-only", async ({
  page,
  mockApi,
}) => {
  installTagHandlers(mockApi);
  await loginWithPermissions(page, mockApi, [
    ...BASE_PERMISSIONS,
    "READ_TAGS",
    "WRITE_PATIENT_TAGS",
  ]);

  await page.goto("/admin/tags");

  await expect(
    page.getByRole("cell", { name: "ALTO RISCO", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Adicionar marcador" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Editar marcador" }),
  ).toHaveCount(0);
  await expect(page.getByTestId("config-manager-link")).toBeVisible();
});

test("WRITE_TAGS enables the write actions", async ({ page, mockApi }) => {
  installTagHandlers(mockApi);
  await loginWithPermissions(page, mockApi, [
    ...BASE_PERMISSIONS,
    "READ_TAGS",
    "WRITE_TAGS",
    "READ_NAV",
  ]);

  await page.goto("/admin/tags");

  await expect(
    page.getByRole("button", { name: "Adicionar marcador" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Editar marcador" }).first().click();

  const modal = page.getByRole("dialog");
  await expect(modal.getByRole("button", { name: "Salvar" })).toBeVisible();

  const activeRow = modal.locator(".form-row").filter({ hasText: "Ativo:" });
  await expect(activeRow.locator("button.ant-switch")).toBeEnabled();
});
