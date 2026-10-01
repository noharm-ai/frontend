import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loginWithAuth } from "../support/featureLogin";

/**
 * News (/novidades, src/features/news).
 *
 * The page lists the published news, most recent first, grouped by month on a
 * timeline. A record's HTML content is only fetched when it is opened, and the
 * most recent one starts open. News from the last 3 days are flagged as new.
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
    date: isoDaysAgo(1),
    title: "Filtro por setor na conciliação",
    description: "Agora dá para filtrar as conciliações por setor.",
    hasContent: true,
  },
  {
    id: 2,
    date: isoDaysAgo(20),
    title: "Relatório de farmacoeconomia",
    description: null,
    hasContent: true,
  },
  {
    id: 1,
    date: isoDaysAgo(80),
    title: "Ajustes de desempenho",
    description: "A priorização carrega mais rápido.",
    hasContent: false,
  },
];

const CONTENT: Record<number, string> = {
  3:
    "<p>Abra a tela de <strong>conciliações</strong> e use o novo filtro.</p>" +
    '<p>Veja o <a href="/base-de-conhecimento/7">artigo completo</a>.</p>' +
    '<img src="https://example.org/tela.png" onerror="window.__xss = 1">',
  2: "<p>Um novo relatório mostra a economia gerada pelas intervenções.</p>",
};

const ok = (data: unknown) => ({ json: { status: "success", data } });

const mockNews = (mockApi: MockApi) => {
  mockApi.override("GET /news", ok(NEWS));
  mockApi.override("GET /news/:id", (route) => {
    const id = Number(new URL(route.request().url()).pathname.split("/").pop());
    const summary = NEWS.find((n) => n.id === id);
    return route.fulfill({
      json: {
        status: "success",
        data: { ...summary, content: CONTENT[id] ?? null },
      },
    });
  });
};

const contentCalls = (mockApi: MockApi) =>
  mockApi.requests.filter((r) => /^\/news\/\d+$/.test(r.path));

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

  test("lists the news most recent first, flagging the recent ones", async ({
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

  test("the most recent news starts open, with sanitized content", async ({
    page,
    mockApi,
  }) => {
    await page.goto("/novidades");

    const latest = page.getByTestId("news-card").nth(0);
    await expect(latest.getByText("use o novo filtro")).toBeVisible();
    await expect(
      latest.getByRole("button", { name: "Recolher" }),
    ).toHaveAttribute("aria-expanded", "true");

    // only the open record was fetched
    expect(contentCalls(mockApi).map((r) => r.path)).toEqual(["/news/3"]);
    expect(await page.evaluate(() => (window as any).__xss)).toBeUndefined();
  });

  test("opening another news fetches its content once", async ({
    page,
    mockApi,
  }) => {
    await page.goto("/novidades");

    const second = page.getByTestId("news-card").nth(1);
    await second.getByRole("button", { name: "Ler novidade" }).click();
    await expect(second.getByText("economia gerada")).toBeVisible();

    // one news open at a time
    await expect(page.getByText("use o novo filtro")).toBeHidden();

    await second.getByRole("button", { name: "Recolher" }).click();
    await expect(second.getByText("economia gerada")).toBeHidden();
    await second.getByRole("button", { name: "Ler novidade" }).click();
    await expect(second.getByText("economia gerada")).toBeVisible();

    expect(
      contentCalls(mockApi).filter((r) => r.path === "/news/2"),
    ).toHaveLength(1);
  });

  test("a news without content has nothing to open", async ({ page }) => {
    await page.goto("/novidades");

    const last = page.getByTestId("news-card").nth(2);
    await expect(last).toContainText(NEWS[2].title);
    await expect(last.getByRole("button")).toHaveCount(0);
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
    mockApi.override("GET /news", ok([]));
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

    mockApi.override("GET /news", ok(NEWS));
    await page.getByRole("button", { name: "Tentar novamente" }).click();

    await expect(page.getByTestId("news-card")).toHaveCount(3);
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
