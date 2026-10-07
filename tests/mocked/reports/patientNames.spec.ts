import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import type { Download, Locator, Page, Route } from "@playwright/test";

import { test, expect, API_URL } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loginWithAuth, loginWithPermissions } from "../support/featureLogin";
import { openSelect } from "../support/antd";

/**
 * Patient names in custom reports (/relatorios/arquivo/CUSTOM/...).
 *
 * A report whose dataset has a fkpessoa column offers "Carregar nomes": a
 * modal that loads the names through POST /names in batches of 100, with a
 * progress bar, and adds a nome_paciente column to the rows. Names are kept
 * only in page memory: the app's patient cache is reused but never written.
 * The export asks whether the file carries the names; with names it is a CSV
 * built by the app's CSV export.
 */

const PERMISSIONS = [
  "READ_BASIC_FEATURES",
  "READ_PRESCRIPTION",
  "READ_REPORTS",
  "READ_CUSTOM_REPORTS",
];

const REPORT_URL = "/relatorios/arquivo/CUSTOM/7/20260101";
const CACHE_URL = `${API_URL}/cache/report.json.gz`;
const CACHE_KEY = "patientNamesCache_demo";

const NAMES: Record<number, string> = {
  1: "Fulano Beltrano",
  2: "Maria Teste",
  3: "Ciclano de Tal",
};

// invented names for the larger datasets
const nameOf = (id: number) => NAMES[id] ?? `Fulana Teste ${id}`;

const rowsFor = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    fkpessoa: i + 1,
    setor: i % 2 ? "UTI" : "ENF",
    dose: (i + 1) * 10,
  }));

const ok = (data: unknown) => ({ json: { status: "success", data } });

const echoNames = async (route: Route) => {
  const { patients } = JSON.parse(route.request().postData() ?? "{}");
  await route.fulfill({
    json: (patients as number[]).map((idPatient) => ({
      status: "success",
      idPatient,
      name: nameOf(idPatient),
    })),
  });
};

// like the backend when its time budget runs out: even ids are left out
const echoOddNames = async (route: Route) => {
  const { patients } = JSON.parse(route.request().postData() ?? "{}");
  await route.fulfill({
    json: (patients as number[])
      .filter((id) => id % 2 === 1)
      .map((idPatient) => ({
        status: "success",
        idPatient,
        name: nameOf(idPatient),
      })),
  });
};

const installReportHandlers = (
  mockApi: MockApi,
  rows: unknown[],
  options: { graphs?: unknown[] } = {},
) => {
  mockApi.override(
    "GET /reports/general/CUSTOM",
    ok({
      cached: true,
      title: "Pacientes com antimicrobiano",
      url: CACHE_URL,
      graphs: JSON.stringify(options.graphs ?? []),
    }),
  );

  mockApi.override("GET /cache/report.json.gz", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/octet-stream",
      body: gzipSync(Buffer.from(JSON.stringify(rows))),
    }),
  );

  mockApi.override("POST /names", echoNames);

  // the server export answers with a presigned url; none here, so nothing opens
  mockApi.override(
    "GET /reports/custom/download/:idReport/:filename",
    ok({ cached: true, url: "" }),
  );
};

// The landing page shown after login resolves its own patient names, so only
// the requests made after the report opened count.
let reportOpenedAt = 0;

const nameRequests = (mockApi: MockApi) =>
  mockApi.requests
    .slice(reportOpenedAt)
    .filter((r) => r.method === "POST" && r.path === "/names")
    .map((r) => JSON.parse(r.postData!).patients as number[]);

