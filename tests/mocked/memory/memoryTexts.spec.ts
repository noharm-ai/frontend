import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { pickOption } from "../support/antd";

/**
 * The saved texts and filters kept as memory records (GET /memory/:type,
 * PUT /memory[/:id]) and read through the memory store:
 *
 *   - the clinical note texts (MemoryText) of the clinical notes form
 *   - the default observation text of an intervention reason
 *   - the saved filters of the prioritization
 *
 * Covers the load, the save and the failed request of each, so the store
 * behind them can be replaced without the user noticing.
 */

const putMemoryCalls = (mockApi: MockApi) =>
  mockApi.requests.filter(
    (r) => r.method === "PUT" && r.path.startsWith("/memory"),
  );

const memoryList = (records: unknown[]) => ({
  json: { status: "success", data: records },
});

const serverError = { status: 500, json: { status: "error", message: "" } };

test.describe("clinical note texts", () => {
  const openClinicalNotes = async (page: Page) => {
    await page.goto("/prescricao/199");
    await expect(page.getByText("Dipirona 500mg")).toBeVisible();

    await page.locator(".gtm-bt-clinical-notes").click();
    await expect(page.locator(".ant-modal textarea")).toBeVisible();
  };

  // the public texts button is the first one, the private texts the second
  const openTextsMenu = async (page: Page) => {
    const button = page.locator(".ant-modal .gtm-bt-memorytext").first();
    await expect(button).not.toHaveClass(/ant-btn-loading/);
    // leave any menu still open, so the hover opens a fresh one
    await page.mouse.move(0, 0);
    await expect(page.locator(".ant-dropdown:visible")).toHaveCount(0);
    await button.hover();
    await page.getByRole("menuitem", { name: "Aplicar" }).hover();
  };

  test("applies a saved text and saves a new one", async ({
    page,
    mockApi,
  }) => {
    mockApi.override(
      "GET /memory/clinical-notes",
      memoryList([
        {
          key: 7,
          type: "clinical-notes",
          value: [
            { name: "Modelo B", data: "Texto do modelo B" },
            { name: "Modelo A", data: "Texto do modelo A" },
            { name: "Modelo inativo", data: "Inativo", active: false },
          ],
        },
      ]),
    );
    mockApi.override("PUT /memory/:id", {
      json: { status: "success", data: 7 },
    });

    await openClinicalNotes(page);
    await openTextsMenu(page);

    // active texts only, sorted by name
    const options = page.locator("#gtm-btn-memorytext-load:visible");
    await expect(options).toHaveText(["Modelo A", "Modelo B"]);

    await options.filter({ hasText: "Modelo A" }).click();
    await expect(page.locator(".ant-modal textarea").first()).toHaveValue(
      /Texto do modelo A/,
    );

    // save a new text in the same record
    await page.locator(".ant-modal .gtm-bt-memorytext").first().hover();
    await page.getByRole("menuitem", { name: "Novo" }).click();

    const saveModal = page
      .locator(".ant-modal")
      .filter({ hasText: "Nome do texto padrão:" });
    await saveModal.locator("input").fill("Modelo C");
    await saveModal.locator("textarea").fill("Texto do modelo C");
    await saveModal.getByRole("button", { name: "Salvar" }).click();

    await expect.poll(() => putMemoryCalls(mockApi).length).toBe(1);
    const [call] = putMemoryCalls(mockApi);
    expect(call.path).toBe("/memory/7");
    expect(JSON.parse(call.postData!)).toEqual({
      type: "clinical-notes",
      value: [
        { name: "Modelo B", data: "Texto do modelo B" },
        { name: "Modelo A", data: "Texto do modelo A" },
        { name: "Modelo inativo", data: "Inativo", active: false },
        { name: "Modelo C", data: "Texto do modelo C" },
      ],
    });

    // the saved record replaces the list (re-opening an antd submenu right
    // after a modal closes can miss the hover, so retry the whole gesture)
    await expect(async () => {
      await openTextsMenu(page);
      await expect(page.locator("#gtm-btn-memorytext-load:visible")).toHaveText(
        ["Modelo A", "Modelo B", "Modelo C"],
        { timeout: 2000 },
      );
    }).toPass();
  });

  test("reads the private texts from the user's own record", async ({
    page,
    mockApi,
  }) => {
    await openClinicalNotes(page);

    // (the dev build runs effects twice, so compare the distinct paths)
    await expect
      .poll(() =>
        [
          ...new Set(
            mockApi.requests
              .filter(
                (r) =>
                  r.method === "GET" &&
                  r.path.startsWith("/memory/clinical-notes"),
              )
              .map((r) => r.path),
          ),
        ].sort(),
      )
      .toEqual(["/memory/clinical-notes", "/memory/clinical-notes-private_1"]);
  });

  test("shows no texts when the request fails", async ({ page, mockApi }) => {
    mockApi.override("GET /memory/clinical-notes", serverError);

    await openClinicalNotes(page);
    await openTextsMenu(page);

    await expect(
      page.getByText("Nenhum texto padrão encontrado."),
    ).toBeVisible();
  });
});

