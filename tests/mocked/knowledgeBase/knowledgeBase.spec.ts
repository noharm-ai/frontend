import { test, expect } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";

const READER_PERMISSIONS = [
  "READ_BASIC_FEATURES",
  "WRITE_BASIC_FEATURES",
  "READ_PRESCRIPTION",
  "WRITE_PRESCRIPTION",
  "READ_SUPPORT",
];

const MAINTAINER_PERMISSIONS = [
  ...READER_PERMISSIONS,
  "MAINTAINER",
  "WRITE_KNOWLEDGE_BASE",
];

const sectionArticle = {
  id: 31,
  title: "Como avaliar os medicamentos",
  description: "Passo a passo da aba Medicamentos",
  link: null,
  section: ["prescricao.medicamentos"],
  hasContent: true,
};

const fullArticle = {
  ...sectionArticle,
  path: ["Prescrição"],
  active: true,
  content:
    '<p>Confira a <strong>dose</strong> de cada item.</p><img src=x onerror="window.__xss = true">',
  createdAt: "2026-01-10T10:00:00",
  updatedAt: null,
};

test.use({ storageState: { cookies: [], origins: [] } });

test("a reader opens the article of a prescription section", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /support/knowledge-base-articles", {
    json: { status: "success", data: [sectionArticle] },
  });
  mockApi.override("GET /knowledge-base/:id", {
    json: { status: "success", data: fullArticle },
  });
  await loginWithPermissions(page, mockApi, READER_PERMISSIONS);

  await page.goto("/prescricao/199");
  await expect(page.getByText("Dipirona 500mg")).toBeVisible();

  // only the section with an article shows the icon
  const icons = page.getByRole("tab").getByRole("button", { name: "book" });
  await expect(icons).toHaveCount(1);

  await icons.first().click();
  await page
    .getByRole("button", { name: "Como avaliar os medicamentos" })
    .click();

  const modal = page.locator(".ant-modal").filter({ hasText: "Confira a" });
  await expect(modal.getByText("dose")).toBeVisible();
  await expect(
    modal.getByText("Passo a passo da aba Medicamentos"),
  ).toBeVisible();
  // readers cannot edit, and the stored HTML is sanitized before rendering
  await expect(modal.getByRole("button", { name: "Editar" })).toHaveCount(0);
  expect(await page.evaluate(() => (window as any).__xss)).toBeUndefined();

  // the tab stays where it was: the icon click does not switch tabs
  await expect(page.getByText("Dipirona 500mg")).toBeVisible();

  // one request loads the articles of every section on the screen
  const sectionCalls = mockApi.requests.filter(
    (r) => r.path === "/support/knowledge-base-articles",
  );
  expect(sectionCalls).toHaveLength(1);
  expect(JSON.parse(sectionCalls[0].postData!)).toMatchObject({
    active: true,
    section: expect.arrayContaining(["prescricao.medicamentos"]),
  });
});

test("a maintainer writes an article straight from a section", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /knowledge-base/upsert", {
    json: { status: "success", data: { ...fullArticle, id: 32 } },
  });
  await loginWithPermissions(page, mockApi, MAINTAINER_PERMISSIONS);

  await page.goto("/prescricao/199");
  await expect(page.getByText("Dipirona 500mg")).toBeVisible();

  // maintainers see the icon of every section, even the empty ones
  await page
    .getByRole("tab", { name: /Medicamentos/ })
    .getByRole("button", { name: "book" })
    .click();
  await page
    .getByRole("button", { name: "Adicionar artigo nesta seção" })
    .click();

  const form = page.locator(".ant-modal").filter({
    hasText: "Artigo da base de conhecimento",
  });
  await expect(form.getByText("Aba Medicamentos")).toBeVisible();

  await form
    .locator(".form-row")
    .filter({ hasText: "Título:" })
    .locator("input")
    .fill("Revisar doses");
  await form.locator(".tiptap").click();
  await page.keyboard.type("Confira a dose de cada item.");
  await form.getByRole("button", { name: "Salvar" }).click();

  await expect(page.getByText("Uhu! Salvo com sucesso! :)")).toBeVisible();

  const upsert = mockApi.requests.filter(
    (r) => r.path === "/knowledge-base/upsert",
  );
  expect(upsert).toHaveLength(1);
  expect(JSON.parse(upsert[0].postData!)).toMatchObject({
    title: "Revisar doses",
    section: ["prescricao.medicamentos"],
    path: ["Prescrição"],
    active: true,
    link: null,
    content: expect.stringContaining("Confira a dose de cada item."),
  });
});

test("an article needs content or a link", async ({ page, mockApi }) => {
  mockApi.override("POST /knowledge-base/list", {
    json: { status: "success", data: [] },
  });
  await loginWithPermissions(page, mockApi, MAINTAINER_PERMISSIONS);

  await page.goto("/admin/base-conhecimento");
  await page.getByRole("button", { name: "Novo artigo" }).click();

  const form = page.locator(".ant-modal").filter({
    hasText: "Artigo da base de conhecimento",
  });
  await form
    .locator(".form-row")
    .filter({ hasText: "Título:" })
    .locator("input")
    .fill("Sem corpo");
  await form.getByRole("button", { name: "Salvar" }).click();

  await expect(
    form.getByText("Escreva o conteúdo do artigo ou informe um link externo"),
  ).toBeVisible();
  expect(
    mockApi.requests.filter((r) => r.path === "/knowledge-base/upsert"),
  ).toHaveLength(0);
});

test("the maintenance screen lists and filters the articles", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /knowledge-base/list", {
    json: {
      status: "success",
      data: [
        { ...fullArticle, content: undefined },
        {
          id: 40,
          title: "Relatório de intervenções (ODOO)",
          description: null,
          path: ["Relatório: Intervenções"],
          section: [],
          link: "https://kb.example.com/artigo/40",
          active: false,
          hasContent: false,
          createdAt: "2025-05-01T09:00:00",
          updatedAt: null,
        },
      ],
    },
  });
  await loginWithPermissions(page, mockApi, MAINTAINER_PERMISSIONS);

  await page.goto("/admin/base-conhecimento");

  const rows = page.locator(".ant-table-tbody tr");
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0)).toContainText("Prescrição › Aba Medicamentos");
  await expect(rows.nth(0)).toContainText("Publicado");
  await expect(rows.nth(1)).toContainText("Rascunho");
  await expect(rows.nth(1)).toContainText("Link");

  await page.getByPlaceholder("Buscar pelo título ou resumo").fill("doses");
  await page.getByRole("button", { name: "Pesquisar" }).click();

  const listCalls = mockApi.requests.filter(
    (r) => r.path === "/knowledge-base/list",
  );
  expect(JSON.parse(listCalls[listCalls.length - 1].postData!)).toMatchObject({
    term: "doses",
  });
});
