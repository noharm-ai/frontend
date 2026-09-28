import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";

/**
 * Memory records (/configuracoes/memoria, src/features/memory).
 *
 * A list over GET /memory plus a per-kind editor picked from
 * MemoryEditor/editors/registry. Only one kind exists today
 * ("tpl-care-plan") and the backend keeps a single record per kind — which
 * is why the list drops "Novo registro" once that kind is taken.
 *
 * The editor is a Formik form whose payload is the interesting part: the
 * `_id` keys it adds for stable React keys must never reach the API, and a
 * brand new record PUTs to /memory while an existing one PUTs to /memory/:id.
 */

const CARE_PLAN_RECORD = {
  key: 10,
  updatedAt: "2024-03-15T12:00:00",
  value: {
    name: "Plano padrão",
    active: true,
    kind: "tpl-care-plan",
    data: {
      templates: [
        {
          title: "Alta hospitalar",
          description: "Orientações de alta",
          content: "<p>Paciente {{nome_paciente}} orientado.</p>",
        },
        {
          title: "Admissão",
          description: "",
          content: "<p>Admissão em {{data_atual}}.</p>",
        },
      ],
      snippets: [
        {
          category: "Antimicrobianos",
          items: [
            { title: "Ajuste renal", text: "<p>Ajustar pela TFG.</p>" },
            { title: "Desescalonamento", text: "<p>Avaliar cultura.</p>" },
          ],
        },
      ],
    },
  },
};

const rows = (page: Page) => page.locator(".ant-table-tbody tr.ant-table-row");

/**
 * Tabs render lazily and keep visited panes mounted, so scope form lookups to
 * the active pane — the only one antd leaves in the accessibility tree.
 */
const pane = (page: Page) => page.getByRole("tabpanel");

/**
 * The editor's cards are styled-components (hashed class names), so the
 * delete buttons are reached through the stable bits next to them: the
 * `.card-title` span, the `.category-input` input and the item title input.
 */
const templateDelete = (page: Page, index: number) =>
  pane(page)
    .locator(".card-title")
    .nth(index)
    .locator("xpath=following-sibling::button[1]");

const categoryInputs = (page: Page) => pane(page).locator(".category-input");

const categoryDelete = (page: Page, index: number) =>
  categoryInputs(page).nth(index).locator("xpath=following-sibling::button[1]");

const itemTitles = (page: Page) =>
  pane(page).getByPlaceholder("Título", { exact: true });

const itemDelete = (page: Page, index: number) =>
  itemTitles(page).nth(index).locator("xpath=following-sibling::button[1]");

const putCalls = (mockApi: MockApi) =>
  mockApi.requests
    .filter((r) => r.method === "PUT" && r.path.startsWith("/memory"))
    .map((r) => ({ path: r.path, body: JSON.parse(r.postData!) }));

/** Echoes the saved record back, the way the backend does. */
function echoSave(mockApi: MockApi, key: string) {
  mockApi.override(key, (route) => {
    const sent = JSON.parse(route.request().postData()!);
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: "success", data: sent.value }),
    });
  });
}

async function openList(page: Page, mockApi: MockApi, records: unknown[]) {
  mockApi.override("GET /memory", {
    json: { status: "success", data: records },
  });

  await page.goto("/configuracoes/memoria");
  await expect(page.getByRole("heading", { name: "Memória" })).toBeVisible();
}

/** Answers the single-record fetch the editor makes on mount. */
function stubRecordFetch(mockApi: MockApi) {
  mockApi.override("GET /memory/id/:id", {
    json: {
      status: "success",
      data: {
        key: CARE_PLAN_RECORD.key,
        kind: CARE_PLAN_RECORD.value.kind,
        value: CARE_PLAN_RECORD.value,
      },
    },
  });
}

async function openEditor(page: Page, mockApi: MockApi) {
  stubRecordFetch(mockApi);

  await page.goto(`/configuracoes/memoria/${CARE_PLAN_RECORD.key}`);
  await expect(
    page.getByRole("heading", { name: "Modelo de Plano de Cuidado" }),
  ).toBeVisible();
}

