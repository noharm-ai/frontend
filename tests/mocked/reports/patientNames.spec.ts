import { readFileSync } from "node:fs";
import { gzipSync, inflateRawSync } from "node:zlib";
import type { Download } from "@playwright/test";
import type { Locator, Page, Route } from "@playwright/test";

import { test, expect, API_URL } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loginWithAuth, loginWithPermissions } from "../support/featureLogin";
import { openSelect } from "../support/antd";

/**
 * Patient names in custom reports (/relatorios/arquivo/CUSTOM/...).
 *
 * A report whose dataset has a fkpessoa column gets a nome_paciente column
 * whose names load as the rows appear on screen, through POST /names. The
 * "Carregar todos os nomes" button loads the rest in batches of 100 and is
 * what unlocks filtering and sorting by name. Names are kept only in page
 * memory: the app's patient cache is reused but never written.
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

const requestedIds = (mockApi: MockApi) => nameRequests(mockApi).flat();

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

const loadAllButton = (page: Page) =>
  page.getByRole("button", { name: /Carregar todos os nomes|Nomes carregados/ });

/**
 * Starts the run in the open modal. A click that lands while the modal is
 * still animating in can be lost, so it is repeated until the modal leaves
 * its initial state.
 */
const startLoad = async (dialog: Locator) => {
  await expect(dialog.getByText("pacientes distintos")).toBeVisible();
  const start = dialog.getByRole("button", { name: /^(Carregar|Aplicar)$/ });
  await expect(async () => {
    if ((await start.count()) > 0) await start.click({ timeout: 2000 });
    await expect(start).toHaveCount(0, { timeout: 1000 });
  }).toPass({ timeout: 15000 });
};

/**
 * Closes the modal through its footer button: the corner close icon is also
 * labelled "Fechar" in the pt-BR antd locale.
 */
const closeDialog = (dialog: Locator) =>
  dialog
    .locator(".ant-modal-footer")
    .getByRole("button", { name: "Fechar" })
    .click();

const loadAllNames = async (page: Page) => {
  await loadAllButton(page).click();
  const dialog = page.getByRole("dialog");
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

/** Scrolls the virtual report table down by `pixels`. */
const scrollTable = async (page: Page, pixels: number) => {
  await table(page).locator(".ant-table-tbody-virtual").hover();
  for (let done = 0; done < pixels; done += 2000) {
    await page.mouse.wheel(0, 2000);
  }
};

test.use({ storageState: { cookies: [], origins: [] } });

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

  await expect(loadAllButton(page)).toHaveCount(0);
  await expect(table(page).getByText("nome_paciente")).toHaveCount(0);
  expect(nameRequests(mockApi)).toEqual([]);
});

test("names load by themselves as the rows show up", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, rowsFor(3));
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await openReport(page, mockApi);

  await expect(table(page).getByText("nome_paciente")).toBeVisible();
  await expect(table(page).getByText("Fulano Beltrano")).toBeVisible();
  await expect(table(page).getByText("Ciclano de Tal")).toBeVisible();

  expect(nameRequests(mockApi)).toEqual([[1, 2, 3]]);

  // the full load lives in the tabs card, next to the tab bar
  await expect(
    page.locator(".ant-tabs-extra-content").getByRole("button", {
      name: "Carregar todos os nomes",
    }),
  ).toBeVisible();
});

test("only the rows on screen are requested while scrolling", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, rowsFor(1000));
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await openReport(page, mockApi);

  await expect(table(page).getByText("Fulano Beltrano")).toBeVisible();
  const firstScreen = requestedIds(mockApi);
  expect(firstScreen).toContain(1);
  expect(firstScreen).not.toContain(1000);
  expect(firstScreen.length).toBeLessThan(100);

  // a long scroll to the bottom skips the rows flown past
  await scrollTable(page, 60000);
  await expect(
    table(page).getByText(nameOf(1000), { exact: true }),
  ).toBeVisible();

  const ids = requestedIds(mockApi);
  expect(ids).toContain(1000);
  expect(ids.length).toBeLessThan(300);
  expect(new Set(ids).size).toBe(ids.length);
});