// Starts the report from a known name cache: empty, or the given seed. The
// landing page shown after login caches its own patients and may write them
// back while navigating away (the cache persists on pagehide), so the cache is
// set by an init script, which runs in the report document before the app.
const openReport = async (
  page: Page,
  mockApi: MockApi,
  options: { seedCache?: string } = {},
) => {
  await page.addInitScript(
    ([key, seed]) => {
      if (seed) {
        localStorage.setItem(key, seed);
      } else {
        localStorage.removeItem(key);
      }
    },
    [CACHE_KEY, options.seedCache ?? ""],
  );

  reportOpenedAt = mockApi.requests.length;
  await page.goto(REPORT_URL);
  await expect(
    page.getByRole("heading", { name: /Relatório: Pacientes com antimicrobiano/ }),
  ).toBeVisible({ timeout: 15000 });
  // the dataset has been decompressed once the dataset-derived UI shows up
  await expect(page.getByRole("tab", { name: /Tabela/ })).toBeVisible();
  await expect(page.locator(".ant-spin-spinning")).toHaveCount(0);
};

const table = (page: Page) => page.locator(".ant-table");

const namesButton = (page: Page) =>
  page.getByRole("button", { name: /Carregar nomes|Nomes carregados/ });

const footerButton = (dialog: Locator, name: string) =>
  dialog.locator(".ant-modal-footer").getByRole("button", { name });

/**
 * Starts the run in the open modal. A click that lands while the modal is
 * still animating in can be lost, so it is repeated until the modal leaves
 * its initial state.
 */
const startLoad = async (dialog: Locator) => {
  await expect(dialog.getByText("pacientes distintos")).toBeVisible();
  const start = footerButton(dialog, "Carregar");
  await expect(async () => {
    if ((await start.count()) > 0) await start.click({ timeout: 2000 });
    await expect(start).toHaveCount(0, { timeout: 1000 });
  }).toPass({ timeout: 15000 });
};

/**
 * Closes the modal through its footer button: the corner close icon is also
 * labelled "Fechar" in the pt-BR antd locale.
 */
const closeDialog = (dialog: Locator) => footerButton(dialog, "Fechar").click();

const loadNames = async (page: Page) => {
  await namesButton(page).click();
  const dialog = page.getByRole("dialog", { name: "Nomes dos pacientes" });
  await startLoad(dialog);
  return dialog;
};

/** The columns offered by the field select of a new filter. */
const filterFieldOptions = async (page: Page) => {
  await page.getByRole("button", { name: "Adicionar filtro" }).click();
  const filterCard = page.locator(".ant-card").first();
  await openSelect(filterCard);
  const options = page.locator(
    ".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option",
  );
  await expect(options.first()).toBeVisible();
  const labels = await options.allInnerTexts();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Limpar" }).click();
  return labels;
};

test.use({ storageState: { cookies: [], origins: [] } });

/* ------------------------------ loading names ----------------------------- */

test("is not offered when the report has no fkpessoa column", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, [
    { setor: "UTI", dose: 10 },
    { setor: "ENF", dose: 20 },
  ]);
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await openReport(page, mockApi);

  await expect(namesButton(page)).toHaveCount(0);
  expect(nameRequests(mockApi)).toEqual([]);
});

test("names load only from the button, with progress", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, rowsFor(3));
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await openReport(page, mockApi);

  // the button lives in the tabs card, next to the tab bar
  await expect(
    page.locator(".ant-tabs-extra-content").getByRole("button", {
      name: "Carregar nomes",
    }),
  ).toBeVisible();

  // nothing is requested, and there is no name column, until it is used
  await page.waitForTimeout(500);
  expect(nameRequests(mockApi)).toEqual([]);
  await expect(table(page).getByText("nome_paciente")).toHaveCount(0);

  await namesButton(page).click();
  const dialog = page.getByRole("dialog", { name: "Nomes dos pacientes" });
  await expect(dialog.getByText("pacientes distintos")).toContainText("3");
  await expect(
    dialog.getByText("3 nomes serão buscados no serviço de nomes."),
  ).toBeVisible();
  await startLoad(dialog);
  await expect(
    dialog.getByText("Carregados: 3 (cache: 0, buscados: 3)"),
  ).toBeVisible();
  await closeDialog(dialog);

  await expect(table(page).getByText("nome_paciente")).toBeVisible();
  await expect(table(page).getByText("Fulano Beltrano")).toBeVisible();
  await expect(table(page).getByText("Ciclano de Tal")).toBeVisible();
  await expect(namesButton(page)).toHaveText(/Nomes carregados \(3\/3\)/);
  expect(nameRequests(mockApi)).toEqual([[1, 2, 3]]);
});

