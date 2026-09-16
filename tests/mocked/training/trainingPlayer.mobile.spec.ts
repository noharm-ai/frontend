import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";

/**
 * Training Player (/treinamento/:id, src/features/training/TrainingPlayer.tsx)
 * on a phone-sized viewport.
 *
 * Below antd's `lg` breakpoint the lesson side panel is replaced by a compact
 * bar plus a drawer, and Training Central stacks its two columns. Both pages
 * must fit the viewport width: a horizontal scrollbar on a phone is the bug
 * these tests exist to catch.
 */

const PHONE = { width: 390, height: 844 };

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
      totalLessonsFinished: 1,
      mandatory: true,
      certificateAvailable: false,
    },
    {
      id: 2,
      page: ["priorizacao"],
      title: "Priorização avançada",
      description: "Filtros, indicadores e escores",
      position: 2,
      totalLessons: 4,
      totalLessonsFinished: 4,
      mandatory: false,
      certificateAvailable: true,
    },
  ],
};

const trainingItems = {
  status: "success",
  data: [
    {
      id: 11,
      trainingId: 1,
      title: "Boas-vindas",
      text: "<p>Bem-vindo ao treinamento.</p>",
      video: null,
      position: 1,
      questions: null,
      finished: true,
    },
    {
      id: 12,
      trainingId: 1,
      title: "Conhecendo a tela de priorização",
      text: "<p>A tela de priorização lista as prescrições pendentes.</p>",
      video: null,
      position: 2,
      questions: null,
      finished: false,
    },
    {
      id: 13,
      trainingId: 1,
      title: "Registrando uma intervenção",
      text: "<p>Intervenções ficam registradas no histórico.</p>",
      video: null,
      position: 3,
      questions: null,
      finished: false,
    },
  ],
};

const drawer = (page: Page) => page.getByRole("dialog", { name: "Aulas" });

const hasHorizontalOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

test.beforeEach(({ mockApi }) => {
  mockApi.override("GET /training/list", { json: trainingList });
  mockApi.override("GET /training/:id/items", { json: trainingItems });
});

test.describe("on a phone", () => {
  test.use({ viewport: PHONE });

  test("the lesson list lives in a drawer and the page fits the screen", async ({
    page,
  }) => {
    await page.goto("/treinamento/1");

    await expect(
      page.getByRole("heading", { name: "Boas-vindas" }),
    ).toBeVisible();

    // the side panel is gone: the lessons are only reachable via the drawer
    await expect(drawer(page)).toBeHidden();
    await expect(
      page.getByText("Conhecendo a tela de priorização"),
    ).toHaveCount(0);

    await page.getByRole("button", { name: "Aulas" }).click();

    await expect(drawer(page)).toBeVisible();
    await expect(drawer(page).getByText("Boas-vindas")).toBeVisible();
    await expect(
      drawer(page).getByText("Registrando uma intervenção"),
    ).toBeVisible();

    // lesson 2 is unlocked (lesson 1 is finished); picking it closes the drawer
    await drawer(page).getByText("Conhecendo a tela de priorização").click();

    await expect(
      page.getByRole("heading", { name: "Conhecendo a tela de priorização" }),
    ).toBeVisible();
    await expect(drawer(page)).toBeHidden();

    expect(await hasHorizontalOverflow(page)).toBe(false);
  });

  test("a locked lesson cannot be opened from the drawer", async ({ page }) => {
    await page.goto("/treinamento/1");
    await page.getByRole("button", { name: "Aulas" }).click();

    // lesson 3 is locked until lesson 2 is finished
    await drawer(page).getByText("Registrando uma intervenção").click();

    await expect(
      page.getByRole("heading", { name: "Boas-vindas" }),
    ).toBeVisible();
    await expect(drawer(page)).toBeVisible();
  });

  test("Training Central stacks its columns and fits the screen", async ({
    page,
  }) => {
    await page.goto("/treinamento");

    await expect(
      page.getByText("Primeiros passos na plataforma"),
    ).toBeVisible();
    await expect(
      page.getByText("Filtros, indicadores e escores"),
    ).toBeVisible();

    const list = page.getByText("Primeiros passos na plataforma");
    const panel = page.getByText("Seu progresso");

    // the progress panel sits above the module list on a phone
    const listBox = (await list.boundingBox())!;
    const panelBox = (await panel.boundingBox())!;
    expect(panelBox.y).toBeLessThan(listBox.y);

    expect(await hasHorizontalOverflow(page)).toBe(false);
  });
});

test("on a desktop the lesson list stays in the side panel", async ({
  page,
}) => {
  await page.goto("/treinamento/1");

  await expect(
    page.getByRole("heading", { name: "Boas-vindas" }),
  ).toBeVisible();
  await expect(page.getByText("Registrando uma intervenção")).toBeVisible();
  await expect(page.getByRole("button", { name: "Aulas" })).toHaveCount(0);
});
