import { test, expect, type MockApi } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";

/**
 * The exams the antimicrobial timeline opens with
 * (src/features/infectionControl/TimelineExams), a tab of the infection
 * control settings (Configuração, on the worklist header).
 *
 * Each schema chooses the exams plotted under the courses, in order
 * (GET/PUT /infection-control/timeline-exams); while it never chose, the
 * NoHarm default ones. Anyone who sees the worklist reads them; only the
 * infection control (WRITE_INFECTION_CONTROL) changes them. The tab tells
 * when and by whom they were changed and shows the version replaced.
 */

const ENDPOINT = "GET /infection-control/timeline-exams";
const SAVE = "PUT /infection-control/timeline-exams";

const BASE_PERMISSIONS = [
  "READ_BASIC_FEATURES",
  "WRITE_BASIC_FEATURES",
  "READ_PRESCRIPTION",
  "READ_SUPPORT",
];

const CRP = { examRef: "pcru", name: "PCR", available: true };
const CKD = { examRef: "ckd", name: "CKD-EPI", available: true };
const CKD21 = { examRef: "ckd21", name: "CKD-EPI 2021", available: false };
const LEUKOCYTES = {
  examRef: "h_conleuc",
  name: "Leucócitos Absoluto",
  available: true,
};
const DEFAULT_EXAMS = [CRP, CKD, CKD21, LEUKOCYTES];
const OPTIONS = [
  { examRef: "ckd", name: "CKD-EPI" },
  { examRef: "h_conleuc", name: "Leucócitos Absoluto" },
  { examRef: "pcru", name: "PCR" },
  { examRef: "zz_proc", name: "ZZ Procalcitonina Teste" },
];

/** The schema that never chose its exams */
const DEFAULT_RESPONSE = {
  exams: DEFAULT_EXAMS,
  default: true,
  updatedAt: null,
  updatedBy: null,
  previous: null,
  defaultExams: DEFAULT_EXAMS,
  options: OPTIONS,
};

/** The schema that chose leukocytes and CRP, after the default */
const CHOSEN_RESPONSE = {
  ...DEFAULT_RESPONSE,
  exams: [LEUKOCYTES, CRP],
  default: false,
  updatedAt: "2026-11-10T09:15:00",
  updatedBy: "Maria Teste",
  previous: {
    exams: [CRP, LEUKOCYTES],
    updatedAt: "2026-11-02T14:00:00",
    updatedBy: "NoHarm",
  },
};

const mockExams = (mockApi: MockApi, data: unknown) =>
  mockApi.override(ENDPOINT, { json: { status: "success", data } });

/** Opens the settings from the worklist header, on the timeline exams tab */
const openTimelineExams = async (page: import("@playwright/test").Page) => {
  await page.goto("/controle-infeccao");
  await page
    .getByRole("button", { name: "Configuração" })
    .click({ timeout: 15000 });
  const settings = page.getByTestId("infection-control-settings");
  await settings.getByRole("tab", { name: "Exames da linha do tempo" }).click();
  const tab = settings.getByTestId("timeline-exams");
  await expect(tab).toBeVisible();
  return tab;
};

const examNames = (tab: import("@playwright/test").Locator) =>
  tab
    .getByTestId("timeline-exam")
    .locator(".timeline-exam-name > span:first-child");