test("names are requested in batches of 100 and can be filtered", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, rowsFor(150));
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await openReport(page, mockApi);

  expect(await filterFieldOptions(page)).not.toContain("nome_paciente");

  const dialog = await loadNames(page);
  await expect(
    dialog.getByText("Carregados: 150 (cache: 0, buscados: 150)"),
  ).toBeVisible();
  await closeDialog(dialog);

  expect(nameRequests(mockApi).map((ids) => ids.length)).toEqual([100, 50]);
  await expect(namesButton(page)).toHaveText(/Nomes carregados \(150\/150\)/);
  expect(await filterFieldOptions(page)).toContain("nome_paciente");
});

test("reuses cached names and does not add the fetched ones to the cache", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, rowsFor(3));
  await loginWithPermissions(page, mockApi, PERMISSIONS);

  const seed = JSON.stringify([
    ["1", { idPatient: 1, name: "Fulano Beltrano", cache: true }],
  ]);
  await openReport(page, mockApi, { seedCache: seed });

  await namesButton(page).click();
  const dialog = page.getByRole("dialog", { name: "Nomes dos pacientes" });
  await expect(
    dialog.getByText("1 nomes já disponíveis no cache local."),
  ).toBeVisible();
  await expect(
    dialog.getByText("2 nomes serão buscados no serviço de nomes."),
  ).toBeVisible();
  await startLoad(dialog);
  await expect(
    dialog.getByText("Carregados: 3 (cache: 1, buscados: 2)"),
  ).toBeVisible();
  await closeDialog(dialog);

  await expect(table(page).getByText("Fulano Beltrano")).toBeVisible();
  // the cached patient was not requested
  expect(nameRequests(mockApi)).toEqual([[2, 3]]);

  // past the cache's write delay, the stored cache is exactly the seed
  await page.waitForTimeout(800);
  expect(
    await page.evaluate((key) => localStorage.getItem(key), CACHE_KEY),
  ).toBe(seed);
});

test("a patient the name service does not know is not asked again", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, rowsFor(2));
  mockApi.override("POST /names", {
    json: [
      { status: "success", idPatient: 1, name: "Fulano Beltrano" },
      { status: "error", idPatient: 2, name: "Paciente 2" },
    ],
  });
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await openReport(page, mockApi);

  const dialog = await loadNames(page);
  await expect(dialog.getByText("Não encontrados: 1")).toBeVisible();
  await closeDialog(dialog);

  await expect(table(page).getByText("Fulano Beltrano")).toBeVisible();
  await expect(table(page).getByText("Paciente 2")).toHaveCount(0);

  await namesButton(page).click();
  await expect(
    dialog.getByText("Todos os nomes deste relatório já foram consultados."),
  ).toBeVisible();
  await expect(footerButton(dialog, "Carregar")).toHaveCount(0);
  expect(nameRequests(mockApi)).toHaveLength(1);
});

test("ids the name service leaves out are failures, asked again next time", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, rowsFor(4));
  mockApi.override("POST /names", echoOddNames);
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await openReport(page, mockApi);

  const dialog = await loadNames(page);
  await expect(dialog.getByText("Falha na busca: 2")).toBeVisible();
  await expect(dialog.getByText("Não encontrados: 0")).toBeVisible();
  await expect(
    dialog.getByText("Não foi possível buscar todos os nomes."),
  ).toBeVisible();
  await closeDialog(dialog);
  await expect(namesButton(page)).toHaveText(/Nomes carregados \(2\/4\)/);

  // a new run asks only for the failed ones
  await namesButton(page).click();
  await expect(
    dialog.getByText("2 nomes serão buscados no serviço de nomes."),
  ).toBeVisible();
  await startLoad(dialog);
  await expect(dialog.getByText("Falha na busca: 2")).toBeVisible();
  expect(nameRequests(mockApi)).toEqual([
    [1, 2, 3, 4],
    [2, 4],
  ]);
});

