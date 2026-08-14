import { test, expect } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";

/**
 * READ_CONFIG_EXAMS vs WRITE_CONFIG_EXAMS on /admin/exames.
 * No assignable role grants read-only exam config today, so this suite is
 * the only place the read-only render path is exercised.
 */

const BASE_PERMISSIONS = ["READ_BASIC_FEATURES", "READ_PRESCRIPTION"];

const segmentExam = {
  idSegment: 1,
  segment: "Segmento Adulto",
  type: "creatinina",
  initials: "Creat",
  name: "Creatinina",
  min: 0.5,
  max: 1.2,
  ref: "0,5 a 1,2 mg/dL",
  order: 1,
  active: true,
  updatedAt: "2026-01-10T10:00:00",
  tpExamRef: null,
};

const installExamHandlers = (mockApi: {
  override: (key: string, handler: unknown) => void;
}) => {
  const ok = (data: unknown) => ({ json: { status: "success", data } });

  mockApi.override("POST /admin/exam/list", ok([segmentExam]));
  mockApi.override("POST /admin/exam/get", ok(segmentExam));
  mockApi.override("GET /admin/exam/types", ok(["creatinina", "hb"]));
  mockApi.override("GET /admin/exam/list-global", ok([]));
};

test.use({ storageState: { cookies: [], origins: [] } });

test("READ_CONFIG_EXAMS alone shows the config read-only", async ({
  page,
  mockApi,
}) => {
  installExamHandlers(mockApi);
  await loginWithPermissions(page, mockApi, [
    ...BASE_PERMISSIONS,
    "READ_CONFIG_EXAMS",
  ]);

  await page.goto("/admin/exames");

  await expect(page.getByRole("heading", { name: "Exames" })).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "Creatinina", exact: true }),
  ).toBeVisible();

  // write actions are hidden
  await expect(
    page.getByRole("button", { name: "Adicionar Exame" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Card de Exames" }),
  ).toHaveCount(0);

  // the row action opens the form in view mode
  const action = page.locator(".gtm-bt-view-exam");
  await expect(action).toBeVisible();
  await action.click();

  const modal = page.getByRole("dialog");
  await expect(modal).toBeVisible();
  await expect(modal.getByRole("button", { name: "Salvar" })).toHaveCount(0);
  await expect(modal.getByRole("button", { name: "Fechar" })).toBeVisible();

  const nameRow = modal.locator(".form-row").filter({ hasText: "Nome:" });
  await expect(nameRow.locator("input")).toBeDisabled();

  const activeRow = modal.locator(".form-row").filter({ hasText: "Ativo:" });
  await expect(activeRow.locator("button.ant-switch")).toBeDisabled();
});

test("WRITE_CONFIG_EXAMS enables the write actions", async ({
  page,
  mockApi,
}) => {
  installExamHandlers(mockApi);
  await loginWithPermissions(page, mockApi, [
    ...BASE_PERMISSIONS,
    "READ_CONFIG_EXAMS",
    "WRITE_CONFIG_EXAMS",
  ]);

  await page.goto("/admin/exames");

  await expect(
    page.getByRole("button", { name: "Adicionar Exame" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Card de Exames" }),
  ).toBeVisible();

  await page.locator(".gtm-bt-view-exam").click();

  const modal = page.getByRole("dialog");
  await expect(modal.getByRole("button", { name: "Salvar" })).toBeVisible();
});