test("loading every name unlocks filtering by name", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, rowsFor(150));
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await openReport(page, mockApi);
  await expect(table(page).getByText("Fulano Beltrano")).toBeVisible();

  // a partially loaded column would filter out rows silently
  expect(await filterFieldOptions(page)).not.toContain("nome_paciente");

  const onScreen = requestedIds(mockApi).length;
  const remaining = 150 - onScreen;
  await loadAllButton(page).click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByText(`${onScreen} nomes já carregados nesta tela.`),
  ).toBeVisible();
  await expect(
    dialog.getByText(`${remaining} nomes serão buscados no serviço de nomes.`),
  ).toBeVisible();
  await startLoad(dialog);
  await expect(
    dialog.getByText(
      `Carregados: ${remaining} (cache: 0, buscados: ${remaining})`,
    ),
  ).toBeVisible();
  await closeDialog(dialog);

  await expect(loadAllButton(page)).toHaveText(/Nomes carregados \(150\/150\)/);

  // batches of at most 100, and no patient requested twice
  const batches = nameRequests(mockApi);
  batches.forEach((ids) => expect(ids.length).toBeLessThanOrEqual(100));
  const ids = batches.flat();
  expect(ids).toHaveLength(150);
  expect(new Set(ids).size).toBe(150);

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

  await expect(table(page).getByText("Fulano Beltrano")).toBeVisible();
  await expect(table(page).getByText("Maria Teste")).toBeVisible();

  // the cached patient was not requested
  expect(nameRequests(mockApi)).toEqual([[2, 3]]);

  // every name is already on the page: the full load fetches nothing
  const dialog = await loadAllNames(page);
  await expect(
    dialog.getByText("Carregados: 0 (cache: 0, buscados: 0)"),
  ).toBeVisible();
  await closeDialog(dialog);
  expect(nameRequests(mockApi)).toEqual([[2, 3]]);

  // past the cache's write delay, the stored cache is exactly the seed
  await page.waitForTimeout(800);
  expect(
    await page.evaluate((key) => localStorage.getItem(key), CACHE_KEY),
  ).toBe(seed);
});

test("a patient missing from the name service shows as not found", async ({
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

  await expect(table(page).getByText("Fulano Beltrano")).toBeVisible();
  await expect(table(page).getByText("Não encontrado")).toBeVisible();
  await expect(table(page).getByText("Paciente 2")).toHaveCount(0);
});

test("ids the name service leaves out are failures, not missing patients", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, rowsFor(4));
  // like the backend when its time budget runs out: unreached ids are omitted
  mockApi.override("POST /names", async (route) => {
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
  });
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await openReport(page, mockApi);

  await expect(table(page).getByText("Fulano Beltrano")).toBeVisible();
  await expect(table(page).getByText("Erro ao buscar")).toHaveCount(2);
  await expect(table(page).getByText("Não encontrado")).toHaveCount(0);

  const dialog = await loadAllNames(page);
  await expect(dialog.getByText("Falha na busca: 2")).toBeVisible();
  await expect(
    dialog.getByText("Não foi possível buscar todos os nomes."),
  ).toBeVisible();
  await closeDialog(dialog);

  // the failed ids still have no answer: the name filter stays locked
  await expect(loadAllButton(page)).toHaveText("Carregar todos os nomes");
  expect(await filterFieldOptions(page)).not.toContain("nome_paciente");
});

test("a failing name service stops the full load at the first batch", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, rowsFor(300));
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await openReport(page, mockApi);
  await expect(table(page).getByText("Fulano Beltrano")).toBeVisible();

  mockApi.override("POST /names", {
    status: 500,
    json: { status: "error", message: "getname offline" },
  });
  const before = nameRequests(mockApi).length;

  const dialog = await loadAllNames(page);
  await expect(
    dialog.getByText("Não foi possível buscar todos os nomes."),
  ).toBeVisible();
  await expect(dialog.getByText(/^Não consultados: \d+$/)).toBeVisible();

  expect(nameRequests(mockApi).length - before).toBe(1);
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

  await expect(table(page).getByText("Fulano Beltrano")).toBeVisible();
  await expect(table(page).getByText("Não encontrado")).toBeVisible();

  const dialog = await loadAllNames(page);
  await expect(dialog.getByText(/^Carregados: \d+/)).toBeVisible();
  await closeDialog(dialog);
  await expect(loadAllButton(page)).toHaveText(/Nomes carregados \(29\/30\)/);

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

  await expect(loadAllButton(page)).toHaveCount(0);
  await expect(table(page).getByText("nome_paciente")).toHaveCount(0);
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

  await expect(loadAllButton(page)).toHaveCount(0);
  await expect(table(page).getByText("nome_paciente")).toHaveCount(0);
  expect(nameRequests(mockApi)).toEqual([]);
});

