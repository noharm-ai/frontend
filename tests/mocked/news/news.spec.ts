import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loginWithAuth } from "../support/featureLogin";

/**
 * News (/novidades, src/features/news).
 *
 * The page lists the published news, most recent first, grouped by month on a
 * timeline, each one with its full content always visible. The list comes 5
 * news at a time: the next page loads as the end of the list scrolls into
 * view (infinite scroll). News dated today are flagged as new.
 *
 * The menu badge comes from `recentNews` in the /authenticate response: it is
 * never queried again after login, and visiting the page clears it.
 */

const isoDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const NEWS = [
  {
    id: 3,
    date: isoDaysAgo(0),
    title: "Filtro por setor na conciliação",
    description: "Agora dá para filtrar as conciliações por setor.",
    hasContent: true,
    content:
      "<p>Abra a tela de <strong>conciliações</strong> e use o novo filtro.</p>" +
      '<p>Veja o <a href="/base-de-conhecimento/7">artigo completo</a>.</p>' +
      '<img src="https://example.org/tela.png" onerror="window.__xss = 1">',
  },
  {
    id: 2,
    // yesterday: not new anymore
    date: isoDaysAgo(1),
    title: "Relatório de farmacoeconomia",
    description: null,
    hasContent: true,
    content:
      "<p>Um novo relatório mostra a economia gerada pelas intervenções.</p>",
  },
  {
    id: 1,
    date: isoDaysAgo(80),
    title: "Ajustes de desempenho",
    description: "A priorização carrega mais rápido.",
    hasContent: false,
    content: null,
  },
];

const ok = (data: unknown) => ({ json: { status: "success", data } });

// a page of the list, like the backend: one extra row tells there is a next one
const newsPage = (news: typeof NEWS, offset: number, limit: number) => ({
  news: news.slice(offset, offset + limit),
  hasMore: news.length > offset + limit,
});

// serves the list paginated by ?limit=&offset=; returns the offsets requested
const mockNewsList = (mockApi: MockApi, news: typeof NEWS) => {
  const offsets: number[] = [];

  mockApi.override("GET /news", (route) => {
    const params = new URL(route.request().url()).searchParams;
    const offset = Number(params.get("offset") ?? 0);
    offsets.push(offset);
    return route.fulfill(
      ok(newsPage(news, offset, Number(params.get("limit") ?? 5))),
    );
  });

  return offsets;
};

const mockNews = (mockApi: MockApi) => mockNewsList(mockApi, NEWS);

test.describe("news page", () => {
  test.beforeEach(async ({ mockApi }) => {
    mockNews(mockApi);
  });

  test("the menu opens the in-app news page", async ({ page }) => {
    await page.goto("/priorizacao/pacientes/cards");

    await page.locator("#gtm-lnk-news").click();

    await expect(page).toHaveURL(/\/novidades$/);
    await expect(
      page.getByRole("heading", { name: "O que há de novo na NoHarm" }),
    ).toBeVisible();
  });

  test("lists the news most recent first, flagging the ones from today", async ({
    page,
  }) => {
    await page.goto("/novidades");

    const cards = page.getByTestId("news-card");
    await expect(cards).toHaveCount(3);
    await expect(cards.nth(0)).toContainText(NEWS[0].title);
    await expect(cards.nth(1)).toContainText(NEWS[1].title);
    await expect(cards.nth(2)).toContainText(NEWS[2].title);

    await expect(cards.nth(0).getByText("Novo", { exact: true })).toBeVisible();
    await expect(cards.nth(1).getByText("Novo", { exact: true })).toHaveCount(
      0,
    );
    await expect(cards.nth(2)).toContainText(NEWS[2].description!);
  });

  test("every news shows its whole content, sanitized", async ({ page }) => {
    await page.goto("/novidades");

    const cards = page.getByTestId("news-card");
    await expect(cards.nth(0).getByText("use o novo filtro")).toBeVisible();
    await expect(cards.nth(1).getByText("economia gerada")).toBeVisible();
    // nothing to open or close
    await expect(cards.getByRole("button")).toHaveCount(0);
    expect(await page.evaluate(() => (window as any).__xss)).toBeUndefined();
  });

  test("the list brings the contents: nothing else is fetched", async ({
    page,
    mockApi,
  }) => {
    await page.goto("/novidades");

    await expect(page.getByText("economia gerada")).toBeVisible();
    expect(
      mockApi.requests.filter((r) => r.path.startsWith("/news/")),
    ).toHaveLength(0);
  });

  test("a link to an article stays inside the app", async ({
    page,
    mockApi,
  }) => {
    mockApi.override("GET /knowledge-base/articles/:id", {
      status: 404,
      json: { status: "error", message: "Artigo não encontrado" },
    });
    await page.goto("/novidades");

    await page.getByRole("link", { name: "artigo completo" }).click();

    await expect(page).toHaveURL(/\/base-de-conhecimento\/7$/);
  });

  test("shows an empty state", async ({ page, mockApi }) => {
    mockApi.override("GET /news", ok({ news: [], hasMore: false }));
    await page.goto("/novidades");

    await expect(
      page.getByText("Nenhuma novidade publicada ainda."),
    ).toBeVisible();
  });

  test("a failed load can be retried", async ({ page, mockApi }) => {
    mockApi.override("GET /news", {
      status: 500,
      json: { status: "error", message: "boom" },
    });
    await page.goto("/novidades");

    await expect(
      page.getByText("Não foi possível carregar as novidades."),
    ).toBeVisible();

    mockNewsList(mockApi, NEWS);
    await page.getByRole("button", { name: "Tentar novamente" }).click();

    await expect(page.getByTestId("news-card")).toHaveCount(3);
  });
});

