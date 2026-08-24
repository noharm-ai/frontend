import { gzipSync } from "node:zlib";

import { test, expect, API_URL } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";
import { loadFixture } from "../support/defaultHandlers";
import { openSelect, pickOption } from "../support/antd";

/**
 * Copying charts from another custom report, including the column
 * reconciliation the copy needs when the source chart names a column the
 * destination report does not have.
 *
 * The destination dataset is served gzipped from the mocked API host, the same
 * way the app consumes the presigned cache URL.
 */

const BASE_PERMISSIONS = [
  "READ_BASIC_FEATURES",
  "READ_PRESCRIPTION",
  "READ_REPORTS",
  "READ_CUSTOM_REPORTS",
  "WRITE_CUSTOM_REPORTS_GRAPHS",
];

const REPORT_URL = "/relatorios/arquivo/CUSTOM/7/20260101";
const CACHE_URL = `${API_URL}/cache/report.json.gz`;

// The destination report has "setor" but not "unidade": the source chart below
// names "unidade", which is what forces the reconciliation step.
const DESTINATION_ROWS = [
  { setor: "UTI", leito: "A1", dose: 10 },
  { setor: "ENF", leito: "B2", dose: 20 },
];

const SOURCE_CHART = {
  id: "src-1",
  type: "bar",
  xKeys: ["unidade"],
  yKeys: ["__count__"],
  title: "Prescrições por unidade",
  width: "half",
  aggregation: "count",
};

const PORTABLE_CHART = {
  id: "src-2",
  type: "pie",
  xKeys: ["setor"],
  yKeys: ["__count__"],
  title: "Prescrições por setor",
  width: "half",
  aggregation: "count",
};

const ok = (data: unknown) => ({ json: { status: "success", data } });

const installReportHandlers = (
  mockApi: {
    override: (key: string, handler: any) => void;
  },
  options: { sourceCharts?: unknown[]; ownCharts?: unknown[] } = {},
) => {
  mockApi.override(
    "GET /reports/general/CUSTOM",
    ok({
      cached: true,
      title: "Prescricoes com intervencao de subdose",
      url: CACHE_URL,
      graphs: JSON.stringify(options.ownCharts ?? []),
    }),
  );

  // the gzipped dataset the app decompresses client-side
  mockApi.override("GET /cache/report.json.gz", (route: any) =>
    route.fulfill({
      status: 200,
      contentType: "application/octet-stream",
      body: gzipSync(Buffer.from(JSON.stringify(DESTINATION_ROWS))),
    }),
  );

  mockApi.override(
    "GET /switch-schema",
    ok({
      maintainer: true,
      schemas: [{ name: "demo" }, { name: "celiodecastro" }],
    }),
  );

  mockApi.override(
    "GET /admin/report/copy-source/list",
    ok([
      {
        id: 42,
        name: "Prescricoes com intervencao de subdose",
        description: "origem",
        status: 3,
        processedAt: "2026-01-01T10:00:00",
        graphCount: (options.sourceCharts ?? [SOURCE_CHART]).length,
      },
    ]),
  );

  mockApi.override(
    "GET /admin/report/copy-source/:id/graphs",
    ok({
      id: 42,
      name: "Prescricoes com intervencao de subdose",
      sourceSchema: "celiodecastro",
      graphs: options.sourceCharts ?? [SOURCE_CHART],
    }),
  );

  mockApi.override("PATCH /admin/report/:id/graphs", ok({ id: 7 }));
};

const openCopyWizard = async (page: any) => {
  await page.goto(REPORT_URL);

  await expect(
    page.getByRole("button", { name: "Copiar de outro relatório" }),
  ).toBeEnabled({ timeout: 15000 });

  await page.getByRole("button", { name: "Copiar de outro relatório" }).click();

  return page.getByRole("dialog");
};

/**
 * A maintainer lands on the schema chooser instead of the app, so the login
 * helper cannot be reused: the schema has to be confirmed before the report
 * page is reachable.
 */
const loginAsMaintainer = async (page: any, mockApi: any) => {
  const auth = loadFixture<Record<string, unknown>>("auth/authenticate.json");
  const payload = {
    ...auth,
    permissions: [...BASE_PERMISSIONS, "MULTI_SCHEMA", "MAINTAINER"],
  };

  mockApi.override("POST /authenticate", { json: payload });
  mockApi.override("POST /switch-schema", { json: { status: "success", data: payload } });

  await page.goto("/login");
  await page.getByPlaceholder("Email").fill("e2e@noharm.ai");
  await page.getByPlaceholder("Senha").fill("mocked-password");
  await page.getByRole("button", { name: "Acessar" }).click();

  await page.getByRole("button", { name: "Definir schema" }).click();

  await expect(page.getByText("E2E Test")).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(1000);
};

test.use({ storageState: { cookies: [], origins: [] } });

