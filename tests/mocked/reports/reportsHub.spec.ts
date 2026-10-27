import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";

/**
 * Reports hub (/relatorios, src/features/reports/Reports.jsx).
 *
 * GET /reports/config lists what the schema enabled: `internal` holds the
 * codes of the built-in reports, `external` the embedded dashboards and
 * `custom` the custom reports, whose files are processed on demand and
 * downloaded from the DownloadModal.
 */

const PAGE_URL = "/relatorios";

// ReportStatusEnum
const PROCESSED = 1;
const PROCESSING = 2;
const ERROR = 3;

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60 * 1000).toISOString().slice(0, 19);

const customReport = (overrides: Record<string, unknown> = {}) => ({
  id: 7,
  name: "Relatório Teste",
  description: "Descrição do relatório teste",
  active: true,
  status: PROCESSED,
  processed_at: minutesAgo(3 * 60),
  processed_by_name: "Fulano Beltrano",
  error_message: null,
  available_reports: [
    {
      name: "2026-01-01",
      filename: "20260101.gz",
      ready: true,
      updateAt: minutesAgo(3 * 60),
    },
  ],
  ...overrides,
});

const config = (data: Record<string, unknown> = {}) => ({
  json: {
    status: "success",
    data: { internal: [], external: [], custom: [], ...data },
  },
});

const reportCards = (page: Page) => page.locator(".gtm-report-item");

test("lists only the internal reports enabled for the schema", async ({
  page,
  mockApi,
}) => {
  mockApi.override(
    "GET /reports/config",
    config({ internal: ["PATIENT_DAY", "INTERVENTION"] }),
  );

  await page.goto(PAGE_URL);

  await expect(
    page.getByRole("heading", { name: "Relatórios", level: 1 }),
  ).toBeVisible();
  await expect(reportCards(page)).toHaveCount(2);
  await expect(reportCards(page).nth(0)).toContainText("Pacientes-Dia");
  await expect(reportCards(page).nth(1)).toContainText("Intervenções");
  await expect(page.getByText("Auditoria")).toHaveCount(0);
  await expect(page.getByText("Farmacoeconomia (Beta)")).toHaveCount(0);

  // only maintainers see the disabled ones, flagged with a warning
  await expect(
    page.getByText("Este relatório não está habilitado para os usuários."),
  ).toHaveCount(0);
});

test.describe("as maintainer", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("disabled internal reports are shown with a warning", async ({
    page,
    mockApi,
  }) => {
    mockApi.override("GET /reports/config", config({ internal: ["ECONOMY"] }));
    await loginWithPermissions(page, mockApi, [
      "READ_BASIC_FEATURES",
      "READ_PRESCRIPTION",
      "READ_REPORTS",
      "MAINTAINER",
    ]);

    await page.goto(PAGE_URL);

    // all six internal reports render
    await expect(reportCards(page)).toHaveCount(6);

    const economy = reportCards(page).filter({
      hasText: "Farmacoeconomia (Beta)",
    });
    await expect(economy).toBeVisible();
    await expect(
      economy.getByText("Este relatório não está habilitado"),
    ).toHaveCount(0);

    const audit = reportCards(page).filter({ hasText: "Auditoria" });
    await expect(
      audit.getByText(
        "Este relatório não está habilitado para os usuários. Acesse Curadoria->Relatórios para ativá-lo.",
      ),
    ).toBeVisible();
  });
});

test("shows the empty state when nothing is enabled", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /reports/config", config());

  await page.goto(PAGE_URL);

  await expect(page.getByText("Nenhum relatório disponível")).toBeVisible();
  await expect(reportCards(page)).toHaveCount(0);

  await page.getByRole("tab", { name: "Relatórios Customizados" }).click();
  await expect(
    page.getByText("Nenhum relatório customizado disponível."),
  ).toBeVisible();
});

test("warns when the config can't be loaded", async ({ page, mockApi }) => {
  mockApi.override("GET /reports/config", {
    status: 500,
    json: { status: "error", message: "boom" },
  });

  await page.goto(PAGE_URL);

  await expect(page.locator(".ant-notification-notice-error")).toBeVisible();
  await expect(page.getByText("Nenhum relatório disponível")).toBeVisible();
});

test("opens an external dashboard embedded and goes back to the list", async ({
  page,
  mockApi,
}) => {
  mockApi.override(
    "GET /reports/config",
    config({
      external: [
        {
          title: "Painel Externo",
          description: "Indicadores do painel externo",
          link: "about:blank",
          height: 600,
        },
      ],
    }),
  );

  await page.goto(PAGE_URL);

  await reportCards(page).filter({ hasText: "Painel Externo" }).click();

  await expect(
    page.getByRole("heading", { name: "Painel Externo", level: 1 }),
  ).toBeVisible();
  await expect(page.getByText("Indicadores do painel externo")).toBeVisible();
  const iframe = page.locator("iframe.dashboard-iframe");
  await expect(iframe).toHaveAttribute("src", "about:blank");
  await expect(iframe).toHaveAttribute("height", "600");
  await expect(page.getByRole("tab")).toHaveCount(0);

  await page.getByRole("button", { name: "Ver todos relatórios" }).click();

  await expect(
    page.getByRole("heading", { name: "Relatórios", level: 1 }),
  ).toBeVisible();
  await expect(page.locator("iframe.dashboard-iframe")).toHaveCount(0);
  await expect(reportCards(page)).toHaveCount(1);
});

