import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";

/**
 * Prescription search (src/components/Layout/SearchPrescription): the box in
 * the header of every page, also reused by the discharge summary search
 * (/sumario-alta). GET /prescriptions/search?term= returns prescriptions,
 * aggregated prescriptions (admissions), conciliations and regulation
 * solicitations; each result opens in a new tab.
 */

const ANY_PAGE = "/novidades";
const PLACEHOLDER = "Buscar por nº de atendimento ou prescrição (Ctrl + k)";

const results = [
  {
    type: "prescription",
    idPrescription: "199",
    admissionNumber: 5005,
    date: "2026-03-01T10:00:00",
    birthdate: "1980-05-10T00:00:00",
    gender: "F",
    department: "Setor Teste",
    status: "0",
    agg: false,
    concilia: null,
  },
  {
    type: "prescription",
    idPrescription: "92600000000005005",
    admissionNumber: 5005,
    date: "2026-03-02T10:00:00",
    gender: "M",
    status: "s",
    agg: true,
    concilia: null,
  },
  {
    type: "prescription",
    idPrescription: "300",
    admissionNumber: 5005,
    date: null,
    status: "0",
    agg: false,
    concilia: "s",
  },
  {
    type: "regulation",
    idPrescription: "reg-55",
    idRegSolicitation: 55,
    date: "2026-03-03T10:00:00",
    status: 0,
  },
];

/** Answers the search with `data`, recording each searched term. */
const mockSearch = (mockApi: MockApi, data: unknown[]) => {
  const terms: string[] = [];
  mockApi.override("GET /prescriptions/search", async (route) => {
    terms.push(new URL(route.request().url()).searchParams.get("term") ?? "");
    await route.fulfill({ json: { status: "success", data } });
  });
  return terms;
};

const searchBox = (page: Page) => page.getByPlaceholder(PLACEHOLDER);
const resultItems = (page: Page) =>
  page.locator(".search-result.open > div[data-id]");

test("lists every kind of result with its tags", async ({ page, mockApi }) => {
  const terms = mockSearch(mockApi, results);

  await page.goto(ANY_PAGE);
  await searchBox(page).fill("5005");
  await searchBox(page).press("Enter");

  await expect(resultItems(page)).toHaveCount(4);
  expect(terms).toEqual(["5005"]);

  const prescription = resultItems(page).nth(0);
  await expect(prescription).toContainText("Prescrição 199 - 01/03/2026");
  await expect(prescription).toContainText("Feminino");
  await expect(prescription).toContainText("Setor Teste");
  await expect(prescription).toContainText(/\d+a/);
  await expect(prescription).toContainText("Pendente");

  const admission = resultItems(page).nth(1);
  await expect(admission).toContainText("Atendimento 5005 - 02/03/2026");
  await expect(admission).toContainText("Masculino");
  await expect(admission).toContainText("Checada");

  await expect(resultItems(page).nth(2)).toContainText("Conciliação 5005 - --");
  await expect(resultItems(page).nth(3)).toContainText(
    "Regulação nº: 55 - 03/03/2026",
  );
});

test("opens the prescription in a new tab", async ({ page, mockApi }) => {
  mockSearch(mockApi, results);

  await page.goto(ANY_PAGE);
  await searchBox(page).fill("199");
  await searchBox(page).press("Enter");

  const popupPromise = page.waitForEvent("popup");
  await resultItems(page).nth(0).click();
  const popup = await popupPromise;

  await expect(popup).toHaveURL(/\/prescricao\/199$/);
  await expect(
    popup.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible({ timeout: 15000 });

  // the result list closes behind it
  await expect(page.locator(".search-result.open")).toHaveCount(0);
});

test.describe("navigation targets", () => {
  // window.open is stubbed: the target pages are covered by their own specs
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const opened: string[] = [];
      (window as unknown as { __opened: string[] }).__opened = opened;
      window.open = (url?: string | URL) => {
        opened.push(String(url));
        return null;
      };
    });
  });

  const opened = (page: Page) =>
    page.evaluate(() => (window as unknown as { __opened: string[] }).__opened);

  test("arrow keys + Enter open the highlighted result", async ({
    page,
    mockApi,
  }) => {
    mockSearch(mockApi, results);

    await page.goto(ANY_PAGE);
    await searchBox(page).fill("5005");
    await searchBox(page).press("Enter");
    await expect(resultItems(page)).toHaveCount(4);

    // hovering marks a result active, the arrows move from there
    await resultItems(page).nth(0).hover();
    await expect(resultItems(page).nth(0)).toHaveClass("active");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect(resultItems(page).nth(2)).toHaveClass("active");
    await page.keyboard.press("Enter");

    // conciliations open on their own screen
    await expect.poll(() => opened(page)).toEqual(["/conciliacao/300"]);
  });

  test("the summary search opens the discharge summary of the admission", async ({
    page,
    mockApi,
  }) => {
    mockSearch(mockApi, [results[0]]);

    await page.goto("/sumario-alta");

    await expect(
      page.getByRole("heading", { name: "Sumário de Alta", level: 1 }),
    ).toBeVisible();
    await expect(page.getByText("Buscar pacientes")).toBeVisible();

    const box = page.locator("main").getByPlaceholder(PLACEHOLDER);
    await box.fill("199");
    await box.press("Enter");

    const item = page.locator("main .search-result.open > div[data-id]");
    await expect(item).toHaveCount(1);
    // no checked/pending status on the summary search
    await expect(item).not.toContainText("Pendente");

    await item.click();
    await expect.poll(() => opened(page)).toEqual(["/sumario-alta/5005"]);
  });
});

test("shows the empty state when nothing matches", async ({
  page,
  mockApi,
}) => {
  mockSearch(mockApi, []);

  await page.goto(ANY_PAGE);
  await searchBox(page).fill("123456");
  await searchBox(page).press("Enter");

  await expect(
    page.locator(".search-result.open").getByText("Nenhum registro encontrado"),
  ).toBeVisible();
  await expect(resultItems(page)).toHaveCount(0);
});

test("rejects terms that can't be an id without searching", async ({
  page,
  mockApi,
}) => {
  const terms = mockSearch(mockApi, results);

  await page.goto(ANY_PAGE);

  // too short: silently ignored
  await searchBox(page).fill("1");
  await searchBox(page).press("Enter");

  // longer than any id: rejected
  await searchBox(page).fill("12345678901234567890");
  await searchBox(page).press("Enter");
  await expect(
    page.locator(".ant-notification-notice").getByText("Número inválido."),
  ).toBeVisible();

  await expect(page.locator(".search-result.open")).toHaveCount(0);
  expect(terms).toEqual([]);
});

test("Ctrl+K focuses the search box", async ({ page }) => {
  await page.goto(ANY_PAGE);
  await expect(searchBox(page)).toBeVisible();
  await expect(searchBox(page)).not.toBeFocused();

  await page.locator("body").press("Control+k");

  await expect(searchBox(page)).toBeFocused();
});
