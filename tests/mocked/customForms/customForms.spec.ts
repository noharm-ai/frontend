import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";
import { openSelect, pickOption } from "../support/antd";

/**
 * Custom evolution forms (/configuracoes/forms-personalizados,
 * src/features/memory/CustomForms).
 *
 * The whole feature is one memory record of type "custom-forms": the list
 * reads it from GET /memory/custom-forms and every save is a single PUT that
 * carries the complete form. The editor is a Formik form validated by Yup,
 * and two of its rules are worth pinning down because nothing in the payload
 * shows them: every question needs an id, and those ids must be unique across
 * the *whole* form, not just inside a group.
 *
 * The list also feeds the editor through the URL — "Duplicar" navigates to
 * new?copyFrom=<key> and the copy is saved as a new record (a PUT without the
 * id in the path), which is the only way a second form is ever created.
 */

const FORMS = [
  {
    key: 1,
    value: {
      name: "Avaliação Farmacêutica",
      active: true,
      data: [
        {
          group: "Dados clínicos",
          questions: [
            {
              id: "peso",
              label: "Peso (kg)",
              type: "number",
              options: [],
              required: true,
            },
            {
              id: "alergia",
              label: "Alergias",
              type: "options",
              options: ["Sim", "Não"],
              required: false,
            },
          ],
        },
      ],
    },
  },
  {
    key: 2,
    value: {
      name: "Acompanhamento",
      active: false,
      data: [
        {
          group: "Primeira consulta",
          questions: [
            {
              id: "q1",
              label: "Pergunta 1",
              type: "text",
              options: [],
              required: false,
            },
          ],
        },
        {
          group: "Retorno",
          questions: [
            {
              id: "q2",
              label: "Pergunta 2",
              type: "text",
              options: [],
              required: false,
            },
          ],
        },
      ],
    },
  },
];

const LIST_PATH = "/configuracoes/forms-personalizados";

const rows = (page: Page) => page.locator(".ant-table-tbody tr.ant-table-row");

const saveCalls = (mockApi: MockApi) =>
  mockApi.requests
    .filter(
      (r) => r.method === "PUT" && r.path.startsWith("/memory/custom-forms"),
    )
    .map((r) => ({ path: r.path, body: JSON.parse(r.postData!) }));

const installHandlers = (mockApi: MockApi, forms: unknown[] = FORMS) => {
  mockApi.override("GET /memory/custom-forms", {
    json: { status: "success", data: forms },
  });
  mockApi.override("PUT /memory/custom-forms", {
    json: { status: "success", data: { id: 3 } },
  });
  mockApi.override("PUT /memory/custom-forms/:id", {
    json: { status: "success", data: { id: 1 } },
  });
};

/** The question card fields carry no id, so they are reached by placeholder. */
const questionId = (page: Page, index: number) =>
  page.getByPlaceholder("identificador-unico").nth(index);

const questionLabel = (page: Page, index: number) =>
  page.getByPlaceholder("Texto da pergunta").nth(index);

async function openList(page: Page) {
  await page.goto(LIST_PATH);
  await expect(
    page.getByRole("heading", { name: "Formulários de evolução" }),
  ).toBeVisible();
}

async function openEditor(page: Page, path: string, title: string) {
  await page.goto(path);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
}

test("the list counts the groups and the questions of each form", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi);
  await openList(page);

  await expect(rows(page)).toHaveCount(2);

  // sorted by name, so the inactive one comes first
  await expect(rows(page).nth(0)).toContainText("Acompanhamento");
  await expect(rows(page).nth(0).locator(".ant-tag")).toHaveText("Não");
  // two groups holding one question each
  await expect(rows(page).nth(0).locator("td").nth(2)).toHaveText("2");
  await expect(rows(page).nth(0).locator("td").nth(3)).toHaveText("2");

  await expect(rows(page).nth(1)).toContainText("Avaliação Farmacêutica");
  await expect(rows(page).nth(1).locator(".ant-tag")).toHaveText("Sim");
  // one group holding two questions
  await expect(rows(page).nth(1).locator("td").nth(2)).toHaveText("1");
  await expect(rows(page).nth(1).locator("td").nth(3)).toHaveText("2");
});