test.describe("intervention default observation", () => {
  const reasonsFixture = {
    status: "success",
    data: [
      {
        id: 1,
        name: "Ajuste de Dose",
        parentName: null,
        parenName: null,
        relationType: 0,
        suspension: false,
        substitution: false,
        customEconomy: false,
        ram: false,
        blocking: false,
      },
    ],
  };

  const openWithReason = async (page: Page) => {
    await page.goto("/prescricao/199");
    await expect(page.getByText("Dipirona 500mg")).toBeVisible();

    await page.locator(".gtm-bt-interv").first().click();
    await expect(page.locator(".ant-modal")).toBeVisible();
    await page
      .locator(".ant-select.ant-select-loading")
      .waitFor({ state: "detached" });

    await page.locator("#reason").click();
    await pickOption(page, "Ajuste de Dose");
    await page.keyboard.press("Escape"); // close the dropdown
    await expect(page.locator(".ant-select-dropdown:visible")).toHaveCount(0);
  };

  test.beforeEach(({ mockApi }) => {
    mockApi.override("GET /intervention/reasons", { json: reasonsFixture });
  });

  test("applies the saved text of the reason", async ({ page, mockApi }) => {
    mockApi.override(
      "GET /memory/reasonsDefaultText-1",
      memoryList([
        {
          key: 5,
          type: "reasonsDefaultText-1",
          value: { text: "Texto modelo do motivo" },
        },
      ]),
    );

    await openWithReason(page);
    await page.locator(".gtm-bt-interv-mem-apply").click();

    await expect(
      page.getByText("Observação modelo aplicada com sucesso!"),
    ).toBeVisible();
    await expect(page.locator(".ant-modal textarea").first()).toHaveValue(
      "Texto modelo do motivo",
    );
  });

  test("warns when the reason has no saved text", async ({ page }) => {
    await openWithReason(page);
    await page.locator(".gtm-bt-interv-mem-apply").click();

    await expect(
      page.getByText("Este motivo ainda não possui um modelo salvo"),
    ).toBeVisible();
  });

  test("updates the saved text of the reason", async ({ page, mockApi }) => {
    mockApi.override(
      "GET /memory/reasonsDefaultText-1",
      memoryList([
        {
          key: 5,
          type: "reasonsDefaultText-1",
          value: { text: "Texto antigo" },
        },
      ]),
    );
    mockApi.override("PUT /memory/:id", {
      json: { status: "success", data: 5 },
    });

    await openWithReason(page);
    await page.locator(".gtm-bt-interv-mem-save").click();

    // the default text modal opens on top of the intervention modal
    const modal = page.locator(".ant-modal").last();
    await expect(modal.locator("textarea")).toHaveValue("Texto antigo");
    await modal.locator("textarea").fill("Texto novo");
    await modal.getByRole("button", { name: "Salvar" }).click();

    await expect(
      page.getByText("Observação modelo aplicada com sucesso!"),
    ).toBeVisible();

    await expect.poll(() => putMemoryCalls(mockApi).length).toBe(1);
    const [call] = putMemoryCalls(mockApi);
    expect(call.path).toBe("/memory/5");
    expect(JSON.parse(call.postData!)).toEqual({
      type: "reasonsDefaultText-1",
      value: { text: "Texto novo" },
    });

    // the save buttons stop loading once the request is answered
    await expect(page.locator(".gtm-bt-interv-mem-save")).not.toHaveClass(
      /ant-btn-loading/,
    );
    // the save only shows the "applied" message, never a second one
    await page.waitForTimeout(500);
    await expect(
      page.getByText("Uhu! Observação modelo salva com sucesso!"),
    ).toHaveCount(0);
  });

  test("shows an error when the saved text can't be read", async ({
    page,
    mockApi,
  }) => {
    mockApi.override("GET /memory/reasonsDefaultText-1", serverError);

    await openWithReason(page);
    await page.locator(".gtm-bt-interv-mem-apply").click();

    await expect(
      page.getByText("Ops! Algo de errado aconteceu."),
    ).toBeVisible();
    await expect(page.locator(".gtm-bt-interv-mem-apply")).not.toHaveClass(
      /ant-btn-loading/,
    );
  });
});