test("a failing name service stops the load at the first batch", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, rowsFor(300));
  mockApi.override("POST /names", {
    status: 500,
    json: { status: "error", message: "getname offline" },
  });
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await openReport(page, mockApi);

  const dialog = await loadNames(page);
  await expect(
    dialog.getByText("Não foi possível buscar todos os nomes."),
  ).toBeVisible();
  await expect(dialog.getByText("Não consultados: 200")).toBeVisible();
  expect(nameRequests(mockApi)).toHaveLength(1);
});

test("without a batch endpoint every name is one request", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, rowsFor(30));
  // the backend answers an unknown patient with 400 and an error body
  mockApi.override("GET /names/:idPatient", async (route) => {
    const idPatient = Number(route.request().url().split("/").pop());
    if (idPatient === 2) {
      await route.fulfill({
        status: 400,
        json: { status: "error", idPatient, name: `Paciente ${idPatient}` },
      });
      return;
    }
    await route.fulfill({
      json: { status: "success", idPatient, name: nameOf(idPatient) },
    });
  });
  await loginWithAuth(page, mockApi, {
    permissions: PERMISSIONS,
    multipleNameUrl: undefined,
  });
  await openReport(page, mockApi);

  const dialog = await loadNames(page);
  await expect(
    dialog.getByText("Carregados: 29 (cache: 0, buscados: 29)"),
  ).toBeVisible();
  await expect(dialog.getByText("Não encontrados: 1")).toBeVisible();
  await closeDialog(dialog);
  await expect(namesButton(page)).toHaveText(/Nomes carregados \(29\/30\)/);

  const singles = mockApi.requests
    .slice(reportOpenedAt)
    .filter((r) => r.method === "GET" && /^\/names\/\d+$/.test(r.path))
    .map((r) => r.path);
  expect(singles).toHaveLength(30);
  expect(new Set(singles).size).toBe(30);
  expect(nameRequests(mockApi)).toEqual([]);
});

test("is not offered when name resolution is disabled", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, rowsFor(3));
  await loginWithAuth(page, mockApi, {
    permissions: PERMISSIONS,
    features: ["DISABLE_GETNAME"],
  });
  await openReport(page, mockApi);

  await expect(namesButton(page)).toHaveCount(0);
  expect(nameRequests(mockApi)).toEqual([]);
});

test("is not offered when names are hidden", async ({ page, mockApi }) => {
  installReportHandlers(mockApi, rowsFor(3));
  // HIDE_NAMES masks the user name in the header
  await loginWithAuth(
    page,
    mockApi,
    { permissions: PERMISSIONS, features: ["HIDE_NAMES"] },
    "***",
  );
  await openReport(page, mockApi);

  await expect(namesButton(page)).toHaveCount(0);
  expect(nameRequests(mockApi)).toEqual([]);
});