test("editing a form saves the whole record under its own id", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi);
  await openEditor(page, `${LIST_PATH}/1`, "Avaliação Farmacêutica");

  await page
    .getByPlaceholder("Nome do formulário")
    .fill("Avaliação Farmacêutica v2");
  await questionLabel(page, 0).fill("Peso atual (kg)");

  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page).toHaveURL(new RegExp(`${LIST_PATH}$`));
  await expect(page.getByText("Uhu! Salvo com sucesso! :)")).toBeVisible();

  expect(saveCalls(mockApi)).toEqual([
    {
      path: "/memory/custom-forms/1",
      body: {
        type: "custom-forms",
        value: {
          name: "Avaliação Farmacêutica v2",
          active: true,
          data: [
            {
              group: "Dados clínicos",
              questions: [
                {
                  id: "peso",
                  label: "Peso atual (kg)",
                  type: "number",
                  options: [],
                  required: true,
                },
                {
                  id: "alergia",
                  label: "Alergias",
                  type: "options",
                  options: ["Sim", "Não"],
                  required: false,
                },
              ],
            },
          ],
        },
      },
    },
  ]);
});

test("a question that stops being a selection loses its options", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi);
  await openEditor(page, `${LIST_PATH}/1`, "Avaliação Farmacêutica");

  // the second question is the "options" one; its Select sits between the
  // question label and the options tags
  const typeSelect = page
    .locator(".ant-select")
    .filter({ hasText: "Seleção única" })
    .first();
  await openSelect(typeSelect);
  await pickOption(page, "Texto simples");

  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page).toHaveURL(new RegExp(`${LIST_PATH}$`));

  const saved = saveCalls(mockApi)[0].body as any;
  expect(saved.value.data[0].questions[1]).toMatchObject({
    id: "alergia",
    type: "plaintext",
    options: [],
  });
});

test("a form cannot be saved with empty required fields", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi);
  await openEditor(page, `${LIST_PATH}/new`, "Novo Formulário");

  await page.getByRole("button", { name: "Salvar" }).click();

  // name, group, question id and question label
  await expect(page.locator(".form-error")).toHaveCount(4);
  await expect(page.locator(".form-error").first()).toHaveText(
    "Campo obrigatório",
  );
  await expect(page.getByText("Formulário com erros")).toBeVisible();
  // the group tab is flagged as well, so the error is findable with the
  // panel closed
  await expect(
    page.getByRole("tab").locator(".anticon-exclamation-circle"),
  ).toBeVisible();

  expect(saveCalls(mockApi)).toEqual([]);
});

test("two questions cannot share an id", async ({ page, mockApi }) => {
  installHandlers(mockApi);
  await openEditor(page, `${LIST_PATH}/new`, "Novo Formulário");

  await page.getByPlaceholder("Nome do formulário").fill("Formulário Teste");
  await page.getByPlaceholder("Nome do grupo").fill("Grupo único");

  await questionId(page, 0).fill("peso");
  await questionLabel(page, 0).fill("Peso");

  await page.getByRole("button", { name: "Adicionar Questão" }).click();
  // spaces are stripped from the id as it is typed
  await questionId(page, 1).fill("pe so");
  await questionLabel(page, 1).fill("Peso novamente");

  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("ID duplicado")).toHaveCount(2);
  expect(saveCalls(mockApi)).toEqual([]);

  // fixing one of them clears the error and lets the form through
  await questionId(page, 1).fill("altura");
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page).toHaveURL(new RegExp(`${LIST_PATH}$`));
  const saved = saveCalls(mockApi)[0];
  expect(saved.path).toBe("/memory/custom-forms");
  expect((saved.body as any).value.data[0].questions.map((q: any) => q.id))
    .toEqual(["peso", "altura"]);
});

