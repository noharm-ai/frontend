import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loginWithAuth } from "../support/featureLogin";
import type { Locator, Page } from "@playwright/test";

/**
 * /admin/exames: the "Copiar Exames" and "Exames Mais Frequentes" modals,
 * gated by ADMIN_EXAMS__COPY on top of the exam write permission. Covers the
 * gate, the form validation, the payloads both send and how they handle a
 * server error.
 */

const WRITE_PERMISSIONS = [
  "READ_BASIC_FEATURES",
  "READ_PRESCRIPTION",
  "READ_CONFIG_EXAMS",
  "WRITE_CONFIG_EXAMS",
];

const ok = (data: unknown) => ({ json: { status: "success", data } });

const segments = [
  { id: 1, description: "Adulto", status: 1 },
  { id: 2, description: "Pediatria", status: 1 },
];

const mostFrequent = [
  { type: "creatinina", count: 1520, min: 0.3, max: 9.8 },
  { type: "hemoglobina", count: 1310, min: 4.1, max: 18.2 },
  { type: "potassio", count: 980, min: 2.1, max: 7.4 },
];

const installHandlers = (mockApi: MockApi) => {
  mockApi.override("POST /admin/exam/list", ok([]));
  mockApi.override("GET /admin/exam/types", ok([]));
  mockApi.override("GET /admin/exam/list-global", ok([]));
  mockApi.override("GET /admin/exam/most-frequent", ok(mostFrequent));
};

const openExams = async (
  page: Page,
  mockApi: MockApi,
  permissions: string[] = [...WRITE_PERMISSIONS, "ADMIN_EXAMS__COPY"],
) => {
  installHandlers(mockApi);
  // the segment list comes with the login
  await loginWithAuth(page, mockApi, { permissions, segments });
  await page.goto("/admin/exames");
  await expect(page.locator('[data-kb="admin.exams.title"]')).toBeVisible();
};

const formRow = (scope: Locator, label: string) =>
  scope.locator(".form-row").filter({ hasText: label });

const pickSegment = async (
  page: Page,
  scope: Locator,
  label: string,
  segment: string,
) => {
  // searchable select: open it, type to filter, confirm with Enter
  await formRow(scope, label).locator(".ant-select").click();
  await page.keyboard.type(segment);
  await page.keyboard.press("Enter");
  await expect(formRow(scope, label).locator(".ant-select")).toContainText(
    segment,
  );
};

const requestsTo = (mockApi: MockApi, path: string) =>
  mockApi.requests.filter((r) => r.method === "POST" && r.path === path);

test.use({ storageState: { cookies: [], origins: [] } });