test("cancelling keeps the names already loaded", async ({ page, mockApi }) => {
  installReportHandlers(mockApi, rowsFor(300));
  mockApi.override("POST /names", async (route) => {
    const { patients } = JSON.parse(route.request().postData() ?? "{}");
    if ((patients as number[]).includes(300)) {
      // the last batch hangs until the user cancels
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    try {
      await echoNames(route);
    } catch {
      // request aborted by the cancel button
    }
  });
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await openReport(page, mockApi);

  const dialog = await loadNames(page);
  await expect(dialog.getByTestId("patient-names-progress")).toHaveText(
    "200 de 300",
  );
  await footerButton(dialog, "Cancelar").click();

  await expect(
    dialog.getByText(
      "Carregamento cancelado. Os nomes já obtidos foram aplicados.",
    ),
  ).toBeVisible();
  await expect(dialog.getByText("Não consultados: 100")).toBeVisible();
  await closeDialog(dialog);

  await expect(table(page).getByText("Fulano Beltrano")).toBeVisible();
  await expect(namesButton(page)).toHaveText(/Nomes carregados \(200\/300\)/);
  expect(nameRequests(mockApi)).toHaveLength(3);
});

test("patient names never reach the chart suggestion agent", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, rowsFor(3));
  mockApi.override("POST /reports/custom/suggest-graphs", ok([]));
  await loginWithPermissions(page, mockApi, [
    ...PERMISSIONS,
    "WRITE_CUSTOM_REPORTS_GRAPHS",
  ]);
  await openReport(page, mockApi);

  const dialog = await loadNames(page);
  await closeDialog(dialog);
  await expect(namesButton(page)).toHaveText(/Nomes carregados \(3\/3\)/);

  await page.getByRole("tab", { name: /Gráficos/ }).click();
  await page.getByRole("button", { name: "Gerar com agente" }).first().click();
  await page
    .getByPlaceholder(
      "Ex.: contagem de atendimentos por setor, do maior para o menor",
    )
    .fill("pacientes por setor");
  await page.getByRole("button", { name: "Gerar gráfico" }).click();

  await expect
    .poll(() =>
      mockApi.requests.filter(
        (r) => r.path === "/reports/custom/suggest-graphs",
      ),
    )
    .toHaveLength(1);

  const request = mockApi.requests.find(
    (r) => r.path === "/reports/custom/suggest-graphs",
  )!;
  const payload = JSON.parse(request.postData!);

  expect(payload.columns.map((c: { key: string }) => c.key)).toEqual([
    "fkpessoa",
    "setor",
    "dose",
  ]);
  payload.sampleRows.forEach((row: Record<string, unknown>) => {
    expect(Object.keys(row)).not.toContain("nome_paciente");
  });
  expect(request.postData).not.toContain("Fulano Beltrano");
});

/* --------------------------------- export --------------------------------- */

const serverExports = (mockApi: MockApi) =>
  mockApi.requests
    .slice(reportOpenedAt)
    .filter((r) => r.path.startsWith("/reports/custom/download/"))
    .map((r) => r.path);

const openExport = async (page: Page) => {
  // floating menu: icon-only buttons, named by their icons
  await page.getByRole("button", { name: "menu", exact: true }).click();
  await page.getByRole("button", { name: "download", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Exportar relatório" });
  await expect(dialog).toBeVisible();
  return dialog;
};

const exportFormat = (dialog: Locator, format: "CSV" | "XLSX") =>
  dialog.getByRole("button", { name: format });

const csvLines = async (download: Download) =>
  readFileSync((await download.path())!).toString("utf8").split("\r\n");

test("a report without fkpessoa exports the server file directly", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, [{ setor: "UTI", dose: 10 }]);
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await openReport(page, mockApi);

  const dialog = await openExport(page);
  await expect(dialog.getByText("Nomes dos pacientes")).toHaveCount(0);
  await exportFormat(dialog, "XLSX").click();

  await expect
    .poll(() => serverExports(mockApi))
    .toEqual(["/reports/custom/download/7/20260101.xlsx"]);
});

test("exporting asks for the names first; without them it is the server file", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, rowsFor(3));
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await openReport(page, mockApi);

  const dialog = await openExport(page);
  await expect(exportFormat(dialog, "XLSX")).toBeDisabled();
  await expect(exportFormat(dialog, "CSV")).toBeDisabled();

  await dialog.getByText("Sem nomes").click();
  await exportFormat(dialog, "XLSX").click();

  await expect
    .poll(() => serverExports(mockApi))
    .toEqual(["/reports/custom/download/7/20260101.xlsx"]);
  expect(nameRequests(mockApi)).toEqual([]);
});

