import { test, expect, API_URL } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";

/**
 * The exam form fields are limited by their segmentoexame columns, and the
 * backend html-escapes them before storing (markupsafe: & < > " ' grow to
 * 4-5 chars). The form counts the stored length, so a text that only
 * overflows once escaped is caught before the request instead of becoming a
 * database error.
 */

const BASE_PERMISSIONS = ["READ_BASIC_FEATURES", "READ_PRESCRIPTION"];

const exam = {
  idSegment: 1,
  segment: "Adulto",
  type: "creatinina",
  initials: "Cr",
  name: "Creatinina",
  min: 0.5,
  max: 1.2,
  ref: "0,5 a 1,2 mg/dL",
  order: 1,
  active: true,
  updatedAt: "2026-01-10T10:00:00",
  tpExamRef: null,
};

const openExam = async (page: any, mockApi: any, stored = exam) => {
  const ok = (data: unknown) => ({ json: { status: "success", data } });

  mockApi.override("POST /admin/exam/list", ok([stored]));
  mockApi.override("GET /admin/exam/list-global", ok([]));
  mockApi.override("POST /admin/exam/get", ok(stored));
  mockApi.override("POST /admin/exam/upsert", async (route: any) =>
    route.fulfill(ok({ ...stored, ...route.request().postDataJSON() })),
  );

  await loginWithPermissions(page, mockApi, [
    ...BASE_PERMISSIONS,
    "READ_CONFIG_EXAMS",
    "WRITE_CONFIG_EXAMS",
  ]);

  await page.goto("/admin/exames");
  await page.locator(".gtm-bt-view-exam").first().click();

  const modal = page.getByRole("dialog");
  const refRow = modal.locator(".form-row").filter({ hasText: "Referência:" });
  await expect(refRow.locator("input")).toHaveValue(stored.ref);

  return { modal, refRow };
};

const upsertCalls = (mockApi: any) =>
  mockApi.requests.filter((r: any) => r.path === "/admin/exam/upsert");

test.use({ storageState: { cookies: [], origins: [] } });

test("a reference that only overflows once escaped blocks the save", async ({
  page,
  mockApi,
}) => {
  const { modal, refRow } = await openExam(page, mockApi);

  // 250 typed chars, 253 once the backend escapes "<" to "&lt;"
  await refRow.locator("input").fill(`${"a".repeat(249)}<`);

  await expect(refRow.locator(".ant-input-show-count-suffix")).toHaveText(
    "253 / 250",
  );
  await expect(refRow.locator(".form-error")).toHaveText(
    "Máximo de 250 caracteres",
  );

  await modal.getByRole("button", { name: "Salvar" }).click();

  await expect(modal).toBeVisible();
  expect(upsertCalls(mockApi)).toHaveLength(0);
});

test("a reference at the limit is saved", async ({ page, mockApi }) => {
  const { modal, refRow } = await openExam(page, mockApi);
  const ref = "a".repeat(250);

  await refRow.locator("input").fill(ref);
  await expect(refRow.locator(".ant-input-show-count-suffix")).toHaveText(
    "250 / 250",
  );

  const upsert = page.waitForRequest(`${API_URL}/admin/exam/upsert`);
  await modal.getByRole("button", { name: "Salvar" }).click();

  expect((await upsert).postDataJSON().ref).toBe(ref);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("an already escaped reference counts what saving it again stores", async ({
  page,
  mockApi,
}) => {
  // the backend returns the stored, escaped value; saving escapes it again
  const { refRow } = await openExam(page, mockApi, {
    ...exam,
    ref: "&lt; 1,2",
  });

  // "&amp;lt; 1,2"
  await expect(refRow.locator(".ant-input-show-count-suffix")).toHaveText(
    "12 / 250",
  );
});

test("a name that overflows once escaped shows the limit", async ({
  page,
  mockApi,
}) => {
  const { modal } = await openExam(page, mockApi);
  const nameRow = modal.locator(".form-row").filter({ hasText: "Nome:" });

  // 250 typed chars, 254 once "&" becomes "&amp;"
  await nameRow.locator("input").fill(`${"a".repeat(249)}&`);
  await modal.getByRole("button", { name: "Salvar" }).click();

  await expect(nameRow.locator(".form-error")).toHaveText(
    "Máximo de 250 caracteres",
  );
  expect(upsertCalls(mockApi)).toHaveLength(0);
});
