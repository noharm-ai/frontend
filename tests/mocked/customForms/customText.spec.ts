import type { Locator, Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";
import { openSelect, pickMenuItem, pickOption } from "../support/antd";
import { NAVIGATION_VIEWER_PERMISSIONS } from "../support/navigationViewer";

/**
 * The custom text of an evolution form (the "Texto personalizado" tab of
 * src/features/memory/CustomForms/CustomFormEditorPage.tsx).
 *
 * The text is a list of rich text blocks saved inside the form record itself
 * (value.customText.blocks), so it goes out in the same PUT as the questions.
 * A block without conditions is always part of the text; one with conditions
 * only when the answers meet them (all or any, per block). {{questionId}}
 * takes an answer; any other {{variable}} is a clinical note variable, left
 * for the prescription to resolve.
 *
 * What nothing in the payload shows, and these tests pin down: a form whose
 * text names an unknown variable, or a rule on a question that is gone,
 * cannot be saved; and the "Testar texto" preview applies the rules to the
 * answers given there.
 */

const QUESTIONS = [
  {
    id: "peso",
    label: "Peso (kg)",
    type: "number",
    options: [],
    required: false,
  },
  {
    id: "alergia",
    label: "Alergias",
    type: "options",
    options: ["Sim", "Não"],
    required: false,
  },
];

const formWith = (customText?: unknown) => ({
  key: 1,
  value: {
    name: "Avaliação Farmacêutica",
    active: true,
    data: [{ group: "Dados clínicos", questions: QUESTIONS }],
    ...(customText ? { customText } : {}),
  },
});

const TEXT_WITH_RULES = {
  blocks: [
    {
      id: "b1",
      name: "Abertura",
      content: "<p>Peso: {{peso}} kg</p>",
      logic: "and",
      conditions: [],
    },
    {
      id: "b2",
      name: "Alergia",
      content: "<p>Paciente alérgico. Avisar {{nome_paciente}}.</p>",
      logic: "and",
      conditions: [{ questionId: "alergia", operator: "equals", value: "Sim" }],
    },
    {
      id: "b3",
      name: "Peso alto",
      content: "<p>Ajustar dose ao peso.</p>",
      logic: "and",
      conditions: [{ questionId: "peso", operator: "gt", value: 100 }],
    },
  ],
};

const EDITOR_PERMISSIONS = [
  "READ_BASIC_FEATURES",
  "READ_PRESCRIPTION",
  "WRITE_CUSTOM_FORMS",
];

const PATH = "/configuracoes/forms-personalizados";

test.use({ storageState: { cookies: [], origins: [] } });

test.beforeEach(async ({ page, mockApi }, testInfo) => {
  const viewer = testInfo.titlePath.some((t) => t === "as a NAVIGATION_VIEWER");
  await loginWithPermissions(
    page,
    mockApi,
    viewer ? NAVIGATION_VIEWER_PERMISSIONS : EDITOR_PERMISSIONS,
  );
});

const installHandlers = (mockApi: MockApi, forms: unknown[]) => {
  mockApi.override("GET /memory/custom-forms", {
    json: { status: "success", data: forms },
  });
  mockApi.override("PUT /memory/custom-forms/:id", {
    json: { status: "success", data: { id: 1 } },
  });
};

const saveCalls = (mockApi: MockApi) =>
  mockApi.requests
    .filter(
      (r) => r.method === "PUT" && r.path.startsWith("/memory/custom-forms"),
    )
    .map((r) => JSON.parse(r.postData!));

const blocks = (page: Page) => page.getByTestId("text-block");

async function openTextTab(page: Page) {
  await page.goto(`${PATH}/1`);
  await expect(
    page.getByRole("heading", { name: "Avaliação Farmacêutica" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: /Texto personalizado/ }).click();
}

/** Types at the end of the rich text editor of a block. */
async function typeInBlock(block: Locator, text: string) {
  const editor = block.locator(".tiptap");
  await editor.click();
  await editor.press("End");
  await editor.pressSequentially(text);
}

test("a block made of an answer and a conditional block are saved with the form", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi, [formWith()]);
  await openTextTab(page);

  await expect(
    page.getByText("Este formulário ainda não tem texto personalizado."),
  ).toBeVisible();

  // first block: always included, carries the answer of "peso"
  await page.getByRole("button", { name: "Adicionar bloco de texto" }).click();
  const first = blocks(page).nth(0);
  await expect(first.getByText("Sempre incluído no texto.")).toBeVisible();
  await typeInBlock(first, "Peso: ");
  const answers = first.getByRole("button", {
    name: "Respostas do formulário",
  });
  await answers.click();
  await page.getByRole("menuitem", { name: "Dados clínicos" }).hover();
  await page
    .getByRole("menuitem", { name: "Peso (kg) (peso)", exact: true })
    .click();
  await typeInBlock(first, " kg");

  // second block: only when the patient is allergic
  await page.getByRole("button", { name: "Adicionar bloco de texto" }).click();
  const second = blocks(page).nth(1);
  await second.getByPlaceholder("Nome do bloco (opcional)").fill("Alergia");
  await second.getByRole("button", { name: "Adicionar condição" }).click();
  await openSelect(second.getByTestId("text-condition"));
  await pickOption(page, "Alergias (alergia)");
  // the first rule of a single selection is "é igual a"
  await expect(second.getByTestId("text-condition")).toContainText(
    "é igual a",
  );
  await openSelect(
    second
      .getByTestId("text-condition")
      .locator(".ant-select")
      .filter({ has: page.getByLabel("Valor da condição") }),
  );
  await pickOption(page, "Sim");
  await typeInBlock(second, "Paciente alérgico. ");
  await pickMenuItem(
    page,
    second.getByRole("button", { name: "Paciente" }),
    "Nome",
  );

  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page).toHaveURL(new RegExp(`${PATH}$`));

  const [saved] = saveCalls(mockApi);
  expect(saved.value.data).toEqual(formWith().value.data);
  expect(saved.value.customText).toEqual({
    blocks: [
      {
        id: expect.any(String),
        name: "",
        content: "<p>Peso: {{peso}} kg</p>",
        logic: "and",
        conditions: [],
      },
      {
        id: expect.any(String),
        name: "Alergia",
        content: "<p>Paciente alérgico. {{nome_paciente}}</p>",
        logic: "and",
        conditions: [
          { questionId: "alergia", operator: "equals", value: "Sim" },
        ],
      },
    ],
  });
});

