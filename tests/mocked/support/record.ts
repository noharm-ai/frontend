/**
 * One-shot recorder to bootstrap fixture payloads from the REAL backend.
 *
 * Prerequisites: the docker test stack must be running (make e2e-up) and
 * the dev server started with VITE_APP_API_URL=http://localhost:5001.
 *
 * Usage:
 *   npx tsx tests/mocked/support/record.ts [path ...]
 *
 * It logs in with TEST_USER / TEST_USER_PASSWORD, visits each path
 * (default: the prioritization cards page and prescription 199) and dumps
 * every JSON response from the API to tests/mocked/fixtures/recorded/.
 * Curate the output (trim lists, replace dates with __DATE_*__ tokens —
 * see defaultHandlers.ts) before promoting files to fixtures/.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const APP_URL = process.env.VITE_APP_URL || "http://localhost:3000";
const API_URL = process.env.VITE_APP_API_URL || "http://localhost:5001";
const OUT_DIR = fileURLToPath(
  new URL("../fixtures/recorded", import.meta.url),
);

const pagesToVisit = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["/priorizacao/pacientes/cards", "/prescricao/199"];

function fileNameFor(method: string, urlPath: string, query: string): string {
  const sanitized = urlPath.replace(/^\//, "").replace(/[^a-zA-Z0-9-]+/g, "_");
  const suffix = query ? `_q_${query.replace(/[^a-zA-Z0-9]+/g, "_")}` : "";
  return `${method}-${sanitized}${suffix}`.slice(0, 150) + ".json";
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  context.on("response", async (response) => {
    if (!response.url().startsWith(API_URL)) {
      return;
    }
    const request = response.request();
    const url = new URL(response.url());
    try {
      const body = await response.json();
      const file = fileNameFor(
        request.method(),
        url.pathname,
        url.search.slice(1),
      );
      fs.writeFileSync(
        path.join(OUT_DIR, file),
        JSON.stringify(body, null, 2),
      );
      console.log(`recorded ${request.method()} ${url.pathname} -> ${file}`);
    } catch {
      // non-JSON response, skip
    }
  });

  console.log("logging in...");
  await page.goto(`${APP_URL}/login`);
  await page.getByPlaceholder("Email").fill(process.env.TEST_USER!);
  await page.getByPlaceholder("Senha").fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole("button", { name: "Acessar" }).click();
  await page.waitForURL(`${APP_URL}/`);
  await page.waitForTimeout(3000);

  for (const pagePath of pagesToVisit) {
    console.log(`visiting ${pagePath}...`);
    await page.goto(`${APP_URL}${pagePath}`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
  }

  await browser.close();
  console.log(`done. Fixtures recorded to ${OUT_DIR}`);
}

main();