test("an empty list offers the only kind there is and opens a blank editor", async ({
  page,
  mockApi,
}) => {
  await openList(page, mockApi, []);

  await expect(page.getByText("Nenhum registro cadastrado")).toBeVisible();

  await page.getByRole("button", { name: "Novo registro" }).click();
  await expect(
    page.getByRole("dialog").getByText("Selecionar tipo de registro"),
  ).toBeVisible();

  await page
    .getByRole("dialog")
    .getByText("Modelo de Plano de Cuidado")
    .click();

  // the kind travels in the query string — a new record has nothing to fetch
  await expect(page).toHaveURL(
    /\/configuracoes\/memoria\/new\?kind=tpl-care-plan$/,
  );
  await expect(
    page.getByRole("heading", { name: "Modelo de Plano de Cuidado" }),
  ).toBeVisible();

  // the schema demands at least one of each, so a blank record starts with one
  await expect(page.getByRole("tab", { name: "Modelos (1)" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Textos (1)" })).toBeVisible();
  await expect(page.getByPlaceholder("Nome do registro")).toHaveValue("");
});

test("the list renders each record by kind and hides the create button once the kind is taken", async ({
  page,
  mockApi,
}) => {
  await openList(page, mockApi, [
    CARE_PLAN_RECORD,
    {
      key: 11,
      updatedAt: null,
      value: {
        name: "Ata de reunião",
        active: false,
        kind: "kind-sem-editor",
        data: {},
      },
    },
  ]);

  await expect(rows(page)).toHaveCount(2);

  // sorted by name: "Ata de reunião" before "Plano padrão". A kind with no
  // entry in KIND_META falls back to its raw key, and a record that was never
  // updated shows a dash.
  await expect(rows(page).nth(0)).toContainText("kind-sem-editor");
  await expect(rows(page).nth(0)).toContainText("Não");
  await expect(rows(page).nth(0)).toContainText("-");

  await expect(rows(page).nth(1)).toContainText("Modelo de Plano de Cuidado");
  await expect(rows(page).nth(1)).toContainText("Sim");
  await expect(rows(page).nth(1)).toContainText("15/03/2024");

  // every kind the registry knows about already has a record
  await expect(page.getByRole("button", { name: "Novo registro" })).toHaveCount(
    0,
  );

  stubRecordFetch(mockApi);
  await rows(page).nth(1).getByRole("button").click();
  await expect(page).toHaveURL(/\/configuracoes\/memoria\/10$/);
  await expect(page.getByPlaceholder("Nome do registro")).toHaveValue(
    "Plano padrão",
  );
});

test("a failing list warns instead of rendering a silently empty table", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /memory", {
    status: 500,
    json: { status: "error", message: "boom" },
  });

  await page.goto("/configuracoes/memoria");

  await expect(
    page.getByText("Não foi possível carregar os registros.").first(),
  ).toBeVisible();
});

