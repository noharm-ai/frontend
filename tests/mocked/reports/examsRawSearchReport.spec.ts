import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";

/**
 * "Busca de Exames" (features/reports/ExamsRawSearchReport): a maintainer-only
 * report of the patient card's Relatórios tab that lists every exam result of
 * the patient (GET /reports/exams/raw), configured or not, and filters the
 * list on the client by result and type.
 */

// the report is only offered to maintainers
test.use({ storageState: { cookies: [], origins: [] } });

const PERMISSIONS = [
  "READ_BASIC_FEATURES",
  "WRITE_BASIC_FEATURES",
  "READ_PRESCRIPTION",
  "WRITE_PRESCRIPTION",
  "MAINTAINER",
];

const EXAMS = [
  {
    idExam: 1,
    idPatient: 99,
    dateExam: "2024-03-01T08:00:00",
    typeExam: "CREATININA",
    value: "0.65",
    unit: "mg/dL",
  },
  {
    idExam: 2,
    idPatient: 99,
    dateExam: "2024-03-02T08:00:00",
    typeExam: "POTASSIO",
    value: "4.1",
    unit: "mmol/L",
  },
  {
    idExam: 3,
    idPatient: 99,
    dateExam: "2024-03-03T08:00:00",
    typeExam: "CREATININA",
    value: "0.92",
    unit: null,
  },
];

const reportRequests = (mockApi: { requests: { path: string }[] }) =>
  mockApi.requests.filter((r) => r.path === "/reports/exams/raw");

const openReport = async (page: Page) => {
  await page.goto("/prescricao/199");
  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();

  await page.getByRole("tab", { name: "pie-chart" }).click();
  await page.locator(".report-list li", { hasText: "Busca de Exames" }).click();
};

test.beforeEach(async ({ page, mockApi }) => {
  await loginWithPermissions(page, mockApi, PERMISSIONS);
});

test("lists the patient's exams and filters them by result", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /reports/exams/raw", {
    json: { status: "success", data: EXAMS },
  });

  const reportRequest = page.waitForRequest((r) =>
    r.url().includes("/reports/exams/raw"),
  );
  await openReport(page);

  // the report asks for the patient of the prescription
  expect(
    new URL((await reportRequest).url()).searchParams.get("idPatient"),
  ).toBe("99");

  await expect(
    page.getByRole("heading", {
      name: "Relatório: Busca de Exames - Atendimento 9999",
    }),
  ).toBeVisible();

  const table = page.locator(".ant-modal .ant-table");
  await expect(table.locator(".ant-table-row")).toHaveCount(3);
  await expect(table).toContainText("3 registro(s)");
  await expect(table).toContainText("mmol/L");

  await page.getByPlaceholder("Ex: 0.6").fill("0.9");
  await page
    .locator(".ant-modal")
    .getByRole("button", { name: "search" })
    .click();

  await expect(table.locator(".ant-table-row")).toHaveCount(1);
  await expect(table).toContainText("0.92");
  await expect(table).toContainText("1 registro(s)");
  await expect(page.locator(".report-filter-list")).toContainText("0.9");
});

test("a failed load offers to try again", async ({ page, mockApi }) => {
  mockApi.override("GET /reports/exams/raw", {
    status: 500,
    json: { status: "error", message: "boom" },
  });

  await openReport(page);

  // the dev server mounts in StrictMode, so the load may run (and fail)
  // twice: the newest confirm is the one on top
  const confirm = page.locator(".ant-modal-confirm").last();
  await expect(confirm).toContainText(
    "Não foi possível exibir este relatório.",
  );
  const failed = reportRequests(mockApi).length;
  expect(failed).toBeGreaterThan(0);
  await expect(page.locator(".ant-modal .ant-table-row")).toHaveCount(0);

  mockApi.override("GET /reports/exams/raw", {
    json: { status: "success", data: EXAMS },
  });
  await confirm.getByRole("button", { name: "Tentar novamente" }).click();

  await expect(
    page.locator(".ant-modal .ant-table .ant-table-row"),
  ).toHaveCount(3);
  expect(reportRequests(mockApi).length).toBeGreaterThan(failed);
});
