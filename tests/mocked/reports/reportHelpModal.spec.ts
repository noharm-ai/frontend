import { gzipSync } from "node:zlib";
import dayjs from "dayjs";

import { test, expect, API_URL } from "../support/mockApi";

/**
 * Help modal of the cached reports (src/features/reports/<Report>/Help).
 *
 * The "?" button next to the page title opens a modal that shows when the
 * cached file was updated, the period the file covers (`header.date -
 * header.dateRange days` to `header.date - 1 day`) and a button that opens
 * the report's knowledge base article in-app.
 */

const REPORTS = [
  {
    name: "Pacientes-Dia",
    url: "/relatorios/pacientes-dia",
    report: "PATIENT_DAY",
    kb: "reports.patientDay.title",
    text: "Pacientes por Dia",
    article: 41,
  },
  {
    name: "Prescrições",
    url: "/relatorios/prescricoes",
    report: "PRESCRIPTION",
    kb: "reports.prescription.title",
    text: "Prescrições",
    article: 42,
  },
  {
    name: "Intervenções",
    url: "/relatorios/intervencoes",
    report: "INTERVENTION",
    kb: "reports.intervention.title",
    text: "Intervenções",
    article: 43,
  },
  {
    name: "Auditoria de Prescrições",
    url: "/relatorios/audit",
    report: "PRESCRIPTION_AUDIT",
    kb: "reports.prescriptionAudit.title",
    text: "checagens e deschecagens",
    article: 44,
  },
  {
    name: "Farmacoeconomia",
    url: "/relatorios/economia",
    report: "ECONOMY",
    kb: "reports.economy.title",
    text: "economia calculada",
    article: 45,
  },
];

const TODAY = dayjs().startOf("day");
const UPDATED_AT = TODAY.hour(3).minute(15);
const DATE_RANGE = 30;

const ok = (data: unknown) => ({ json: { status: "success", data } });

const mockCachedReport = (mockApi: any, report: string) => {
  const cachePath = `/cache/${report.toLowerCase()}.json.gz`;

  mockApi.override(
    `GET /reports/general/${report}`,
    ok({ cached: true, url: `${API_URL}${cachePath}`, availableReports: [] }),
  );

  const file = {
    header: {
      date: TODAY.format("YYYY-MM-DDTHH:mm:ss"),
      dateRange: DATE_RANGE,
      updatedAt: UPDATED_AT.format("YYYY-MM-DDTHH:mm:ss"),
      version: "1.0",
      count: 0,
      type: "current",
    },
    body: [],
  };

  mockApi.override(`GET ${cachePath}`, (route: any) =>
    route.fulfill({
      status: 200,
      contentType: "application/octet-stream",
      body: gzipSync(Buffer.from(JSON.stringify(file))),
    }),
  );
};

const mockArticle = (mockApi: any, id: number) => {
  mockApi.override(
    "GET /knowledge-base/articles/:id",
    ok({
      id,
      title: "Artigo de Teste",
      description: "Resumo do artigo de teste",
      path: ["Relatórios"],
      link: null,
      hasContent: true,
      updatedAt: "2026-09-01T10:00:00",
      content: "<p>Conteúdo do artigo de teste.</p>",
      related: [],
      relatedLessons: [],
    }),
  );
  mockApi.override("POST /support/knowledge-base-articles", ok([]));
};

const helpButton = (page: any, kb: string) =>
  page.locator(`[data-kb="${kb}"]`).getByRole("button");

for (const r of REPORTS) {
  test.describe(`${r.name} report`, () => {
    test("the help shows the cached file's dates and opens the article", async ({
      page,
      mockApi,
    }) => {
      mockCachedReport(mockApi, r.report);
      mockArticle(mockApi, r.article);
      await page.goto(r.url);

      // the button stops loading once the file is read
      const button = helpButton(page, r.kb);
      await expect(button).not.toHaveClass(/ant-btn-loading/, {
        timeout: 15000,
      });
      await button.click();

      const modal = page.locator(".ant-modal").filter({
        hasText: "Informações",
      });
      await expect(modal).toBeVisible();
      await expect(modal).toContainText(r.text);
      await expect(modal).toContainText(
        `Atualizado em: ${UPDATED_AT.format("DD/MM/YY HH:mm")}`,
      );
      await expect(modal).toContainText(
        `${TODAY.subtract(DATE_RANGE, "day").format("DD/MM/YY")} até ${TODAY.subtract(1, "day").format("DD/MM/YY")}`,
      );

      await modal.getByRole("button", { name: "Base de Conhecimento" }).click();
      await expect
        .poll(() =>
          mockApi.requests.some(
            (req: any) => req.path === `/knowledge-base/articles/${r.article}`,
          ),
        )
        .toBe(true);
      await expect(
        page.getByText("Conteúdo do artigo de teste."),
      ).toBeVisible();
    });
  });
}

test("the help still opens when the report request fails", async ({
  page,
  mockApi,
}) => {
  // the slice keeps its initial (null) date and range
  mockApi.override("GET /reports/general/PRESCRIPTION", {
    status: 500,
    json: { status: "error", message: "boom" },
  });
  mockArticle(mockApi, 42);
  await page.goto("/relatorios/prescricoes");

  // the dev server runs React.StrictMode, which fetches (and so opens the
  // error modal) twice
  const errorModal = page
    .getByRole("dialog")
    .filter({ hasText: "Não foi possível exibir este relatório." });
  await expect(errorModal.first()).toBeVisible({ timeout: 15000 });
  for (let open = await errorModal.count(); open > 0; open--) {
    await errorModal.last().getByRole("button", { name: "Fechar" }).click();
    await expect(errorModal).toHaveCount(open - 1);
  }

  await helpButton(page, "reports.prescription.title").click();

  const modal = page.locator(".ant-modal").filter({ hasText: "Informações" });
  await expect(modal).toBeVisible();
  await expect(modal).toContainText("Prescrições");
  await expect(modal).toContainText("O período disponibilizado para consulta");

  // closing it goes through setHelpModal(false)
  await modal.locator(".ant-modal-close").click();
  await expect(modal).toBeHidden();
});
