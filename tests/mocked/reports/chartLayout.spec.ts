import { gzipSync } from "node:zlib";

import { test, expect, API_URL } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";

/**
 * Arranging the charts of a custom report: reordering them with the arrows or
 * by dragging a chart by its title (the order is the order of the saved graphs
 * array), and resizing them from the corner.
 */

const READ_PERMISSIONS = [
  "READ_BASIC_FEATURES",
  "READ_PRESCRIPTION",
  "READ_REPORTS",
  "READ_CUSTOM_REPORTS",
];

const WRITE_PERMISSIONS = [...READ_PERMISSIONS, "WRITE_CUSTOM_REPORTS_GRAPHS"];

const REPORT_URL = "/relatorios/arquivo/CUSTOM/7/20260101";
const CACHE_URL = `${API_URL}/cache/report.json.gz`;

const ROWS = [
  { setor: "UTI", leito: "A1", dose: 10 },
  { setor: "ENF", leito: "B2", dose: 20 },
  { setor: "UTI", leito: "C3", dose: 15 },
];

const chart = (id: string, title: string, xKey: string) => ({
  id,
  type: "bar",
  xKeys: [xKey],
  yKeys: ["__count__"],
  title,
  width: "half",
  aggregation: "count",
});

const CHARTS = [
  chart("c-1", "Por setor", "setor"),
  chart("c-2", "Por leito", "leito"),
  chart("c-3", "Por dose", "dose"),
];

const ok = (data: unknown) => ({ json: { status: "success", data } });

const installReportHandlers = (mockApi: {
  override: (key: string, handler: any) => void;
}) => {
  mockApi.override(
    "GET /reports/general/CUSTOM",
    ok({
      cached: true,
      title: "Relatorio de teste",
      url: CACHE_URL,
      graphs: JSON.stringify(CHARTS),
    }),
  );

  mockApi.override("GET /cache/report.json.gz", (route: any) =>
    route.fulfill({
      status: 200,
      contentType: "application/octet-stream",
      body: gzipSync(Buffer.from(JSON.stringify(ROWS))),
    }),
  );

  mockApi.override("PATCH /admin/report/:id/graphs", ok({ id: 7 }));
};

const chartCard = (page: any, title: string) =>
  page.locator(".ant-card-type-inner").filter({
    has: page.locator(".ant-card-head-title", { hasText: title }),
  });

const chartTitles = (page: any) =>
  page
    .locator(".ant-card-type-inner .ant-card-head-title")
    .filter({ hasNotText: "Adicionar novo gráfico" });

const savedCharts = async (page: any, mockApi: any) => {
  await page.getByRole("button", { name: "save", exact: true }).click();
  await expect(page.getByText("Gráficos salvos com sucesso.")).toBeVisible();

  const saved = mockApi.requests.find(
    (request: any) =>
      request.method === "PATCH" && request.path.endsWith("/graphs"),
  );
  return JSON.parse(JSON.parse(saved!.postData!).graphs);
};

const savedTitles = async (page: any, mockApi: any) =>
  (await savedCharts(page, mockApi)).map(
    (saved: { title: string }) => saved.title,
  );

/** Presses the corner of a chart and moves it by (dx, dy), still held. */
const grabCorner = async (page: any, title: string, dx: number, dy: number) => {
  const corner = chartCard(page, title)
    .locator("..")
    .getByTitle("Arraste para redimensionar");
  await corner.scrollIntoViewIfNeeded();
  const box = await corner.boundingBox();
  const x = box!.x + box!.width / 2;
  const y = box!.y + box!.height / 2;

  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 5 });
};

test.use({ storageState: { cookies: [], origins: [] } });

test("the arrows move a chart one place and the order is saved", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi);
  await loginWithPermissions(page, mockApi, WRITE_PERMISSIONS);
  await page.goto(REPORT_URL);

  const first = chartCard(page, "Por setor");
  await expect(first).toBeVisible({ timeout: 15000 });

  // the edges cannot move further out
  await expect(
    first.getByRole("button", { name: "Mover para antes" }),
  ).toBeDisabled();
  await expect(
    chartCard(page, "Por dose").getByRole("button", {
      name: "Mover para depois",
    }),
  ).toBeDisabled();

  await first.getByRole("button", { name: "Mover para depois" }).click();

  await expect(chartTitles(page)).toHaveText([
    "Por leito",
    "Por setor",
    "Por dose",
  ]);
  await expect(page.getByText("Alterações não salvas")).toBeVisible();

  expect(await savedTitles(page, mockApi)).toEqual([
    "Por leito",
    "Por setor",
    "Por dose",
  ]);
});

