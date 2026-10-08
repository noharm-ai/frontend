import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";
import { loginWithPermissions } from "../support/featureLogin";

/**
 * Knowledge base icon (src/features/knowledgeBase/KnowledgeBaseIcon).
 *
 * Shows the knowledge base articles pinned to the icon itself, among the help
 * mode's elements. On the prioritization lists it sits in the page title, with
 * an anchor of its own for each prioritization type.
 */

const PRESCRIPTIONS_PAGE = "/priorizacao/prescricoes";
const PATIENTS_PAGE = "/priorizacao/pacientes";
const PRESCRIPTION_ICON = '[data-kb="prioritization.prescription.articles"]';
const PATIENT_ICON = '[data-kb="prioritization.patient.articles"]';
const CARDS_PAGE = "/priorizacao/pacientes/cards";
const CARDS_ICON = '[data-kb="prioritization.cards.articles"]';

const article = (id: number, title: string) => ({
  id,
  title,
  description: `Resumo de ${title}`,
});

const ARTICLES = [
  article(1, "Priorizando prescrições"),
  article(2, "Priorizando pacientes"),
  article(3, "Escore Global"),
].map((summary) => ({
  ...summary,
  path: ["Priorização"],
  link: null,
  hasContent: true,
  updatedAt: "2026-09-01T10:00:00",
}));

const ELEMENTS = [
  {
    page: PRESCRIPTIONS_PAGE,
    selector: PRESCRIPTION_ICON,
    label: "Priorização por Prescrições",
    articles: [article(1, "Priorizando prescrições")],
  },
  {
    page: PATIENTS_PAGE,
    selector: PATIENT_ICON,
    label: "Priorização por Pacientes",
    articles: [
      article(2, "Priorizando pacientes"),
      article(3, "Escore Global"),
    ],
  },
  {
    page: CARDS_PAGE,
    selector: CARDS_ICON,
    label: "Priorização por Pacientes",
    articles: [article(3, "Escore Global")],
  },
];

const ok = (data: unknown) => ({ json: { status: "success", data } });

/**
 * Serves the elements of the page asked for, recording each request's page
 */
const mockElements = (
  mockApi: MockApi,
  elements: typeof ELEMENTS = ELEMENTS,
) => {
  const pages: string[] = [];

  mockApi.override("GET /knowledge-base/elements", async (route) => {
    const page = new URL(route.request().url()).searchParams.get("page") ?? "";
    pages.push(page);
    await route.fulfill(
      ok(elements.filter((item) => item.page === page || item.page === "*")),
    );
  });

  return pages;
};

const articleModal = (page: Page) =>
  page.getByText("O conteúdo do artigo.", { exact: true });

test.beforeEach(async ({ mockApi }) => {
  mockApi.override("GET /knowledge-base/articles", ok(ARTICLES));
  // the article asked for, whichever it is
  mockApi.override("GET /knowledge-base/articles/:id", async (route) => {
    const id = Number(new URL(route.request().url()).pathname.split("/").pop());
    await route.fulfill(
      ok({
        ...ARTICLES.find((item) => item.id === id),
        content: "<p>O conteúdo do artigo.</p>",
        related: [],
        relatedLessons: [],
      }),
    );
  });
});

test("asks for nothing until clicked", async ({ page, mockApi }) => {
  const pages = mockElements(mockApi);
  await page.goto(PRESCRIPTIONS_PAGE);

  await expect(page.locator(PRESCRIPTION_ICON)).toBeVisible();
  await page.waitForTimeout(500);
  expect(pages).toEqual([]);
});

test("a single article is listed, not opened", async ({ page, mockApi }) => {
  mockElements(mockApi);
  await page.goto(PRESCRIPTIONS_PAGE);

  await page.locator(PRESCRIPTION_ICON).click();
  await expect(page.locator(".kb-article strong")).toHaveText([
    "Priorizando prescrições",
  ]);
  await expect(articleModal(page)).toHaveCount(0);

  await page.locator(".kb-article").click();
  await expect(articleModal(page)).toBeVisible();
});

test("switches the help mode on and off", async ({ page, mockApi }) => {
  mockElements(mockApi);
  await page.goto(PRESCRIPTIONS_PAGE);

  await page.locator(PRESCRIPTION_ICON).click();
  const helpMode = page.getByRole("switch", { name: "Modo ajuda" });
  await expect(helpMode).not.toBeChecked();
  await helpMode.click();

  // the popover steps aside for the highlights, the icon's own among them
  await expect(page.locator(".kb-article").first()).toBeHidden();
  await expect(
    page.locator(`[data-help-selector='${PRESCRIPTION_ICON}']`),
  ).toHaveCount(1);
  await expect(
    page.locator("#gtm-btn-header-help .ant-badge-dot"),
  ).toBeVisible();

  await page.getByRole("button", { name: "Sair do modo ajuda" }).click();
  await expect(
    page.locator(`[data-help-selector='${PRESCRIPTION_ICON}']`),
  ).toHaveCount(0);
  await page.locator(PRESCRIPTION_ICON).click();
  await expect(
    page.getByRole("switch", { name: "Modo ajuda" }),
  ).not.toBeChecked();
});