test("the copy and most frequent actions need ADMIN_EXAMS__COPY", async ({
  page,
  mockApi,
}) => {
  await openExams(page, mockApi, WRITE_PERMISSIONS);

  // the other write actions are there, these two are not
  await expect(
    page.getByRole("button", { name: "Adicionar Exame" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Copiar Exames" })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("button", { name: "Exames Mais Frequentes" }),
  ).toHaveCount(0);
});

test.describe("copy exams", () => {
  test("requires both segments and sends them", async ({ page, mockApi }) => {
    mockApi.override("POST /admin/exam/copy", ok(7));
    await openExams(page, mockApi);

    await page.getByRole("button", { name: "Copiar Exames" }).click();
    const modal = page.getByRole("dialog");
    await expect(modal.getByText("Copiar Exames")).toBeVisible();

    // nothing chosen: both fields are required and nothing is sent
    await modal.getByRole("button", { name: "Iniciar cópia" }).click();
    await expect(modal.locator(".form-error")).toHaveText([
      "Campo obrigatório",
      "Campo obrigatório",
    ]);
    expect(requestsTo(mockApi, "/admin/exam/copy")).toHaveLength(0);

    await pickSegment(page, modal, "Segmento origem:", "Adulto");
    await pickSegment(page, modal, "Segmento destino:", "Pediatria");
    await expect(modal.locator(".form-error")).toHaveCount(0);

    await modal.getByRole("button", { name: "Iniciar cópia" }).click();

    await expect(page.getByText("Exames copiados!")).toBeVisible();
    await expect(page.getByText("7 exames inseridos")).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    const calls = requestsTo(mockApi, "/admin/exam/copy");
    expect(calls).toHaveLength(1);
    expect(JSON.parse(calls[0].postData ?? "{}")).toEqual({
      idSegmentOrigin: 1,
      idSegmentDestiny: 2,
    });
  });

  test("a server error keeps the modal open with the message", async ({
    page,
    mockApi,
  }) => {
    mockApi.override("POST /admin/exam/copy", {
      status: 400,
      json: { status: "error", message: "Segmento destino inválido" },
    });
    await openExams(page, mockApi);

    await page.getByRole("button", { name: "Copiar Exames" }).click();
    const modal = page.getByRole("dialog");

    await pickSegment(page, modal, "Segmento origem:", "Adulto");
    await pickSegment(page, modal, "Segmento destino:", "Adulto");
    await modal.getByRole("button", { name: "Iniciar cópia" }).click();

    await expect(page.getByText("Segmento destino inválido")).toBeVisible();
    await expect(page.getByText("Exames copiados!")).toHaveCount(0);

    // the modal stays, ready to try again
    await expect(modal).toBeVisible();
    await expect(
      modal.getByRole("button", { name: "Iniciar cópia" }),
    ).toBeEnabled();
  });
});

test.describe("most frequent exams", () => {
  const rows = (modal: Locator) =>
    modal.locator(".ant-table-tbody tr.ant-table-row");

  test("lists the exams, narrows them by name and adds the selected ones", async ({
    page,
    mockApi,
  }) => {
    mockApi.override("POST /admin/exam/most-frequent/add", ok(true));
    await openExams(page, mockApi);

    await page.getByRole("button", { name: "Exames Mais Frequentes" }).click();
    const modal = page.getByRole("dialog");

    await expect(rows(modal)).toHaveCount(3);
    await expect(rows(modal).first()).toContainText("creatinina");
    await expect(rows(modal).first()).toContainText("1520");

    // the search narrows the list, case-insensitively
    const search = modal.getByPlaceholder("Procurar por exame");
    await search.fill("HEMO");
    await expect(rows(modal)).toHaveCount(1);
    await expect(rows(modal).first()).toContainText("hemoglobina");
    await rows(modal).first().getByRole("checkbox").check();
    await search.fill("");
    await expect(rows(modal)).toHaveCount(3);

    // a selection made under the search survives clearing it
    await expect(modal.getByText("1 exames selecionados")).toBeVisible();
    await rows(modal)
      .filter({ hasText: "potassio" })
      .getByRole("checkbox")
      .check();
    await expect(modal.getByText("2 exames selecionados")).toBeVisible();

    // the destination segment is required
    await modal.getByRole("button", { name: "Adicionar Exames" }).click();
    await expect(
      formRow(modal, "Segmento destino:").locator(".form-error"),
    ).toHaveText("Campo obrigatório");

    await pickSegment(page, modal, "Segmento destino:", "Pediatria");
    await modal.getByRole("button", { name: "Adicionar Exames" }).click();

    const confirm = page
      .locator(".ant-modal-confirm")
      .filter({ hasText: "Confirma a inclusao dos exames selecionados?" });
    await expect(confirm).toContainText("2 exames selecionados");
    expect(requestsTo(mockApi, "/admin/exam/most-frequent/add")).toHaveLength(
      0,
    );
    await confirm.getByRole("button", { name: "Confirmar" }).click();

    await expect(page.getByText("Exames inseridos com sucesso!")).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    const calls = requestsTo(mockApi, "/admin/exam/most-frequent/add");
    expect(calls).toHaveLength(1);
    expect(JSON.parse(calls[0].postData ?? "{}")).toEqual({
      idSegment: 2,
      examTypes: ["hemoglobina", "potassio"],
    });
  });

  test("asks for at least one exam before confirming", async ({
    page,
    mockApi,
  }) => {
    await openExams(page, mockApi);

    await page.getByRole("button", { name: "Exames Mais Frequentes" }).click();
    const modal = page.getByRole("dialog");
    await expect(rows(modal)).toHaveCount(3);

    await pickSegment(page, modal, "Segmento destino:", "Adulto");
    await modal.getByRole("button", { name: "Adicionar Exames" }).click();

    await expect(modal.getByText("Selecione ao menos um exame")).toBeVisible();
    await expect(page.locator(".ant-modal-confirm")).toHaveCount(0);
    expect(requestsTo(mockApi, "/admin/exam/most-frequent/add")).toHaveLength(
      0,
    );
  });

  test("a failed save keeps the modal and the selection", async ({
    page,
    mockApi,
  }) => {
    mockApi.override("POST /admin/exam/most-frequent/add", {
      status: 500,
      json: { status: "error", message: "Falha ao inserir exames" },
    });
    await openExams(page, mockApi);

    await page.getByRole("button", { name: "Exames Mais Frequentes" }).click();
    const modal = page.getByRole("dialog").filter({
      hasText: "Exames Mais Frequentes",
    });
    await rows(modal).first().getByRole("checkbox").check();
    await pickSegment(page, modal, "Segmento destino:", "Adulto");
    await modal.getByRole("button", { name: "Adicionar Exames" }).click();
    await page
      .locator(".ant-modal-confirm")
      .getByRole("button", { name: "Confirmar" })
      .click();

    await expect(page.getByText("Falha ao inserir exames")).toBeVisible();
    await expect(page.getByText("Exames inseridos com sucesso!")).toHaveCount(
      0,
    );
    await expect(modal).toBeVisible();
    await expect(modal.getByText("1 exames selecionados")).toBeVisible();
  });
});