test.describe("pagination", () => {
  // 12 news, one a day: pages of 5, 5 and 2
  const MANY = Array.from({ length: 12 }, (_, i) => ({
    id: 100 - i,
    date: isoDaysAgo(10 + i),
    title: `Novidade de teste ${i + 1}`,
    description: null,
    hasContent: true,
    content: "<p>Parágrafo da novidade.</p>".repeat(8),
  }));

  test("scrolling to the end loads the next pages", async ({
    page,
    mockApi,
  }) => {
    const offsets = mockNewsList(mockApi, MANY);
    await page.goto("/novidades");

    const cards = page.getByTestId("news-card");
    await expect(cards).toHaveCount(5);
    expect(offsets).toEqual([0]);

    // keep scrolling to the end until the last page is in
    await expect(async () => {
      await cards.last().scrollIntoViewIfNeeded();
      await expect(cards).toHaveCount(12, { timeout: 1000 });
    }).toPass();
    await expect(page.getByText("Você viu todas as novidades.")).toBeVisible();
    await expect(page.getByTestId("news-load-more")).toHaveCount(0);

    // in order, without repeating a news
    await expect(cards.nth(11)).toContainText(MANY[11].title);
    expect(offsets).toEqual([0, 5, 10]);
  });

  test("a short list asks for nothing else", async ({ page, mockApi }) => {
    const offsets = mockNewsList(mockApi, MANY.slice(0, 3));
    await page.goto("/novidades");

    await expect(page.getByTestId("news-card")).toHaveCount(3);
    await expect(page.getByTestId("news-load-more")).toHaveCount(0);
    await expect(page.getByText("Você viu todas as novidades.")).toHaveCount(0);
    expect(offsets).toEqual([0]);
  });

  test("a failed page keeps the list and can be retried", async ({
    page,
    mockApi,
  }) => {
    mockApi.override("GET /news", (route) => {
      const offset = Number(
        new URL(route.request().url()).searchParams.get("offset"),
      );
      return offset === 0
        ? route.fulfill(ok(newsPage(MANY, 0, 5)))
        : route.fulfill({
            status: 500,
            json: { status: "error", message: "boom" },
          });
    });
    await page.goto("/novidades");

    const cards = page.getByTestId("news-card");
    await cards.last().scrollIntoViewIfNeeded();
    await expect(
      page.getByText("Não foi possível carregar mais novidades."),
    ).toBeVisible();
    await expect(cards).toHaveCount(5);

    mockNewsList(mockApi, MANY);
    await page
      .getByTestId("news-load-more")
      .getByRole("button", { name: "Tentar novamente" })
      .click();

    await expect(cards).toHaveCount(10);
  });
});

test.describe("menu badge", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("shows the recent news count from login and clears it on visit", async ({
    page,
    mockApi,
  }) => {
    mockNews(mockApi);
    await loginWithAuth(page, mockApi, { recentNews: 2 });

    // the count sits next to the label; a dot marks the icon while the sider
    // is collapsed
    const menuItem = page.locator("#gtm-lnk-news");
    await expect(menuItem.locator(".ant-badge").first()).toBeVisible();
    await expect(menuItem.locator(".ant-badge-count")).toHaveText("2");

    // the collapsed icon's dot sits on the bolt, not up at the item's
    // clipped edge
    const dot = menuItem.locator(".ant-badge-dot");
    await expect(dot).toBeVisible();
    const bolt = (await menuItem.locator(".anticon svg").boundingBox())!;
    const box = (await dot.boundingBox())!;
    expect(box.y + box.height).toBeGreaterThan(bolt.y);
    expect(box.y).toBeLessThan(bolt.y + bolt.height / 2);
    // the count comes from the login only
    expect(mockApi.requests.filter((r) => r.path === "/news")).toHaveLength(0);

    await menuItem.click();
    await expect(page).toHaveURL(/\/novidades$/);
    await expect(menuItem.locator(".ant-badge")).toHaveCount(0);
  });

  test("no badge without recent news", async ({ page, mockApi }) => {
    await loginWithAuth(page, mockApi, { recentNews: 0 });

    await expect(page.locator("#gtm-lnk-news")).toBeVisible();
    await expect(page.locator("#gtm-lnk-news .ant-badge")).toHaveCount(0);
  });
});
