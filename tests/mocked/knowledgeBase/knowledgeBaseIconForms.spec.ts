import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";
import { loginWithPermissions } from "../support/featureLogin";

/**
 * Knowledge base icon in the intervention forms
 * (src/components/Forms/Intervention, features/intervention/InterventionOutcome).
 *
 * The forms open over several screens, so their icons are `global`: a pin made
 * from them defaults to every screen and shows wherever the form opens.
 */

const FORM_ICON = '[data-kb="intervention.form.articles"]';
const OUTCOME_ICON = '[data-kb="interventionOutcome.form.articles"]';

const article = (id: number, title: string) => ({
  id,
  title,
  description: `Resumo de ${title}`,
});

const ok = (data: unknown) => ({ json: { status: "success", data } });

// pinned for every screen, as these icons default to
const ELEMENTS = [
  {
    page: "*",
    selector: FORM_ICON,
    label: "Intervenção",
    articles: [article(1, "Registrando intervenções")],
  },
  {
    page: "*",
    selector: OUTCOME_ICON,
    label: "Desfecho da intervenção",
    articles: [article(2, "Desfechos")],
  },
];

const reason = {
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
};

const pendingIntervention = {
  idIntervention: 301,
  id: "0",
  idPrescription: "199",
  idPrescriptionDrug: "0",
  admissionNumber: 9999,
  drugName: "Dipirona 500mg",
  status: "s",
  date: new Date().toISOString().slice(0, 19),
  reasonDescription: "Ajuste de Dose",
};

const popoverArticles = (page: Page) => page.locator(".kb-article strong");

const openInterventionForm = async (page: Page) => {
  await page.goto("/prescricao/199");
  await expect(page.getByText("Dipirona 500mg").first()).toBeVisible();

  await page.locator(".gtm-bt-interv").first().click();
  await expect(page.locator(".ant-modal")).toBeVisible();
  // done zooming in: once it ends, the modal takes the focus back, and a
  // modal opened over it before that would lose it
  await expect(page.locator(".ant-modal")).not.toHaveClass(/ant-zoom/);
};

test.beforeEach(({ mockApi }) => {
  mockApi.override("GET /knowledge-base/elements", ok(ELEMENTS));
  mockApi.override("GET /intervention/reasons", ok([reason]));
});

test("the intervention form shows its articles", async ({ page }) => {
  await openInterventionForm(page);

  const modal = page.locator(".ant-modal");
  await modal.locator(FORM_ICON).click();

  // over the modal, and the form stays open under it
  await expect(popoverArticles(page)).toHaveText(["Registrando intervenções"]);
  await expect(modal).toBeVisible();
});

test("the outcome form shows its articles", async ({ page, mockApi }) => {
  const prescription = loadFixture<{ data: { interventions: unknown[] } }>(
    "prescriptions/single-199.json",
  );
  prescription.data.interventions = [pendingIntervention];
  mockApi.override("GET /prescriptions/:id", { json: prescription });
  mockApi.override("GET /intervention/outcome-data", (route) => {
    const fixture = loadFixture<{ data: { idIntervention: number } }>(
      "interventions/outcome-data-null.json",
    );
    fixture.data.idIntervention = 301;
    return route.fulfill({ status: 200, json: fixture });
  });

  await page.goto("/prescricao/199");
  await expect(page.getByText("Dipirona 500mg").first()).toBeVisible();
  await page.getByRole("tab", { name: /Intervenções/ }).click();
  await page.locator(".gtm-bt-tab-interv-status").first().click();
  await page.getByRole("menuitem", { name: "Aceita", exact: true }).click();

  const modal = page.locator(".ant-modal", {
    hasText: "Aceitar Intervenção",
  });
  await modal.locator(OUTCOME_ICON).click();
  await expect(popoverArticles(page)).toHaveText(["Desfechos"]);
});

test.describe("curator", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  const saves = (mockApi: MockApi) =>
    mockApi.requests
      .filter(
        (r) => r.method === "PUT" && r.path === "/knowledge-base/elements",
      )
      .map((r) => JSON.parse(r.postData ?? "{}"));

  test("pins the form's articles for every screen by default", async ({
    page,
    mockApi,
  }) => {
    mockApi.override("GET /knowledge-base/elements", ok([]));
    mockApi.override(
      "GET /knowledge-base/articles",
      ok([
        {
          ...article(1, "Registrando intervenções"),
          path: [],
          link: null,
          hasContent: true,
          updatedAt: null,
        },
      ]),
    );
    mockApi.override("PUT /knowledge-base/elements", ok(ELEMENTS[0]));
    const auth = loadFixture<{ permissions: string[] }>(
      "auth/authenticate.json",
    );
    await loginWithPermissions(page, mockApi, [
      ...auth.permissions,
      "WRITE_HELP_TEXT",
    ]);
    await openInterventionForm(page);

    await page.locator(".ant-modal").locator(FORM_ICON).click();
    await page.getByRole("button", { name: "Vincular artigos" }).click();

    const editor = page.locator(".ant-modal", {
      hasText: "Adicionar ajuda ao elemento",
    });
    await expect(
      editor.getByRole("radio", { name: "Todas as telas" }),
    ).toBeChecked();

    await editor.getByRole("combobox").last().click();
    await page.getByTitle("Registrando intervenções").click();
    await editor.getByRole("button", { name: "Salvar" }).click();

    await expect
      .poll(() => saves(mockApi))
      .toEqual([
        {
          page: "*",
          selector: FORM_ICON,
          label: "Intervenção",
          articleIds: [1],
        },
      ]);
  });
});
