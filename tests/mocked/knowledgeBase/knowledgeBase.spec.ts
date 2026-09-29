import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";

/**
 * Knowledge base (/base-de-conhecimento, src/features/knowledgeBase).
 *
 * The home page lists every published article, filtered by category (the
 * screens an article is pinned to) and searched through the semantic search
 * endpoint, which runs only on enter or on the search button because every
 * call costs an embedding. The article page renders sanitized HTML, turns links to the
 * old external copies into internal routes, and points at related articles
 * and training lessons.
 */

const OLD_KB = "https://kb.example.com/knowledge/article";

const summary = (
  id: number,
  title: string,
  path: string[],
  overrides: Record<string, unknown> = {},
) => ({
  id,
  title,
  description: `Resumo de ${title}`,
  path,
  link: `${OLD_KB}/${id + 100}`,
  hasContent: true,
  updatedAt: "2026-09-01T10:00:00",
  ...overrides,
});

const ARTICLES = [
  summary(1, "Intervenções", ["Prescrição", "Intervenções"]),
  summary(2, "Escore Global", ["Prescrição"]),
  summary(3, "Relatório: Farmacoeconomia", ["Relatórios"]),
  summary(4, "Divisor de Faixas", ["Painel de Medicamentos"], {
    hasContent: false,
  }),
];

const ARTICLE = {
  ...ARTICLES[0],
  content:
    "<h2>Como registrar</h2><p>Veja também o " +
    `<a href="${OLD_KB}/102/">Escore Global</a>.</p>` +
    '<p><a href="https://example.org/fora">link externo</a></p>' +
    '<img src="https://example.org/tela.png" onerror="window.__xss = 1">' +
    '<iframe src="https://evil.example.com/embed"></iframe>' +
    '<iframe src="https://www.youtube-nocookie.com/embed/abc123"></iframe>' +
    "<h2>Desfecho</h2><p>Depois de registrar, acompanhe o desfecho.</p>",
  related: [{ id: 2, title: "Escore Global", description: "Resumo" }],
  relatedLessons: [
    {
      id: 11,
      trainingId: 7,
      title: "Registrando uma intervenção",
      trainingTitle: "Módulo básico",
    },
  ],
};

const RESULTS = [
  {
    ...ARTICLES[0],
    snippet: "Para registrar uma intervenção, clique no ícone ao lado do item.",
    score: 0.62,
  },
  {
    ...ARTICLES[2],
    snippet: "O relatório mostra as intervenções aceitas.",
    score: 0.45,
  },
];

const ok = (data: unknown) => ({ json: { status: "success", data } });

const mockKnowledgeBase = (mockApi: MockApi) => {
  mockApi.override("GET /knowledge-base/articles", ok(ARTICLES));
  mockApi.override("GET /knowledge-base/articles/:id", ok(ARTICLE));
  mockApi.override("POST /knowledge-base/search", ok(RESULTS));
};

const searchCalls = (mockApi: MockApi) =>
  mockApi.requests.filter((r) => r.path === "/knowledge-base/search");

test.beforeEach(async ({ mockApi }) => {
  mockKnowledgeBase(mockApi);
});

test("the menu opens the in-app knowledge base", async ({ page }) => {
  await page.goto("/priorizacao/pacientes/cards");

  await page.locator("#gtm-lnk-knowledgeBase").click();

  await expect(page).toHaveURL(/\/base-de-conhecimento$/);
  await expect(
    page.getByRole("heading", { name: "Como podemos ajudar?" }),
  ).toBeVisible();
});

test("lists articles and filters them by category", async ({ page }) => {
  await page.goto("/base-de-conhecimento");

  await expect(page.getByText("4 artigos")).toBeVisible();
  await expect(page.getByText("Escore Global", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: /^Relatórios/ }).click();

  await expect(page).toHaveURL(/categoria=Relat/);
  await expect(page.getByText("1 artigo", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Relatório: Farmacoeconomia", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Escore Global", { exact: true })).toBeHidden();
});

test("an article without content links to its external copy", async ({
  page,
}) => {
  await page.goto("/base-de-conhecimento");

  const card = page.getByRole("link", { name: /Divisor de Faixas/ });
  await expect(card).toHaveAttribute("href", `${OLD_KB}/104`);
  await expect(card).toHaveAttribute("target", "_blank");
});

test("typing alone never searches, and asks for enter", async ({
  page,
  mockApi,
}) => {
  await page.goto("/base-de-conhecimento");

  await page
    .getByPlaceholder("Ex.: como registrar uma intervenção")
    .fill("registrar intervenção");

  await expect(
    page.getByText(
      "Pressione Enter ou clique em Buscar para ver os resultados.",
    ),
  ).toBeVisible();
  await page.waitForTimeout(900);

  expect(searchCalls(mockApi)).toHaveLength(0);
  await expect(page.getByText("Todos os artigos")).toBeVisible();
});

test("enter runs the search and shows ranked snippets", async ({
  page,
  mockApi,
}) => {
  await page.goto("/base-de-conhecimento");

  const input = page.getByPlaceholder("Ex.: como registrar uma intervenção");
  await input.fill("registrar intervenção");
  await input.press("Enter");

  await expect(
    page.getByRole("heading", {
      name: "Resultados para “registrar intervenção”",
    }),
  ).toBeVisible();

  expect(searchCalls(mockApi)).toHaveLength(1);
  expect(JSON.parse(searchCalls(mockApi)[0].postData!)).toEqual({
    query: "registrar intervenção",
  });

  await expect(page).toHaveURL(/q=registrar/);
  await expect(page.getByText("Muito relevante")).toBeVisible();
  await expect(
    page.locator("mark", { hasText: "intervenção" }).first(),
  ).toBeVisible();
});