test("dragging a chart by its title drops it beside another", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi);
  await loginWithPermissions(page, mockApi, WRITE_PERMISSIONS);
  // both rows on screen: scrolling mid-drag would cancel it
  await page.setViewportSize({ width: 1280, height: 1600 });
  await page.goto(REPORT_URL);

  await expect(chartCard(page, "Por dose")).toBeVisible({ timeout: 15000 });

  // onto the left half of the first chart: lands before it. Stepped moves,
  // since a single-jump dragTo ends the drag before the drop is accepted.
  const target = await chartCard(page, "Por setor").boundingBox();
  await chartCard(page, "Por dose").locator("[draggable=true]").hover();
  await page.mouse.down();
  await page.mouse.move(target!.x + 20, target!.y + 120, { steps: 5 });
  await page.mouse.move(target!.x + 22, target!.y + 122, { steps: 2 });
  await page.mouse.up();

  await expect(chartTitles(page)).toHaveText([
    "Por dose",
    "Por setor",
    "Por leito",
  ]);

  expect(await savedTitles(page, mockApi)).toEqual([
    "Por dose",
    "Por setor",
    "Por leito",
  ]);
});

test("a viewer without the graphs permission cannot reorder", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi);
  await loginWithPermissions(page, mockApi, READ_PERMISSIONS);
  await page.goto(REPORT_URL);

  await expect(chartCard(page, "Por setor")).toBeVisible({ timeout: 15000 });

  await expect(
    page.getByRole("button", { name: "Mover para depois" }),
  ).toHaveCount(0);
  await expect(page.locator("[draggable=true]")).toHaveCount(0);
  await expect(page.getByTitle("Arraste para redimensionar")).toHaveCount(0);
});

test("dragging the corner snaps the chart to a width and height", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi);
  await loginWithPermissions(page, mockApi, WRITE_PERMISSIONS);
  await page.setViewportSize({ width: 1280, height: 1600 });
  await page.goto(REPORT_URL);

  await expect(chartCard(page, "Por leito")).toBeVisible({ timeout: 15000 });

  // the first chart's corner across its neighbour, to the row's end
  const neighbour = await chartCard(page, "Por leito").boundingBox();
  const corner = await chartCard(page, "Por setor")
    .locator("..")
    .getByTitle("Arraste para redimensionar")
    .boundingBox();
  await grabCorner(
    page,
    "Por setor",
    neighbour!.x + neighbour!.width - 10 - (corner!.x + corner!.width / 2),
    100,
  );

  // previewed while held, applied on release
  await expect(page.getByText("Tela inteira · 500px")).toBeVisible();
  await page.mouse.up();
  await expect(page.getByText("Tela inteira · 500px")).toHaveCount(0);

  const charts = await savedCharts(page, mockApi);
  expect(charts[0]).toMatchObject({ width: "full", height: 500 });
  expect(charts[1].width).toBe("half");
});

test("a chart ending the row fills it when pushed past the edge", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi);
  await loginWithPermissions(page, mockApi, WRITE_PERMISSIONS);
  await page.goto(REPORT_URL);

  await expect(chartCard(page, "Por leito")).toBeVisible({ timeout: 15000 });

  await grabCorner(page, "Por leito", 24, 0);
  await expect(page.getByText("Tela inteira · 400px")).toBeVisible();
  await page.mouse.up();

  const charts = await savedCharts(page, mockApi);
  expect(charts[1].width).toBe("full");
  // the height was not touched, so it is not written
  expect(charts[1].height).toBeUndefined();
});

test("Escape cancels a resize", async ({ page, mockApi }) => {
  installReportHandlers(mockApi);
  await loginWithPermissions(page, mockApi, WRITE_PERMISSIONS);
  await page.goto(REPORT_URL);

  await expect(chartCard(page, "Por setor")).toBeVisible({ timeout: 15000 });

  await grabCorner(page, "Por setor", -150, 0);
  await expect(page.getByText("Um terço · 400px")).toBeVisible();

  await page.keyboard.press("Escape");
  await page.mouse.up();

  await expect(page.getByText("Um terço · 400px")).toHaveCount(0);
  await expect(page.getByText("Alterações não salvas")).toHaveCount(0);
});
