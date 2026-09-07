import { test, expect, API_URL } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";

/**
 * Saving one exam must patch that row in place: the list is not refetched
 * (which emptied the table and threw the user back to the top of the page)
 * and the row is not re-sorted when its name changes.
 */

const BASE_PERMISSIONS = ["READ_BASIC_FEATURES", "READ_PRESCRIPTION"];

const exam = (type: string, name: string, order: number) => ({
  idSegment: 1,
  segment: "Adulto",
  type,
  initials: name.slice(0, 5),
  name,
  min: 0.5,
  max: 1.2,
  ref: "0,5 a 1,2 mg/dL",
  order,
  active: true,
  updatedAt: "2026-01-10T10:00:00",
  tpExamRef: null,
});

/** enough rows to make the page scrollable — the bug was a scroll jump */
const exams = Array.from({ length: 40 }, (_, i) => {
  const label = String(i + 1).padStart(2, "0");

  return exam(`exame${label}`, `Exame ${label}`, i + 1);
});

const installExamHandlers = (mockApi: {
  override: (key: string, handler: unknown) => void;
}) => {
  const ok = (data: unknown) => ({ json: { status: "success", data } });

  mockApi.override("POST /admin/exam/list", ok(exams));
  mockApi.override("GET /admin/exam/types", ok([...exams.map((e) => e.type), "sodio"])); // prettier-ignore
  mockApi.override("GET /admin/exam/list-global", ok([]));
  mockApi.override("POST /admin/exam/get", async (route: any) => {
    const { examType } = route.request().postDataJSON();

    return route.fulfill({
      json: {
        status: "success",
        data: exams.find((item) => item.type === examType),
      },
    });
  });
  // the endpoint answers with the persisted row, in the list row shape
  mockApi.override("POST /admin/exam/upsert", async (route: any) => {
    const data = route.request().postDataJSON();
    const stored = exams.find((item) => item.type === data.type);

    return route.fulfill({
      json: {
        status: "success",
        data: {
          ...(stored ?? { segment: "Adulto", order: 99 }),
          ...data,
          updatedAt: "2026-01-10T10:00:00",
          new: undefined,
        },
      },
    });
  });
};

const openList = async (page: any, mockApi: any) => {
  installExamHandlers(mockApi);
  await loginWithPermissions(page, mockApi, [
    ...BASE_PERMISSIONS,
    "READ_CONFIG_EXAMS",
    "WRITE_CONFIG_EXAMS",
  ]);

  await page.goto("/admin/exames");

  const rows = page.locator(".ant-table-tbody tr.ant-table-row");
  await expect(rows).toHaveCount(exams.length);

  const listCalls = () =>
    mockApi.requests.filter((r: any) => r.path === "/admin/exam/list").length;

  return { rows, listCalls };
};

const nameInput = (modal: any) =>
  modal.locator(".form-row").filter({ hasText: "Nome:" }).locator("input");

test.use({ storageState: { cookies: [], origins: [] } });

test("saving an exam keeps the scroll position and the row in place", async ({
  page,
  mockApi,
}) => {
  const { rows, listCalls } = await openList(page, mockApi);

  await page.evaluate(() => window.scrollTo(0, 800));
  const scrollBeforeSave = await page.evaluate(() => window.scrollY);
  expect(scrollBeforeSave).toBeGreaterThan(0);

  // rename a row below the fold to a name that would sort last
  await rows.nth(14).locator(".gtm-bt-view-exam").click();

  const modal = page.getByRole("dialog");
  await expect(nameInput(modal)).toHaveValue("Exame 15");
  await nameInput(modal).fill("Zinco");

  const listCallsBeforeSave = listCalls();
  const upsert = page.waitForResponse(`${API_URL}/admin/exam/upsert`);
  await modal.getByRole("button", { name: "Salvar" }).click();
  await upsert;

  await expect(page.getByRole("dialog")).toHaveCount(0);

  // the row keeps its position and shows the saved value
  await expect(rows).toHaveCount(exams.length);
  await expect(rows.nth(14)).toContainText("Zinco");
  await expect(rows.nth(15)).toContainText("Exame 16");

  // the list was never refetched, so the user stays where they were
  expect(listCalls()).toBe(listCallsBeforeSave);
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollBeforeSave);
});

test("adding an exam inserts the row without reloading the list", async ({
  page,
  mockApi,
}) => {
  const { rows, listCalls } = await openList(page, mockApi);

  await page.getByRole("button", { name: "Adicionar Exame" }).click();

  const modal = page.getByRole("dialog");
  await expect(modal).toBeVisible();

  // antd searchable select: open it, type to filter, confirm with Enter
  const pick = async (label: string, option: string) => {
    const row = modal.locator(".form-row").filter({ hasText: label });
    await row.locator(".ant-select").click();
    await page.keyboard.type(option);
    await page.keyboard.press("Enter");
  };

  await pick("Segmento:", "Adulto");
  await pick("Tipo de Exame:", "sodio");
  await nameInput(modal).fill("Aaa Sodio");
  await modal
    .locator(".form-row")
    .filter({ hasText: "Rótulo:" })
    .locator("input")
    .fill("Na");
  await modal
    .locator(".form-row")
    .filter({ hasText: "Referência:" })
    .locator("input")
    .fill("135 a 145");
  await modal
    .locator(".form-row")
    .filter({ hasText: "Valor mínimo:" })
    .locator("input")
    .fill("135");
  await modal
    .locator(".form-row")
    .filter({ hasText: "Valor máximo:" })
    .locator("input")
    .fill("145");

  const listCallsBeforeSave = listCalls();
  const upsert = page.waitForResponse(`${API_URL}/admin/exam/upsert`);
  await modal.getByRole("button", { name: "Salvar" }).click();
  await upsert;

  await expect(page.getByRole("dialog")).toHaveCount(0);

  // inserted following the name ordering, without a refetch
  await expect(rows).toHaveCount(exams.length + 1);
  await expect(rows.nth(0)).toContainText("Aaa Sodio");
  expect(listCalls()).toBe(listCallsBeforeSave);
});