test.describe("prioritization saved filters", () => {
  const openFilterMenu = async (page: Page) => {
    await page.goto("/priorizacao/pacientes/cards");
    await page.locator(".gtm-btn-filter").click();
  };

  test("loads the private and public filters and saves a new one", async ({
    page,
    mockApi,
  }) => {
    mockApi.override(
      "GET /memory/filter-public",
      memoryList([
        {
          key: 11,
          type: "filter-public",
          value: [{ name: "Filtro da equipe", data: { pending: 1 } }],
        },
      ]),
    );
    mockApi.override(
      "GET /memory/filter-private_1",
      memoryList([
        {
          key: 12,
          type: "filter-private_1",
          value: [{ name: "Meu filtro", data: { pending: 0 } }],
        },
      ]),
    );
    mockApi.override("PUT /memory/:id", {
      json: { status: "success", data: 11 },
    });

    await openFilterMenu(page);

    await page.getByRole("menuitem", { name: "Filtros públicos" }).hover();
    await expect(
      page.getByRole("menuitem", { name: "Filtro da equipe" }),
    ).toBeVisible();
    await page.getByRole("menuitem", { name: "Filtros privados" }).hover();
    await expect(
      page.getByRole("menuitem", { name: "Meu filtro" }),
    ).toBeVisible();

    // save the current filter as public
    await page.getByRole("menuitem", { name: "Salvar filtro atual" }).click();
    const modal = page
      .locator(".ant-modal")
      .filter({ hasText: "Nome do filtro:" });
    await modal.locator("input").fill("Outro filtro");
    await modal.getByRole("switch").click();
    await modal.getByRole("button", { name: "Salvar" }).click();
    await expect(
      page.getByText("Uhu! Filtro salvo com sucesso!"),
    ).toBeVisible();

    await expect.poll(() => putMemoryCalls(mockApi).length).toBe(1);
    const [call] = putMemoryCalls(mockApi);
    expect(call.path).toBe("/memory/11");
    const body = JSON.parse(call.postData!);
    expect(body.type).toBe("filter-public");
    expect(body.value.map((f: { name: string }) => f.name)).toEqual([
      "Filtro da equipe",
      "Outro filtro",
    ]);

    // the saved record replaces the public list
    await page.locator(".gtm-btn-filter").click();
    await page.getByRole("menuitem", { name: "Filtros públicos" }).hover();
    await expect(
      page.getByRole("menuitem", { name: "Outro filtro" }),
    ).toBeVisible();
  });

  test("keeps loading when the public filters can't be read", async ({
    page,
    mockApi,
  }) => {
    mockApi.override("GET /memory/filter-public", serverError);

    await openFilterMenu(page);

    await expect
      .poll(
        () =>
          mockApi.requests.filter((r) => r.path === "/memory/filter-public")
            .length,
      )
      .toBe(1);
    await expect(
      page.locator(".gtm-btn-filter .anticon-loading"),
    ).toBeVisible();
    await page.getByRole("menuitem", { name: "Filtros públicos" }).hover();
    await expect(
      page.getByRole("menuitem", { name: "Nenhum filtro disponível." }),
    ).toBeVisible();
  });
});
