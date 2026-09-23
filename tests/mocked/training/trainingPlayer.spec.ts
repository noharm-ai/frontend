import { test, expect } from "../support/mockApi";

/**
 * Training Player (/treinamento/:id, src/features/training/TrainingPlayer.tsx)
 * lesson navigation.
 *
 * Lessons can be finished in any order, and each lesson has its own URL
 * (/treinamento/:id/aula/:lessonId) so a user can be pointed straight at it.
 */

const trainingList = {
  status: "success",
  data: [
    {
      id: 1,
      page: ["priorizacao"],
      title: "Módulo básico",
      description: "Primeiros passos na plataforma",
      position: 1,
      totalLessons: 3,
      totalLessonsFinished: 0,
      mandatory: true,
      certificateAvailable: false,
    },
  ],
};

const lesson = (id: number, position: number, title: string) => ({
  id,
  trainingId: 1,
  title,
  text: `<p>Conteúdo da aula ${position}.</p>`,
  video: null,
  position,
  questions: null,
  finished: false,
});

const trainingItems = {
  status: "success",
  data: [
    lesson(11, 1, "Boas-vindas"),
    lesson(12, 2, "Conhecendo a tela de priorização"),
    lesson(13, 3, "Registrando uma intervenção"),
  ],
};

const finishResponse = (moduleFinished: boolean) => ({
  json: {
    status: "success",
    data: {
      moduleFinished,
      training: {
        mandatoryTotal: 1,
        mandatoryFinished: moduleFinished ? 1 : 0,
      },
    },
  },
});

const heading = (page: import("@playwright/test").Page, name: string) =>
  page.getByRole("heading", { name });

test.beforeEach(({ mockApi }) => {
  mockApi.override("GET /training/list", { json: trainingList });
  mockApi.override("GET /training/:id/items", { json: trainingItems });
  mockApi.override("POST /training/item/:id/finish", finishResponse(false));
});

test("a direct link opens that lesson", async ({ page }) => {
  await page.goto("/treinamento/1/aula/13");

  await expect(heading(page, "Registrando uma intervenção")).toBeVisible();
  await expect(page.getByText("Aula 3 de 3").first()).toBeVisible();
});

test("an unknown lesson in the link falls back to the first lesson", async ({
  page,
}) => {
  await page.goto("/treinamento/1/aula/999");

  await expect(heading(page, "Boas-vindas")).toBeVisible();
});

test("picking a lesson updates the URL to its direct link", async ({
  page,
}) => {
  await page.goto("/treinamento/1");
  await expect(heading(page, "Boas-vindas")).toBeVisible();

  await page.getByText("Registrando uma intervenção").click();

  await expect(heading(page, "Registrando uma intervenção")).toBeVisible();
  await expect(page).toHaveURL(/\/treinamento\/1\/aula\/13$/);
});

test("lessons can be finished out of order", async ({ page, mockApi }) => {
  await page.goto("/treinamento/1");
  await expect(heading(page, "Boas-vindas")).toBeVisible();

  await page.getByText("Registrando uma intervenção").click();
  await expect(heading(page, "Registrando uma intervenção")).toBeVisible();

  // finishing the last lesson first jumps back to the first pending one
  await page.getByRole("button", { name: "Marcar como concluída" }).click();
  await expect(heading(page, "Boas-vindas")).toBeVisible();
  await expect(page).toHaveURL(/\/treinamento\/1\/aula\/11$/);

  await page.getByRole("button", { name: "Marcar como concluída" }).click();
  await expect(heading(page, "Conhecendo a tela de priorização")).toBeVisible();

  // the only pending lesson left finishes the module
  mockApi.override("POST /training/item/:id/finish", finishResponse(true));
  await page.getByRole("button", { name: "Concluir" }).click();
  await expect(page.getByText("Módulo concluído")).toBeVisible();

  const finished = mockApi.requests
    .filter((r) => r.method === "POST" && r.path.endsWith("/finish"))
    .map((r) => r.path);
  expect(finished).toEqual([
    "/training/item/13/finish",
    "/training/item/11/finish",
    "/training/item/12/finish",
  ]);
});

test("the lesson link can be copied", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/treinamento/1/aula/12");
  await expect(heading(page, "Conhecendo a tela de priorização")).toBeVisible();

  await page.getByRole("button", { name: "Copiar link da aula" }).click();

  await expect(page.getByText("Link da aula copiado")).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toMatch(/\/treinamento\/1\/aula\/12$/);
});
