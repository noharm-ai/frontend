import { test, expect } from "../support/mockApi";
import { loginWithAuth, loginWithPermissions } from "../support/featureLogin";

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
  trainingItems: [],
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

const trainingLessons = [
  {
    id: 11,
    title: "Boas-vindas",
    trainingId: 1,
    trainingTitle: "Módulo básico",
  },
  {
    id: 12,
    title: "Avaliando a prescrição",
    trainingId: 1,
    trainingTitle: "Módulo básico",
  },
];

test.beforeEach(({ mockApi }) => {
  mockApi.override("GET /knowledge-base/training-lessons", {
    json: { status: "success", data: trainingLessons },
  });
});

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

  // relate a lesson of the training center
  await form
    .locator(".form-row")
    .filter({ hasText: "Aulas de treinamento:" })
    .locator(".ant-select")
    .click();
  await page
    .locator(".ant-select-item-option")
    .filter({ hasText: "Avaliando a prescrição" })
    .click();
  await page.keyboard.press("Escape");

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
    training_items: [12],
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
          trainingItems: [],
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

test("the article points the reader to its training lessons", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /support/knowledge-base-articles", {
    json: { status: "success", data: [sectionArticle] },
  });
  mockApi.override("GET /knowledge-base/:id", {
    json: {
      status: "success",
      data: {
        ...fullArticle,
        trainingItems: [12],
        trainingLessons: [trainingLessons[1]],
      },
    },
  });
  mockApi.override("GET /training/list", {
    json: {
      status: "success",
      data: [
        {
          id: 1,
          page: ["prescricao"],
          title: "Módulo básico",
          description: null,
          position: 1,
          totalLessons: 1,
          totalLessonsFinished: 0,
          mandatory: false,
          certificateAvailable: false,
        },
      ],
    },
  });
  mockApi.override("GET /training/:id/items", {
    json: {
      status: "success",
      data: [
        {
          id: 12,
          trainingId: 1,
          title: "Avaliando a prescrição",
          text: "<p>Conteúdo da aula.</p>",
          video: null,
          position: 1,
          questions: null,
          finished: false,
        },
      ],
    },
  });
  await loginWithAuth(page, mockApi, {
    permissions: READER_PERMISSIONS,
    features: ["USER_ONBOARDING"],
  });

  await page.goto("/prescricao/199");
  await page.getByRole("tab").getByRole("button", { name: "book" }).click();
  await page
    .getByRole("button", { name: "Como avaliar os medicamentos" })
    .click();

  await page
    .getByRole("button", { name: "Módulo básico › Avaliando a prescrição" })
    .click();

  await expect(page).toHaveURL(/\/treinamento\/1\/aula\/12$/);
  await expect(
    page.getByRole("heading", { name: "Avaliando a prescrição" }),
  ).toBeVisible();
});

test("without the training center the lessons are not offered", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /support/knowledge-base-articles", {
    json: { status: "success", data: [sectionArticle] },
  });
  mockApi.override("GET /knowledge-base/:id", {
    json: {
      status: "success",
      data: { ...fullArticle, trainingLessons: [trainingLessons[1]] },
    },
  });
  await loginWithPermissions(page, mockApi, READER_PERMISSIONS);

  await page.goto("/prescricao/199");
  await page.getByRole("tab").getByRole("button", { name: "book" }).click();
  await page
    .getByRole("button", { name: "Como avaliar os medicamentos" })
    .click();

  const modal = page.locator(".ant-modal").filter({ hasText: "Confira a" });
  await expect(modal.getByText("dose")).toBeVisible();
  await expect(modal.getByText("Aulas relacionadas")).toHaveCount(0);
});

test("maintainers index the articles for the n0 agent", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /knowledge-base/list", {
    json: {
      status: "success",
      data: [
        { ...fullArticle, content: undefined, trainingItems: [11, 12] },
        {
          ...fullArticle,
          id: 41,
          title: "Rascunho",
          active: false,
          content: undefined,
          trainingItems: [],
        },
      ],
    },
  });
  mockApi.override("POST /knowledge-base/:id/reindex", (route) => {
    const id = Number(route.request().url().split("/").slice(-2)[0]);
    return route.fulfill({
      json: {
        status: "success",
        data: { id, vectorIndex: id === 41 ? "removed" : "indexed" },
      },
    });
  });
  await loginWithPermissions(page, mockApi, MAINTAINER_PERMISSIONS);

  await page.goto("/admin/base-conhecimento");
  await expect(page.locator(".ant-table-tbody tr").first()).toContainText(
    "2 aulas de treinamento",
  );

  await page.getByRole("button", { name: "Indexar todos" }).click();
  await expect(
    page.getByText("1 indexados, 1 removidos (não publicados)."),
  ).toBeVisible();

  const calls = mockApi.requests
    .filter((r) => r.path.endsWith("/reindex"))
    .map((r) => r.path);
  expect(calls).toEqual([
    "/knowledge-base/31/reindex",
    "/knowledge-base/41/reindex",
  ]);
});
