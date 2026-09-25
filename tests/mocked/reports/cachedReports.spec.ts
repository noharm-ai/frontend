import { gzipSync } from "node:zlib";

import { test, expect, API_URL } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";

/**
 * The cached reports (patient day, prescription, audit, intervention and
 * economy) download a gzipped dataset from a presigned URL. The dataset must
 * stay out of Redux: redux-logger and Redux DevTools serialize and retain every
 * action payload, so only filter options and header metadata may travel in the
 * fetch action. The rows are kept aside and read back on every search.
 */

test.use({ storageState: { cookies: [], origins: [] } });

const PERMISSIONS = [
  "READ_BASIC_FEATURES",
  "READ_PRESCRIPTION",
  "READ_REPORTS",
];

// present in every row but never used as a filter option, so it can only show
// up in an action payload if the rows themselves leaked into it
const ROW_MARKER = "row-marker-7f3a";

const isoDaysAgo = (days: number) =>
  new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);

const buildRow = () => ({
  marker: ROW_MARKER,
  date: isoDaysAgo(2),
  responsible: "Fulano Beltrano",
  prescriber: "Ciclano de Tal",
  department: "UTI Teste",
  segment: "Adulto",
  tags: [],
  insurance: "Convenio Teste",
  checked: true,
  itens: 3,
  checkedItens: 2,
  drug: "Medicamento Teste",
  originDrug: "Medicamento Teste",
  destinyDrug: "Medicamento Teste",
  reason: ["Dose"],
  interventionReasonArray: ["Dose"],
});

const REPORTS = [
  { key: "PATIENT_DAY", path: "/relatorios/pacientes-dia" },
  { key: "PRESCRIPTION", path: "/relatorios/prescricoes" },
  { key: "PRESCRIPTION_AUDIT", path: "/relatorios/audit" },
  { key: "INTERVENTION", path: "/relatorios/intervencoes" },
  { key: "ECONOMY", path: "/relatorios/economia" },
];

for (const report of REPORTS) {
  test(`${report.key}: keeps the cached dataset out of Redux actions`, async ({
    page,
    mockApi,
  }) => {
    // CloudWatch RUM (public/rum-init.js) calls AWS outside the mocked host
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => {
      if (!err.message.startsWith("CWR:")) pageErrors.push(err.message);
    });

    // redux-logger (dev only) logs every dispatched action; capture them
    const actions: { type: string; payload?: unknown }[] = [];
    page.on("console", async (msg) => {
      if (!msg.text().includes("action ")) return;
      const action = await msg
        .args()[2]
        ?.jsonValue()
        .catch(() => null);
      if (action?.type) actions.push(action);
    });

    const cacheUrl = `${API_URL}/cache/${report.key}.json.gz`;
    mockApi.override(`GET /reports/general/${report.key}`, {
      json: {
        status: "success",
        data: { cached: true, url: cacheUrl, availableReports: [] },
      },
    });
    mockApi.override(`GET /cache/${report.key}.json.gz`, (route: any) =>
      route.fulfill({
        status: 200,
        contentType: "application/octet-stream",
        body: gzipSync(
          Buffer.from(
            JSON.stringify({
              header: { date: isoDaysAgo(0), version: "1" },
              body: [buildRow(), buildRow()],
            }),
          ),
        ),
      }),
    );

    await loginWithPermissions(page, mockApi, PERMISSIONS);
    await page.goto(report.path);

    const searchButton = page.locator(".gtm-btn-search");
    await expect(searchButton).toBeVisible({ timeout: 15000 });

    const isFilteredResult = (a: { type: string }) =>
      a.type.endsWith("/setFilteredResult");
    await expect.poll(() => actions.filter(isFilteredResult).length).toBe(2);

    const fulfilled = actions.filter((a) =>
      a.type.endsWith("/fetch-data/fulfilled"),
    );
    expect(fulfilled.length).toBeGreaterThan(0);
    for (const action of fulfilled) {
      expect(action.payload).toMatchObject({ cached: true });
      expect(JSON.stringify(action.payload)).not.toContain(ROW_MARKER);
      // the filter options are still derived from the rows
      expect(JSON.stringify(action.payload)).toContain("Fulano Beltrano");
    }

    // a new search reads the dataset back from outside the store
    await searchButton.click();
    await expect.poll(() => actions.filter(isFilteredResult).length).toBe(3);

    expect(pageErrors).toEqual([]);
  });
}