test("each prioritization type has its own articles", async ({
  page,
  mockApi,
}) => {
  const pages = mockElements(mockApi);
  await page.goto(PATIENTS_PAGE);

  // only the patients' icon is on the page
  await expect(page.locator(PRESCRIPTION_ICON)).toHaveCount(0);
  await page.locator(PATIENT_ICON).click();

  const items = page.locator(".kb-article strong");
  await expect(items).toHaveText(["Priorizando pacientes", "Escore Global"]);
  expect(pages).toEqual([PATIENTS_PAGE]);

  // the icon toggles the list, which comes back from the cache
  await page.locator(PATIENT_ICON).click();
  await expect(items.first()).toBeHidden();
  await page.locator(PATIENT_ICON).click();
  await items.first().click();
  await expect(articleModal(page)).toBeVisible();
  expect(pages).toEqual([PATIENTS_PAGE]);
});

test("the patients' cards have articles of their own", async ({
  page,
  mockApi,
}) => {
  const pages = mockElements(mockApi);
  await page.goto(CARDS_PAGE);

  // not the list's icon, though both prioritize patients
  await expect(page.locator(PATIENT_ICON)).toHaveCount(0);
  await page.locator(CARDS_ICON).click();

  await expect(page.locator(".kb-article strong")).toHaveText([
    "Escore Global",
  ]);
  expect(pages).toEqual([CARDS_PAGE]);
});

test("says so when nothing is pinned yet", async ({ page, mockApi }) => {
  mockElements(mockApi, []);
  await page.goto(PRESCRIPTIONS_PAGE);

  await page.locator(PRESCRIPTION_ICON).click();
  await expect(
    page.getByText("Nenhum artigo vinculado a este item ainda."),
  ).toBeVisible();
  // only curators link articles
  await expect(
    page.getByRole("button", { name: "Vincular artigos" }),
  ).toHaveCount(0);
});

test.describe("curator", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("links articles to the type's icon", async ({ page, mockApi }) => {
    mockElements(mockApi, []);
    mockApi.override("PUT /knowledge-base/elements", ok(ELEMENTS[1]));
    const auth = loadFixture<{ permissions: string[] }>(
      "auth/authenticate.json",
    );
    await loginWithPermissions(page, mockApi, [
      ...auth.permissions,
      "WRITE_HELP_TEXT",
    ]);
    await page.goto(PATIENTS_PAGE);

    await page.locator(PATIENT_ICON).click();
    await page.getByRole("button", { name: "Vincular artigos" }).click();

    // the help mode's editor, on the icon's own anchor
    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText("Adicionar ajuda ao elemento");
    await expect(dialog).toContainText(PATIENT_ICON);
    await expect(dialog.getByRole("textbox")).toHaveValue(
      "Priorização por Pacientes",
    );

    await dialog.locator(".ant-select").last().click();
    await page
      .getByText("Priorizando pacientes", { exact: true })
      .last()
      .click();
    await dialog.getByRole("button", { name: "Salvar" }).click();

    await expect
      .poll(() =>
        mockApi.requests
          .filter(
            (r) => r.method === "PUT" && r.path === "/knowledge-base/elements",
          )
          .map((r) => JSON.parse(r.postData ?? "{}")),
      )
      .toEqual([
        {
          page: PATIENTS_PAGE,
          selector: PATIENT_ICON,
          label: "Priorização por Pacientes",
          articleIds: [2],
        },
      ]);
  });
});

test("page titles carry an icon of their own", async ({ page, mockApi }) => {
  // the screens' own data, empty: only their titles matter here
  for (const key of [
    "POST /intervention/search",
    "GET /intervention/reasons",
    "GET /users",
    "POST /admin/exam/list",
    "POST /admin/tag/list",
    "GET /training/list",
  ]) {
    mockApi.override(key, ok([]));
  }

  const screens: [string, string][] = [
    ["/intervencoes", "interventions.articles"],
    ["/configuracoes/administracao", "userAdmin.articles"],
    ["/admin/exames", "admin.exams.articles"],
    ["/admin/tags", "admin.tags.articles"],
    ["/painel-medicamentos", "drugs.articles"],
    ["/configuracoes/usuario", "userProfile.articles"],
    ["/treinamento", "training.articles"],
  ];

  for (const [url, anchor] of screens) {
    await page.goto(url);

    await expect(
      page.locator(".page-header-title").locator(`[data-kb="${anchor}"]`),
      `${anchor} on ${url}`,
    ).toBeVisible({ timeout: 15000 });
  }
});
