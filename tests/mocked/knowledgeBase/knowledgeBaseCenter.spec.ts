import { test, expect } from "../support/mockApi";

/**
 * Knowledge base page (/base-conhecimento, KnowledgeBaseCenter): every user
 * browses the published articles by topic (the pages they are pinned to),
 * searches them on the server and reads them at a shareable URL.
 */

const summary = (
  id: number,
  title: string,
  path: string[],
  extra: Record<string, unknown> = {},
) => ({
  id,
  title,
  description: `Resumo ${id}`,
  path,
  section: [],
  trainingItems: [],
  link: null,
  hasContent: true,
  createdAt: `2026-0${id % 9 || 1}-01T10:00:00`,
  updatedAt: null,
  ...extra,
});

const articles = [
  summary(1, "Checar uma prescrição", ["Prescrição"]),
  summary(2, "Registrar intervenções", ["Prescrição", "Intervenções"]),
  summary(3, "Relatório de intervenções", ["Relatório: Intervenções"]),
  summary(4, "Manual antigo", [], {
    hasContent: false,
    link: "https://kb.example.com/manual",
  }),
];

const fullArticle = {
  ...articles[1],
  active: true,
  content: "<p>Abra a aba <strong>Intervenções</strong>.</p>",
  trainingLessons: [],
};

test.beforeEach(({ mockApi }) => {
  mockApi.override("POST /knowledge-base/articles", (route) => {
    const body = JSON.parse(route.request().postData() || "{}");
    const data = body.term
      ? articles.filter((a) => a.title.includes("interven"))
      : articles;

    return route.fulfill({ json: { status: "success", data } });
  });
  mockApi.override("GET /knowledge-base/:id", {
    json: { status: "success", data: fullArticle },
  });
});

test("the menu leads to the knowledge base page", async ({ page }) => {
  await page.goto("/priorizacao/pacientes/cards");

  await page.getByRole("menuitem", { name: "Base de Conhecimento" }).click();

  await expect(page).toHaveURL(/\/base-conhecimento$/);
  await expect(
    page.getByRole("heading", { name: "Base de conhecimento", level: 1 }),
  ).toBeVisible();
});

test("articles are grouped by topic", async ({ page }) => {
  await page.goto("/base-conhecimento");

  const topics = page.getByRole("list", { name: "Temas" });
  await expect(
    topics.getByRole("button", { name: /Todos os artigos/ }),
  ).toContainText("4");
  // an article pinned to two pages counts on both
  await expect(
    topics.getByRole("button", { name: /^Prescrição/ }),
  ).toContainText("2");
  await expect(
    topics.getByRole("button", { name: /^Intervenções/ }),
  ).toContainText("1");
  await expect(topics.getByRole("button", { name: /^Outros/ })).toContainText(
    "1",
  );

  await topics.getByRole("button", { name: /^Prescrição/ }).click();

  await expect(page.getByRole("heading", { name: "Prescrição" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Checar uma prescrição" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Registrar intervenções" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Relatório de intervenções" }),
  ).toHaveCount(0);
});

test("search runs on the server", async ({ page, mockApi }) => {
  await page.goto("/base-conhecimento");
  await expect(
    page.getByRole("button", { name: "Checar uma prescrição" }).first(),
  ).toBeVisible();

  await page.getByPlaceholder("Buscar artigos").fill("intervenções");

  await expect(
    page.getByText("2 artigos encontrados para “intervenções”"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Checar uma prescrição" }),
  ).toHaveCount(0);

  const searches = mockApi.requests
    .filter((r) => r.path === "/knowledge-base/articles" && r.postData)
    .map((r) => JSON.parse(r.postData!))
    .filter((body) => body.term);
  // debounced: one request for the whole word
  expect(searches).toEqual([{ term: "intervenções" }]);
});

test("an article opens at its own URL with related articles", async ({
  page,
}) => {
  await page.goto("/base-conhecimento");

  await page
    .getByRole("button", { name: "Registrar intervenções" })
    .first()
    .click();

  await expect(page).toHaveURL(/\/base-conhecimento\/2$/);
  await expect(
    page.getByRole("heading", { name: "Registrar intervenções", level: 1 }),
  ).toBeVisible();
  await expect(page.getByText("Abra a aba")).toBeVisible();

  // related: the other article sharing a page (Prescrição)
  const related = page.locator("section.related");
  await expect(
    related.getByRole("button", { name: "Checar uma prescrição" }),
  ).toBeVisible();
  await expect(
    related.getByRole("button", { name: "Relatório de intervenções" }),
  ).toHaveCount(0);

  // the breadcrumb leads back to the article topic
  await page.getByRole("link", { name: "Base de conhecimento" }).click();
  await expect(page).toHaveURL(/\/base-conhecimento$/);
});

test("a link-only article opens the external page", async ({ page }) => {
  await page.goto("/base-conhecimento");
  await expect(
    page.getByRole("button", { name: "Manual antigo" }).first(),
  ).toBeVisible();

  // the external host does not exist here: record what the page asked for
  await page.evaluate(() => {
    window.open = ((url: string) => {
      (window as any).__opened = url;
      return null;
    }) as typeof window.open;
  });
  await page.getByRole("button", { name: "Manual antigo" }).first().click();

  expect(await page.evaluate(() => (window as any).__opened)).toBe(
    "https://kb.example.com/manual",
  );
  await expect(page).toHaveURL(/\/base-conhecimento$/);
});

test("an unknown or unpublished article shows a way back", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /knowledge-base/:id", {
    status: 400,
    json: {
      status: "error",
      message: "Artigo inexistente",
      code: "errors.invalidRecord",
    },
  });

  await page.goto("/base-conhecimento/99");

  await expect(page.getByText("Artigo não encontrado.")).toBeVisible();
  await page
    .getByRole("button", { name: "Voltar para a base de conhecimento" })
    .click();
  await expect(page).toHaveURL(/\/base-conhecimento$/);
});