test("cancelling the full load keeps the names but not the name filter", async ({
  page,
  mockApi,
}) => {
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
  await expect(table(page).getByText("Fulano Beltrano")).toBeVisible();

  const dialog = await loadAllNames(page);
  await expect(dialog.getByTestId("patient-names-progress")).toHaveText(
    /^200 de \d+$/,
  );
  await dialog
    .locator(".ant-modal-footer")
    .getByRole("button", { name: "Cancelar" })
    .click();

  await expect(
    dialog.getByText(
      "Carregamento cancelado. Os nomes já obtidos foram aplicados.",
    ),
  ).toBeVisible();
  await expect(dialog.getByText(/^Não consultados: \d+$/)).toBeVisible();
  await closeDialog(dialog);

  // not every patient was queried: the column is still partial
  await expect(loadAllButton(page)).toHaveText("Carregar todos os nomes");
  expect(await filterFieldOptions(page)).not.toContain("nome_paciente");
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

/** Reads one file out of the xlsx (zip) the app built. */
const readXlsxEntry = (file: Buffer, entryName: string): string => {
  let offset = 0;
  while (file.readUInt32LE(offset) === 0x04034b50) {
    const method = file.readUInt16LE(offset + 8);
    const size = file.readUInt32LE(offset + 18);
    const nameLength = file.readUInt16LE(offset + 26);
    const extraLength = file.readUInt16LE(offset + 28);
    const name = file.toString("utf8", offset + 30, offset + 30 + nameLength);
    const start = offset + 30 + nameLength + extraLength;
    const data = file.subarray(start, start + size);

    if (name === entryName) {
      return (method === 8 ? inflateRawSync(data) : data).toString("utf8");
    }
    offset = start + size;
  }
  throw new Error(`${entryName} not found in the xlsx`);
};

const downloadedFile = async (download: Download) =>
  readFileSync((await download.path())!);

test("a report without fkpessoa exports the server file directly", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, [{ setor: "UTI", dose: 10 }]);
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await openReport(page, mockApi);

  const dialog = await openExport(page);
  await expect(dialog.getByText("Nomes dos pacientes")).toHaveCount(0);
  await exportFormat(dialog, "CSV").click();

  await expect
    .poll(() => serverExports(mockApi))
    .toEqual(["/reports/custom/download/7/20260101.csv"]);
});

test("exporting asks for the names first; without them it is the server file", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, rowsFor(3));
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await openReport(page, mockApi);
  await expect(table(page).getByText("Fulano Beltrano")).toBeVisible();
  const before = nameRequests(mockApi).length;

  const dialog = await openExport(page);
  await expect(exportFormat(dialog, "XLSX")).toBeDisabled();
  await expect(exportFormat(dialog, "CSV")).toBeDisabled();

  await dialog.getByText("Sem nomes").click();
  await exportFormat(dialog, "XLSX").click();

  await expect
    .poll(() => serverExports(mockApi))
    .toEqual(["/reports/custom/download/7/20260101.xlsx"]);
  expect(nameRequests(mockApi)).toHaveLength(before);
});