test("copies a chart whose columns all exist in the destination", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, { sourceCharts: [PORTABLE_CHART] });
  await loginWithPermissions(page, mockApi, BASE_PERMISSIONS);

  const dialog = await openCopyWizard(page);

  await openSelect(dialog.getByTestId("copy-source-report"));
  await pickOption(page, "Prescricoes com intervencao de subdose");

  await dialog.getByRole("button", { name: "Próximo" }).click();

  // nothing to reconcile
  await expect(
    dialog.getByText(
      "Todas as colunas usadas pelos gráficos existem neste relatório.",
    ),
  ).toBeVisible();

  await dialog.getByRole("button", { name: "Próximo" }).click();
  await dialog.getByRole("button", { name: /Copiar 1 gráfico/ }).click();

  await expect(page.getByText("Alterações não salvas")).toBeVisible();

  // the copied chart reaches the save payload with a fresh id
  await page.getByRole("button", { name: "save", exact: true }).click();
  await expect(page.getByText("Gráficos salvos com sucesso.")).toBeVisible();

  const saved = mockApi.requests.find(
    (request) => request.method === "PATCH" && request.path.endsWith("/graphs"),
  );
  const charts = JSON.parse(JSON.parse(saved!.postData!).graphs);

  expect(charts).toHaveLength(1);
  expect(charts[0].title).toBe("Prescrições por setor");
  expect(charts[0].xKeys).toEqual(["setor"]);
  expect(charts[0].id).not.toBe(PORTABLE_CHART.id);
});

test("maps a column that does not exist in the destination", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi);
  await loginAsMaintainer(page, mockApi);

  const dialog = await openCopyWizard(page);

  // a maintainer picks the source schema
  await openSelect(dialog.getByTestId("copy-source-schema"));
  await pickOption(page, "celiodecastro");

  await openSelect(dialog.getByTestId("copy-source-report"));
  await pickOption(page, "Prescricoes com intervencao de subdose");

  await dialog.getByRole("button", { name: "Próximo" }).click();

  // the missing column blocks the copy until it is mapped
  await expect(
    dialog.getByRole("cell", { name: "unidade", exact: true }),
  ).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Próximo" })).toBeDisabled();

  await openSelect(dialog.locator(".ant-table tbody tr").first());
  await pickOption(page, "setor (string)");

  await expect(dialog.getByText("Pronto")).toBeVisible();
  await dialog.getByRole("button", { name: "Próximo" }).click();
  await dialog.getByRole("button", { name: /Copiar 1 gráfico/ }).click();

  await page.getByRole("button", { name: "save", exact: true }).click();
  await expect(page.getByText("Gráficos salvos com sucesso.")).toBeVisible();

  const saved = mockApi.requests.find(
    (request) => request.method === "PATCH" && request.path.endsWith("/graphs"),
  );
  const charts = JSON.parse(JSON.parse(saved!.postData!).graphs);

  expect(charts[0].xKeys).toEqual(["setor"]);

  // the source schema travelled on the copy-source requests
  const listCall = mockApi.requests.find((request) =>
    request.path.endsWith("/copy-source/list"),
  );
  expect(listCall).toBeTruthy();
});

test("ignoring a column leaves the affected chart out of the copy", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, {
    sourceCharts: [SOURCE_CHART, PORTABLE_CHART],
  });
  await loginWithPermissions(page, mockApi, BASE_PERMISSIONS);

  const dialog = await openCopyWizard(page);

  await openSelect(dialog.getByTestId("copy-source-report"));
  await pickOption(page, "Prescricoes com intervencao de subdose");

  await dialog.getByRole("button", { name: "Próximo" }).click();

  await openSelect(dialog.locator(".ant-table tbody tr").first());
  await pickOption(page, "Ignorar (remove os gráficos afetados)");

  await dialog.getByRole("button", { name: "Próximo" }).click();
  await dialog.getByRole("button", { name: /Copiar 1 gráfico/ }).click();

  await page.getByRole("button", { name: "save", exact: true }).click();
  await expect(page.getByText("Gráficos salvos com sucesso.")).toBeVisible();

  const saved = mockApi.requests.find(
    (request) => request.method === "PATCH" && request.path.endsWith("/graphs"),
  );
  const charts = JSON.parse(JSON.parse(saved!.postData!).graphs);

  expect(charts).toHaveLength(1);
  expect(charts[0].title).toBe("Prescrições por setor");
});

test("a user without MAINTAINER cannot choose another schema", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi);
  await loginWithPermissions(page, mockApi, BASE_PERMISSIONS);

  const dialog = await openCopyWizard(page);

  await expect(dialog.getByText("Schema de origem")).toHaveCount(0);
  await expect(dialog.getByText("Relatório de origem")).toBeVisible();

  // no schema list is even requested
  expect(
    mockApi.requests.filter((request) => request.path === "/switch-schema"),
  ).toEqual([]);
});

test("a duplicated title is copied with a suffix", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, {
    sourceCharts: [PORTABLE_CHART],
    ownCharts: [{ ...PORTABLE_CHART, id: "own-1" }],
  });
  await loginWithPermissions(page, mockApi, BASE_PERMISSIONS);

  const dialog = await openCopyWizard(page);

  await openSelect(dialog.getByTestId("copy-source-report"));
  await pickOption(page, "Prescricoes com intervencao de subdose");

  await dialog.getByRole("button", { name: "Próximo" }).click();
  await dialog.getByRole("button", { name: "Próximo" }).click();
  await dialog.getByRole("button", { name: /Copiar 1 gráfico/ }).click();

  await page.getByRole("button", { name: "save", exact: true }).click();
  await expect(page.getByText("Gráficos salvos com sucesso.")).toBeVisible();

  const saved = mockApi.requests.find(
    (request) => request.method === "PATCH" && request.path.endsWith("/graphs"),
  );
  const charts = JSON.parse(JSON.parse(saved!.postData!).graphs);

  expect(charts).toHaveLength(2);
  expect(charts[1].title).toBe("Prescrições por setor (cópia)");
});