test("exporting with names is a csv, loading the missing names first", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, rowsFor(150));
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await openReport(page, mockApi);

  const dialog = await openExport(page);
  await dialog.getByText("Com nomes").click();
  // with names, CSV is the only format
  await expect(exportFormat(dialog, "XLSX")).toHaveCount(0);
  await expect(
    dialog.getByText("*Com nomes, o arquivo é exportado em CSV."),
  ).toBeVisible();
  await expect(
    dialog.getByText(
      "Antes da exportação, serão carregados os nomes de 150 pacientes.",
    ),
  ).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    exportFormat(dialog, "CSV").click(),
  ]);

  expect(download.suggestedFilename()).toBe(
    "pacientes-com-antimicrobiano-20260101-com-nomes.csv",
  );
  const lines = await csvLines(download);
  expect(lines[0]).toBe("fkpessoa,nome_paciente,setor,dose");
  expect(lines[1]).toBe('1,"Fulano Beltrano","ENF",10');
  expect(lines[150]).toBe(`150,"${nameOf(150)}","UTI",1500`);
  expect(lines).toHaveLength(151);

  // the load also served the table
  expect(nameRequests(mockApi).map((ids) => ids.length)).toEqual([100, 50]);
  await expect(namesButton(page)).toHaveText(/Nomes carregados \(150\/150\)/);
  expect(serverExports(mockApi)).toEqual([]);
});

test("once every name is answered the csv needs no new lookups", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, [
    { fkpessoa: 1, setor: "UTI, adulto", dose: 10 },
    { fkpessoa: 2, setor: "ENF", dose: 20 },
    { fkpessoa: null, setor: "ENF", dose: 30 },
  ]);
  mockApi.override("POST /names", {
    json: [
      { status: "success", idPatient: 1, name: "Fulano Beltrano" },
      { status: "error", idPatient: 2, name: "Paciente 2" },
    ],
  });
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await openReport(page, mockApi);

  const loadDialog = await loadNames(page);
  await closeDialog(loadDialog);
  await expect(namesButton(page)).toHaveText(/Nomes carregados \(1\/2\)/);

  const dialog = await openExport(page);
  await dialog.getByText("Com nomes").click();
  await expect(dialog.getByText(/Antes da exportação/)).toHaveCount(0);
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    exportFormat(dialog, "CSV").click(),
  ]);

  expect(await csvLines(download)).toEqual([
    "fkpessoa,nome_paciente,setor,dose",
    '1,"Fulano Beltrano","UTI, adulto",10',
    '2,"","ENF",20',
    '"","","ENF",30',
  ]);
  expect(nameRequests(mockApi)).toHaveLength(1);
});

test("names that fail can still be exported blank", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, rowsFor(4));
  mockApi.override("POST /names", echoOddNames);
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await openReport(page, mockApi);

  const dialog = await openExport(page);
  await dialog.getByText("Com nomes").click();
  await exportFormat(dialog, "CSV").click();

  await expect(
    dialog.getByText("Não foi possível buscar os nomes de 2 pacientes."),
  ).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    dialog.getByRole("button", { name: "Exportar mesmo assim" }).click(),
  ]);
  const lines = await csvLines(download);
  expect(lines[1]).toBe('1,"Fulano Beltrano","ENF",10');
  expect(lines[2]).toBe('2,"","UTI",20');
});

test("cancelling the name load exports nothing", async ({ page, mockApi }) => {
  installReportHandlers(mockApi, rowsFor(300));
  mockApi.override("POST /names", async (route) => {
    const { patients } = JSON.parse(route.request().postData() ?? "{}");
    if ((patients as number[]).includes(300)) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    try {
      await echoNames(route);
    } catch {
      // request aborted by the cancel button
    }
  });
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await openReport(page, mockApi);

  let downloads = 0;
  page.on("download", () => downloads++);

  const dialog = await openExport(page);
  await dialog.getByText("Com nomes").click();
  await exportFormat(dialog, "CSV").click();
  await expect(dialog.getByTestId("patient-names-progress")).toHaveText(
    "200 de 300",
  );
  await footerButton(dialog, "Cancelar").click();

  // back to the choice, nothing downloaded
  await expect(exportFormat(dialog, "CSV")).toBeEnabled();
  await page.waitForTimeout(500);
  expect(downloads).toBe(0);
  expect(serverExports(mockApi)).toEqual([]);
});