test("the test modal builds the text from the answers given there", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi, [formWith(TEXT_WITH_RULES)]);
  await openTextTab(page);
  await expect(blocks(page)).toHaveCount(3);

  await page.getByRole("button", { name: "Testar texto" }).click();
  const modal = page.locator(".ant-modal").filter({
    hasText: "Testar texto personalizado",
  });
  const result = modal.getByTestId("custom-text-result");
  const included = modal.getByTestId("included-blocks");

  // nothing answered: only the block without conditions
  await expect(included).toHaveText("Abertura");
  await expect(result).toHaveText("Peso:  kg");

  await modal.locator(".ant-input-number input").fill("120");
  await openSelect(modal.locator(".ant-select").first());
  await pickOption(page, "Sim");

  await expect(included).toHaveText("AberturaAlergiaPeso alto");
  await expect(result).toContainText("Peso: 120 kg");
  await expect(result).toContainText("Paciente alérgico.");
  await expect(result).toContainText("Ajustar dose ao peso.");
  // the clinical note variable waits for a prescription, marked as such
  await expect(result.locator(".note-variable")).toHaveText(
    "{{nome_paciente}}",
  );

  await modal.locator(".ant-input-number input").fill("80");
  await expect(included).toHaveText("AberturaAlergia");
  await expect(result).not.toContainText("Ajustar dose ao peso.");
});

test("a text with an unknown variable or a rule on a removed question is not saved", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi, [
    formWith({
      blocks: [
        {
          id: "b1",
          content: "<p>Resultado: {{variavel_inexistente}}</p>",
          logic: "and",
          conditions: [
            { questionId: "fumante", operator: "filled", value: null },
          ],
        },
      ],
    }),
  ]);
  await page.goto(`${PATH}/1`);
  await expect(
    page.getByRole("heading", { name: "Avaliação Farmacêutica" }),
  ).toBeVisible();

  // saved from the questions tab: the page opens the text tab on its own
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(
    page.getByText("Verifique o texto personalizado antes de salvar."),
  ).toBeVisible();
  const block = blocks(page).nth(0);
  await expect(block).toBeVisible();
  await expect(
    block.getByText("Variável desconhecida: {{variavel_inexistente}}"),
  ).toBeVisible();
  await expect(
    block.getByText('A questão "fumante" não existe mais no formulário'),
  ).toBeVisible();
  await expect(page.getByText("Formulário com erros")).toBeVisible();

  expect(saveCalls(mockApi)).toEqual([]);
});

test.describe("as a NAVIGATION_VIEWER", () => {
  test("the text is shown read-only but can still be tested", async ({
    page,
    mockApi,
  }) => {
    installHandlers(mockApi, [formWith(TEXT_WITH_RULES)]);
    await openTextTab(page);

    await expect(blocks(page)).toHaveCount(3);
    await expect(
      page.getByRole("button", { name: "Adicionar bloco de texto" }),
    ).toBeDisabled();
    await expect(
      blocks(page).nth(0).locator(".tiptap"),
    ).toHaveAttribute("contenteditable", "false");
    await expect(
      page.getByRole("button", { name: "Testar texto" }),
    ).toBeEnabled();
  });
});