test("the search button runs the search", async ({ page, mockApi }) => {
  await page.goto("/base-de-conhecimento");

  await page
    .getByPlaceholder("Ex.: como registrar uma intervenção")
    .fill("registrar intervenção");
  await page.getByRole("button", { name: "Buscar", exact: true }).click();

  await expect(
    page.getByRole("heading", {
      name: "Resultados para “registrar intervenção”",
    }),
  ).toBeVisible();
  expect(searchCalls(mockApi)).toHaveLength(1);
});

test("a suggestion runs the search right away", async ({ page, mockApi }) => {
  await page.goto("/base-de-conhecimento");

  await page.getByRole("button", { name: "escore do medicamento" }).click();

  await expect(
    page.getByRole("heading", {
      name: "Resultados para “escore do medicamento”",
    }),
  ).toBeVisible();
  expect(searchCalls(mockApi)).toHaveLength(1);
});

test("queries shorter than three characters never hit the search", async ({
  page,
  mockApi,
}) => {
  await page.goto("/base-de-conhecimento");

  const input = page.getByPlaceholder("Ex.: como registrar uma intervenção");
  await input.fill("ab");
  await input.press("Enter");

  await expect(
    page.getByText("Digite ao menos 3 caracteres para buscar."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Buscar", exact: true }),
  ).toBeDisabled();

  expect(searchCalls(mockApi)).toHaveLength(0);
  await expect(page.getByText("Todos os artigos")).toBeVisible();
});

test("an empty search says so", async ({ page, mockApi }) => {
  mockApi.override("POST /knowledge-base/search", ok([]));

  await page.goto("/base-de-conhecimento?q=bolo%20de%20chocolate");

  await expect(
    page.getByText("Nenhum artigo encontrado para “bolo de chocolate”"),
  ).toBeVisible();
});

test("a failing search falls back to title matches", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /knowledge-base/search", {
    status: 500,
    json: { status: "error", message: "boom" },
  });

  await page.goto("/base-de-conhecimento?q=escore");

  await expect(
    page.getByText(/busca inteligente está indisponível/),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Escore Global/ })).toBeVisible();
});

test("the article page renders sanitized content with a table of contents", async ({
  page,
}) => {
  await page.goto("/base-de-conhecimento/1");

  await expect(
    page.getByRole("heading", { name: "Intervenções", level: 1 }),
  ).toBeVisible();
  await expect(page.getByText("Atualizado em 01/09/2026")).toBeVisible();

  const toc = page.getByRole("region", { name: "Nesta página" });
  await expect(
    toc.getByRole("button", { name: "Como registrar" }),
  ).toBeVisible();
  await expect(toc.getByRole("button", { name: "Desfecho" })).toBeVisible();

  // only the YouTube embed survives, and no inline handler
  await expect(page.locator("article iframe")).toHaveCount(1);
  await expect(page.locator("article iframe")).toHaveAttribute(
    "src",
    "https://www.youtube-nocookie.com/embed/abc123",
  );
  await expect(page.locator("article img[onerror]")).toHaveCount(0);
  expect(await page.evaluate(() => (window as any).__xss)).toBeUndefined();

  const external = page.getByRole("link", { name: "link externo" });
  await expect(external).toHaveAttribute("target", "_blank");
});

test("links to the old copy of an article stay inside the app", async ({
  page,
  mockApi,
}) => {
  await page.goto("/base-de-conhecimento/1");

  const inline = page
    .locator("article")
    .getByRole("link", { name: "Escore Global" });
  await expect(inline).toHaveAttribute("href", "/base-de-conhecimento/2");

  mockApi.override(
    "GET /knowledge-base/articles/:id",
    ok({
      ...ARTICLE,
      ...ARTICLES[1],
      content: "<p>Conteúdo do escore.</p>",
      related: [],
      relatedLessons: [],
    }),
  );
  await inline.click();

  await expect(page).toHaveURL(/\/base-de-conhecimento\/2$/);
  await expect(
    page.getByRole("heading", { name: "Escore Global", level: 1 }),
  ).toBeVisible();
});

test("a related lesson opens in the training player", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /training/list", ok([]));
  mockApi.override("GET /training/:id/items", ok([]));

  await page.goto("/base-de-conhecimento/1");

  await page
    .getByRole("button", { name: /Registrando uma intervenção/ })
    .click();

  await expect(page).toHaveURL(/\/treinamento\/7\/aula\/11$/);
});

test("the back link returns to the same search", async ({ page }) => {
  await page.goto("/base-de-conhecimento?q=registrar");

  await page
    .getByRole("link", { name: /Intervenções/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/base-de-conhecimento\/1$/);

  await page.getByRole("button", { name: "Base de Conhecimento" }).click();

  await expect(page).toHaveURL(/\/base-de-conhecimento\?q=registrar$/);
  await expect(
    page.getByRole("heading", { name: "Resultados para “registrar”" }),
  ).toBeVisible();
});

test("an unknown article shows a not found state", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /knowledge-base/articles/:id", {
    status: 404,
    json: { status: "error", message: "Artigo não encontrado" },
  });

  await page.goto("/base-de-conhecimento/999");

  await expect(page.getByText("Artigo não encontrado")).toBeVisible();
});