test("an existing record round trips through the editor without leaking its _id keys", async ({
  page,
  mockApi,
}) => {
  await openEditor(page, mockApi);
  echoSave(mockApi, "PUT /memory/:id");

  await expect(page.getByPlaceholder("Nome do registro")).toHaveValue(
    "Plano padrão",
  );
  await expect(page.getByRole("tab", { name: "Modelos (2)" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Textos (1)" })).toBeVisible();

  const titles = pane(page).getByPlaceholder("Título do modelo");
  await expect(titles.nth(0)).toHaveValue("Alta hospitalar");
  await expect(titles.nth(1)).toHaveValue("Admissão");
  await expect(pane(page).locator(".ProseMirror").first()).toContainText(
    "Paciente {{nome_paciente}} orientado.",
  );

  await titles.nth(0).fill("Alta hospitalar revisada");
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Uhu! Salvo com sucesso! :)")).toBeVisible();
  await expect(page).toHaveURL(/\/configuracoes\/memoria$/);

  const calls = putCalls(mockApi);
  expect(calls).toHaveLength(1);
  expect(calls[0].path).toBe("/memory/10");
  // the id addresses the record in the URL and is dropped from the body
  expect(calls[0].body.id).toBeUndefined();
  expect(calls[0].body).toMatchObject({
    type: "tpl-care-plan",
    value: { name: "Plano padrão", active: true, kind: "tpl-care-plan" },
  });

  // the React keys the editor adds are stripped on the way out
  expect(JSON.stringify(calls[0].body)).not.toContain("_id");
  expect(calls[0].body.value.data.templates[0]).toEqual({
    title: "Alta hospitalar revisada",
    description: "Orientações de alta",
    content: "<p>Paciente {{nome_paciente}} orientado.</p>",
  });
  expect(calls[0].body.value.data.snippets[0].items).toEqual([
    { title: "Ajuste renal", text: "<p>Ajustar pela TFG.</p>" },
    { title: "Desescalonamento", text: "<p>Avaliar cultura.</p>" },
  ]);
});

test("the editor keeps the schema minimums: one template, one category, one text", async ({
  page,
  mockApi,
}) => {
  await openEditor(page, mockApi);

  // two templates, so both delete buttons are live
  await expect(templateDelete(page, 0)).toBeEnabled();
  await templateDelete(page, 1).click();
  await expect(page.getByRole("tab", { name: "Modelos (1)" })).toBeVisible();
  await expect(templateDelete(page, 0)).toBeDisabled();

  await page.getByRole("tab", { name: /^Textos/ }).click();

  // the only category is locked, but its items can go down to the last one
  await expect(categoryInputs(page)).toHaveCount(1);
  await expect(categoryDelete(page, 0)).toBeDisabled();
  await expect(itemTitles(page)).toHaveCount(2);

  await itemDelete(page, 1).click();
  await expect(itemTitles(page)).toHaveCount(1);
  await expect(itemDelete(page, 0)).toBeDisabled();

  // adding unlocks them again, and the tab label follows the category count
  await pane(page).getByRole("button", { name: "Adicionar texto" }).click();
  await expect(itemTitles(page)).toHaveCount(2);
  await expect(itemDelete(page, 0)).toBeEnabled();

  await pane(page).getByRole("button", { name: "Adicionar categoria" }).click();
  await expect(page.getByRole("tab", { name: "Textos (2)" })).toBeVisible();
  await expect(categoryDelete(page, 0)).toBeEnabled();
});

test("an incomplete form is rejected before it reaches the API", async ({
  page,
  mockApi,
}) => {
  echoSave(mockApi, "PUT /memory");

  await page.goto("/configuracoes/memoria/new?kind=tpl-care-plan");
  await expect(
    page.getByRole("heading", { name: "Modelo de Plano de Cuidado" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Formulário com erros")).toBeVisible();
  await expect(page.getByText("Campo obrigatório").first()).toBeVisible();
  expect(putCalls(mockApi)).toHaveLength(0);

  await page.getByPlaceholder("Nome do registro").fill("Novo modelo");
  await pane(page).getByPlaceholder("Título do modelo").fill("Rotina");
  await pane(page).locator(".ProseMirror").first().fill("Conteúdo do modelo");

  await page.getByRole("tab", { name: /^Textos/ }).click();
  await categoryInputs(page).fill("Geral");
  await itemTitles(page).fill("Observação");
  await pane(page).locator(".ProseMirror").first().fill("Texto da observação");

  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Uhu! Salvo com sucesso! :)")).toBeVisible();

  const calls = putCalls(mockApi);
  expect(calls).toHaveLength(1);
  // a brand new record has no id, so it PUTs to the collection
  expect(calls[0].path).toBe("/memory");
  expect(calls[0].body.id).toBeUndefined();
  expect(calls[0].body).toMatchObject({
    type: "tpl-care-plan",
    value: {
      name: "Novo modelo",
      active: true,
      kind: "tpl-care-plan",
      data: {
        templates: [
          {
            title: "Rotina",
            description: "",
            content: "<p>Conteúdo do modelo</p>",
          },
        ],
        snippets: [
          {
            category: "Geral",
            items: [
              { title: "Observação", text: "<p>Texto da observação</p>" },
            ],
          },
        ],
      },
    },
  });
});

test("leaving with unsaved changes asks for confirmation first", async ({
  page,
  mockApi,
}) => {
  echoSave(mockApi, "PUT /memory/:id");
  await openEditor(page, mockApi);

  // pristine, so no warning yet
  await expect(page.getByText("Alterações não salvas")).toHaveCount(0);

  await page.getByPlaceholder("Nome do registro").fill("Plano revisado");
  await expect(page.getByText("Alterações não salvas")).toBeVisible();

  await page.getByRole("button", { name: "Cancelar" }).click();
  await expect(page.getByText("Deseja sair sem salvar?")).toBeVisible();

  await page.getByRole("button", { name: "Continuar editando" }).click();
  await expect(page).toHaveURL(/\/configuracoes\/memoria\/10$/);

  mockApi.override("GET /memory", { json: { status: "success", data: [] } });
  await page.getByRole("button", { name: "Cancelar" }).click();
  await page.getByRole("button", { name: "Sair sem salvar" }).click();

  await expect(page).toHaveURL(/\/configuracoes\/memoria$/);
  // bailing out never saves
  expect(putCalls(mockApi)).toHaveLength(0);
});