test.describe("with WRITE_INFECTION_CONTROL", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page, mockApi }) => {
    await loginWithPermissions(page, mockApi, [
      ...BASE_PERMISSIONS,
      "READ_INFECTION_CONTROL",
      "WRITE_INFECTION_CONTROL",
    ]);
  });

  test("starts from the default exams and saves the list in order", async ({
    page,
    mockApi,
  }) => {
    mockExams(mockApi, DEFAULT_RESPONSE);
    mockApi.override(SAVE, {
      json: { status: "success", data: CHOSEN_RESPONSE },
    });

    const tab = await openTimelineExams(page);

    await expect(tab).toContainText(
      "Este hospital usa os exames padrão da NoHarm.",
    );
    await expect(examNames(tab)).toHaveText([
      "PCR",
      "CKD-EPI",
      "CKD-EPI 2021",
      "Leucócitos Absoluto",
    ]);
    // a default exam no exam of the hospital is mapped to
    await expect(tab.getByTestId("timeline-exam").nth(2)).toContainText(
      "Sem exame do hospital mapeado",
    );
    // the list is the default: nothing to restore
    await expect(
      tab.getByRole("button", { name: "Usar exames padrão" }),
    ).toHaveCount(0);

    // out with both CKDs, leukocytes moved to the top, procalcitonin added
    const row = (name: string) =>
      tab.getByTestId("timeline-exam").filter({ hasText: name });
    await row("CKD-EPI 2021").getByRole("button", { name: "Remover" }).click();
    await row("CKD-EPI").getByRole("button", { name: "Remover" }).click();
    await row("Leucócitos")
      .getByRole("button", { name: "Mover para cima" })
      .click();
    await tab.getByRole("combobox", { name: "Adicionar exame" }).fill("proca");
    await page
      .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
      .getByText("ZZ Procalcitonina Teste", { exact: true })
      .click();
    await expect(examNames(tab)).toHaveText([
      "Leucócitos Absoluto",
      "PCR",
      "ZZ Procalcitonina Teste",
    ]);
    await expect(
      tab.getByRole("button", { name: "Usar exames padrão" }),
    ).toBeVisible();

    await tab.getByRole("button", { name: "Salvar" }).click();

    await expect(page.getByText(/Exames salvos/)).toBeVisible();
    const saved = mockApi.requests.filter(
      (r) =>
        r.method === "PUT" && r.path === "/infection-control/timeline-exams",
    );
    expect(saved).toHaveLength(1);
    expect(JSON.parse(saved[0].postData!)).toEqual({
      exams: ["h_conleuc", "pcru", "zz_proc"],
    });
    // the tab stays open on the list as saved
    await expect(examNames(tab)).toHaveText(["Leucócitos Absoluto", "PCR"]);
    await expect(tab.getByTestId("setting-updated")).toContainText(
      "Alterada em 10/11/2026 09:15 por Maria Teste",
    );
  });

  test("restores the default exams", async ({ page, mockApi }) => {
    mockExams(mockApi, CHOSEN_RESPONSE);

    const tab = await openTimelineExams(page);
    await expect(examNames(tab)).toHaveText(["Leucócitos Absoluto", "PCR"]);
    await expect(tab).not.toContainText("exames padrão da NoHarm");

    await tab.getByRole("button", { name: "Usar exames padrão" }).click();

    await expect(examNames(tab)).toHaveText([
      "PCR",
      "CKD-EPI",
      "CKD-EPI 2021",
      "Leucócitos Absoluto",
    ]);
  });
});

test.describe("with READ_INFECTION_CONTROL only", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page, mockApi }) => {
    await loginWithPermissions(page, mockApi, [
      ...BASE_PERMISSIONS,
      "READ_INFECTION_CONTROL",
    ]);
  });

  test("reads the exams and their previous version but cannot change them", async ({
    page,
    mockApi,
  }) => {
    mockExams(mockApi, CHOSEN_RESPONSE);

    const tab = await openTimelineExams(page);

    await expect(examNames(tab)).toHaveText(["Leucócitos Absoluto", "PCR"]);
    await expect(tab).toContainText(
      "Somente o controle de infecção pode alterar estes exames.",
    );
    await expect(tab.getByRole("combobox")).toHaveCount(0);
    await expect(tab.getByRole("button", { name: "Salvar" })).toHaveCount(0);
    await expect(tab.getByRole("button", { name: "Remover" })).toHaveCount(0);

    await tab.getByRole("button", { name: "Ver versão anterior" }).click();
    const previous = tab.getByTestId("setting-previous");
    await expect(previous).toContainText(
      "Alterada em 02/11/2026 14:00 por NoHarm",
    );
    await expect(examNames(previous)).toHaveText([
      "PCR",
      "Leucócitos Absoluto",
    ]);
  });
});