test("exporting with names loads the missing ones and builds the xlsx", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, rowsFor(150));
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await openReport(page, mockApi);
  await expect(table(page).getByText("Fulano Beltrano")).toBeVisible();
  const onScreen = requestedIds(mockApi).length;

  const dialog = await openExport(page);
  await dialog.getByText("Com nomes").click();
  await expect(
    dialog.getByText(
      `Antes da exportação, serão carregados os nomes de ${150 - onScreen} pacientes.`,
    ),
  ).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    exportFormat(dialog, "XLSX").click(),
  ]);

  expect(download.suggestedFilename()).toBe(
    "pacientes-com-antimicrobiano-20260101-com-nomes.xlsx",
  );
  const sheet = readXlsxEntry(
    await downloadedFile(download),
    "xl/worksheets/sheet1.xml",
  );
  // the name column follows fkpessoa, for every patient
  expect(sheet).toMatch(
    /<row r="1"><c r="A1" s="1" t="inlineStr"><is><t>fkpessoa<\/t><\/is><\/c><c r="B1" s="1" t="inlineStr"><is><t>nome_paciente<\/t>/,
  );
  expect(sheet).toContain("<t>Fulano Beltrano</t>");
  expect(sheet).toContain(`<t>${nameOf(150)}</t>`);
  expect(sheet).toContain('<row r="151">');

  // the full load also served the table: filtering by name is unlocked
  expect(new Set(requestedIds(mockApi)).size).toBe(150);
  await expect(loadAllButton(page)).toHaveText(/Nomes carregados \(150\/150\)/);
  expect(serverExports(mockApi)).toEqual([]);
});

test("once every name is loaded the csv is built without new lookups", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, [
    { fkpessoa: 1, setor: "UTI, adulto", dose: 10 },
    // would run as a formula in a spreadsheet: neutralized
    { fkpessoa: 2, setor: "-2+3+cmd|' /C calc'!A0", dose: 20.5 },
    // a dash placeholder is data, kept as is
    { fkpessoa: null, setor: "-", dose: 30 },
  ]);
  mockApi.override("POST /names", {
    json: [
      { status: "success", idPatient: 1, name: "Fulano Beltrano" },
      { status: "error", idPatient: 2, name: "Paciente 2" },
    ],
  });
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await openReport(page, mockApi);

  const loadDialog = await loadAllNames(page);
  await closeDialog(loadDialog);
  await expect(loadAllButton(page)).toHaveText(/Nomes carregados/);
  const before = nameRequests(mockApi).length;

  const dialog = await openExport(page);
  await dialog.getByText("Com nomes").click();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    exportFormat(dialog, "CSV").click(),
  ]);

  const csv = (await downloadedFile(download)).toString("utf8");
  expect(csv).toBe(
    "\uFEFF" +
      [
        "fkpessoa,nome_paciente,setor,dose",
        '1,Fulano Beltrano,"UTI, adulto",10',
        "2,,'-2+3+cmd|' /C calc'!A0,20.5",
        ",,-,30",
      ].join("\r\n"),
  );
  expect(nameRequests(mockApi)).toHaveLength(before);
});

test("names that fail can still be exported blank", async ({
  page,
  mockApi,
}) => {
  installReportHandlers(mockApi, rowsFor(4));
  // the name service never answers patients 2 and 4
  mockApi.override("POST /names", async (route) => {
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
  });
  await loginWithPermissions(page, mockApi, PERMISSIONS);
  await openReport(page, mockApi);
  await expect(table(page).getByText("Fulano Beltrano")).toBeVisible();

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
  const lines = (await downloadedFile(download))
    .toString("utf8")
    .split("\r\n");
  expect(lines[1]).toBe("1,Fulano Beltrano,ENF,10");
  expect(lines[2]).toBe("2,,UTI,20");

  // the names are still partial: filtering by name stays locked
  await expect(loadAllButton(page)).toHaveText("Carregar todos os nomes");
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
  await expect(table(page).getByText("Fulano Beltrano")).toBeVisible();

  let downloads = 0;
  page.on("download", () => downloads++);

  const dialog = await openExport(page);
  await dialog.getByText("Com nomes").click();
  await exportFormat(dialog, "XLSX").click();
  await expect(dialog.getByTestId("patient-names-progress")).toHaveText(
    /^200 de \d+$/,
  );
  await dialog
    .locator(".ant-modal-footer")
    .getByRole("button", { name: "Cancelar" })
    .click();

  // back to the choice, nothing downloaded
  await expect(exportFormat(dialog, "XLSX")).toBeEnabled();
  await page.waitForTimeout(500);
  expect(downloads).toBe(0);
  expect(serverExports(mockApi)).toEqual([]);
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

  const dialog = await loadAllNames(page);
  await closeDialog(dialog);
  await expect(loadAllButton(page)).toHaveText(/Nomes carregados \(3\/3\)/);

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