test.describe("internal report navigation", () => {
  // the target report page loads its own data, out of scope here
  test.use({ strictMocks: false });

  test("clicking an internal report opens its page", async ({
    page,
    mockApi,
  }) => {
    mockApi.override(
      "GET /reports/config",
      config({ internal: ["PRESCRIPTION_AUDIT"] }),
    );

    await page.goto(PAGE_URL);
    await reportCards(page).filter({ hasText: "Auditoria" }).click();

    await expect(page).toHaveURL(/\/relatorios\/audit$/);
  });
});

test.describe("custom reports", () => {
  /** Opens the DownloadModal and waits out its zoom motion, which swallows clicks. */
  const openCard = async (page: Page, name: string) => {
    await page.getByRole("tabpanel").getByRole("heading", { name }).click();
    await expect(page.locator(".ant-modal")).toBeVisible();
    await expect(page.locator(".ant-modal")).not.toHaveClass(/ant-zoom/);
  };

  const openCustomTab = async (page: Page) => {
    await page.goto(PAGE_URL);
    await page.getByRole("tab", { name: "Relatórios Customizados" }).click();
  };

  test("lists the custom reports, flagging the inactive ones", async ({
    page,
    mockApi,
  }) => {
    mockApi.override(
      "GET /reports/config",
      config({
        custom: [
          customReport(),
          customReport({ id: 8, name: "Relatório Inativo", active: false }),
        ],
      }),
    );

    await openCustomTab(page);

    const panel = page.getByRole("tabpanel");
    await expect(
      panel.getByRole("heading", { name: "Relatório Teste" }),
    ).toBeVisible();
    await expect(
      panel.getByRole("heading", { name: "Relatório Inativo" }),
    ).toBeVisible();
    await expect(
      panel.getByText("Este relatório não está ativo para os usuários."),
    ).toHaveCount(1);
  });

  test("the download modal lists the processed files", async ({
    page,
    mockApi,
  }) => {
    mockApi.override(
      "GET /reports/config",
      config({ custom: [customReport()] }),
    );

    await openCustomTab(page);
    await openCard(page, "Relatório Teste");

    const modal = page.getByRole("dialog");
    await expect(
      modal.getByRole("heading", { name: "Relatório Teste" }),
    ).toBeVisible();
    await expect(modal.getByText("01/01/2026")).toBeVisible();
    await expect(modal.getByText(/^Processado em /)).toBeVisible();
    await expect(
      modal.getByRole("button", { name: "Reprocessar" }),
    ).toBeEnabled();
    await expect(
      modal.getByText(/Último processamento por Fulano Beltrano em/),
    ).toBeVisible();

    await modal.locator(".ant-modal-close").click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("processing a report refreshes the list and shows progress", async ({
    page,
    mockApi,
  }) => {
    const neverProcessed = customReport({
      status: 0,
      processed_at: null,
      processed_by_name: null,
      available_reports: [
        { name: "2026-01-01", filename: "20260101.gz", ready: false },
      ],
    });
    mockApi.override(
      "GET /reports/config",
      config({ custom: [neverProcessed] }),
    );
    mockApi.override("GET /reports/custom/process/:id", {
      json: { status: "success", data: null },
    });
    mockApi.override("GET /reports/custom/list", {
      json: {
        status: "success",
        data: [{ ...neverProcessed, status: PROCESSING }],
      },
    });

    await openCustomTab(page);
    await openCard(page, "Relatório Teste");

    const modal = page.getByRole("dialog");
    await expect(modal.getByText("Processamento pendente")).toBeVisible();
    await modal.getByRole("button", { name: "Processar" }).click();

    await expect(modal.getByText("Processando relatório...")).toBeVisible();
    await expect(
      modal.getByRole("button", { name: "Processando" }),
    ).toBeDisabled();

    expect(
      mockApi.requests.some((r) => r.path === "/reports/custom/process/7"),
    ).toBe(true);
    expect(
      mockApi.requests.some((r) => r.path === "/reports/custom/list"),
    ).toBe(true);
  });

  test("a report processed less than 10 minutes ago can't be reprocessed", async ({
    page,
    mockApi,
  }) => {
    mockApi.override(
      "GET /reports/config",
      config({ custom: [customReport({ processed_at: minutesAgo(5) })] }),
    );

    await openCustomTab(page);
    await openCard(page, "Relatório Teste");

    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Reprocessar" })
      .click();

    const warning = page.locator(".ant-modal-confirm-warning");
    await expect(warning.locator(".ant-modal-confirm-title")).toHaveText(
      "Processamento recente",
    );
    await warning.getByRole("button", { name: "Ok" }).click();
    await expect(warning).toHaveCount(0);

    expect(
      mockApi.requests.some((r) =>
        r.path.startsWith("/reports/custom/process/"),
      ),
    ).toBe(false);
  });

  test("shows the processing error", async ({ page, mockApi }) => {
    mockApi.override(
      "GET /reports/config",
      config({
        custom: [
          customReport({
            status: ERROR,
            error_message: "Falha na consulta do relatório",
          }),
        ],
      }),
    );

    await openCustomTab(page);
    await openCard(page, "Relatório Teste");

    const modal = page.getByRole("dialog");
    await expect(
      modal.getByText("Ocorreu um erro ao processar este arquivo"),
    ).toBeVisible();
    await expect(
      modal.getByText("Falha na consulta do relatório"),
    ).toBeVisible();
  });
});