test("duplicating a form prefills the copy and saves it as a new record", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi);
  await openList(page);

  // "Avaliação Farmacêutica" is the second row once the list is sorted
  await rows(page)
    .nth(1)
    .locator("button")
    .first()
    .click();

  await expect(page).toHaveURL(new RegExp(`${LIST_PATH}/new\\?copyFrom=1$`));
  await expect(page.getByPlaceholder("Nome do formulário")).toHaveValue(
    "Cópia de Avaliação Farmacêutica",
  );
  await expect(questionId(page, 0)).toHaveValue("peso");

  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page).toHaveURL(new RegExp(`${LIST_PATH}$`));

  // no id in the path: the copy is created, the source is left untouched
  expect(saveCalls(mockApi)).toHaveLength(1);
  expect(saveCalls(mockApi)[0].path).toBe("/memory/custom-forms");
  expect((saveCalls(mockApi)[0].body as any).value.name).toBe(
    "Cópia de Avaliação Farmacêutica",
  );
});

test("the raw JSON of a form is out of reach without MAINTAINER", async ({
  page,
  mockApi,
}) => {
  installHandlers(mockApi);
  await openEditor(page, `${LIST_PATH}/1`, "Avaliação Farmacêutica");

  await expect(page.getByRole("button", { name: "Carregar JSON" })).toHaveCount(
    0,
  );
  await expect(page.getByRole("button", { name: "Copiar JSON" })).toHaveCount(
    0,
  );
});

test.describe("as a MAINTAINER", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("a pasted JSON replaces the form being edited", async ({
    page,
    mockApi,
  }) => {
    installHandlers(mockApi);
    await loginWithPermissions(page, mockApi, [
      "READ_BASIC_FEATURES",
      "READ_PRESCRIPTION",
      "MAINTAINER",
    ]);

    await openEditor(page, `${LIST_PATH}/1`, "Avaliação Farmacêutica");

    await page.getByRole("button", { name: "Carregar JSON" }).click();
    await page.locator(".ant-modal textarea").fill(
      JSON.stringify({
        name: "Formulário importado",
        active: true,
        data: [
          {
            group: "Importado",
            questions: [
              {
                id: "importado",
                label: "Questão importada",
                type: "text",
                options: [],
                required: false,
              },
            ],
          },
        ],
      }),
    );
    await page
      .locator(".ant-modal-footer")
      .getByRole("button", { name: "Carregar", exact: true })
      .click();

    await expect(page.getByPlaceholder("Nome do formulário")).toHaveValue(
      "Formulário importado",
    );
    await expect(page.getByPlaceholder("Nome do grupo")).toHaveValue(
      "Importado",
    );
    await expect(questionId(page, 0)).toHaveValue("importado");

    // the record keeps its own id: this is still an edit, not a new form
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page).toHaveURL(new RegExp(`${LIST_PATH}$`));
    expect(saveCalls(mockApi)[0].path).toBe("/memory/custom-forms/1");
  });

  test("an invalid JSON is rejected and the form is left alone", async ({
    page,
    mockApi,
  }) => {
    installHandlers(mockApi);
    await loginWithPermissions(page, mockApi, [
      "READ_BASIC_FEATURES",
      "READ_PRESCRIPTION",
      "MAINTAINER",
    ]);

    await openEditor(page, `${LIST_PATH}/1`, "Avaliação Farmacêutica");

    await page.getByRole("button", { name: "Carregar JSON" }).click();
    await page.locator(".ant-modal textarea").fill("{ nope");
    await page
      .locator(".ant-modal-footer")
      .getByRole("button", { name: "Carregar", exact: true })
      .click();

    await expect(page.getByText("JSON inválido")).toBeVisible();
    await expect(page.getByPlaceholder("Nome do formulário")).toHaveValue(
      "Avaliação Farmacêutica",
    );
  });
});
