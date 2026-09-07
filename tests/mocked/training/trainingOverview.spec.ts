import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";
import { openSelect, pickOption } from "../support/antd";

/**
 * Training Central's team view (/treinamento, src/features/training).
 *
 * The page has two faces, gated by READ_USERS: a user manager gets a tab bar
 * with their own training plus the team overview, and everyone else gets the
 * page exactly as it was, with no tab bar at all. That second case is the one
 * worth guarding — a single-tab shell around an unchanged page would be a
 * regression nobody would notice in code review.
 *
 * The overview's aggregates are computed on the client, over the *filtered*
 * rows, so the filter tests below also pin the summary cards.
 */

const MODULES = [
  {
    id: 1,
    title: "Módulo básico",
    position: 1,
    totalLessons: 2,
    audience: "all",
    mandatory: true,
  },
  {
    id: 2,
    title: "Priorização avançada",
    position: 2,
    totalLessons: 4,
    audience: "all",
    mandatory: false,
  },
];

/** Finished everything: both modules done. */
const AHEAD = {
  id: 10,
  name: "Fulano Beltrano",
  email: "fulano@example.com",
  active: true,
  newUser: true,
  mandatoryTotal: 1,
  mandatoryFinished: 1,
  optionalTotal: 1,
  optionalFinished: 1,
  totalLessons: 6,
  totalLessonsFinished: 6,
  lastActivityAt: "2026-08-30T14:00:00",
  modules: [
    {
      id: 1,
      mandatory: true,
      totalLessons: 2,
      totalLessonsFinished: 2,
      finished: true,
      completedAt: "2026-08-20T10:00:00",
    },
    {
      id: 2,
      mandatory: false,
      totalLessons: 4,
      totalLessonsFinished: 4,
      finished: true,
      completedAt: "2026-08-30T14:00:00",
    },
  ],
};

/** Owes the mandatory module, and module 1 was reopened by a new lesson. */
const BEHIND = {
  id: 11,
  name: "Ciclano de Tal",
  email: "ciclano@example.com",
  active: true,
  newUser: true,
  mandatoryTotal: 1,
  mandatoryFinished: 0,
  optionalTotal: 1,
  optionalFinished: 0,
  totalLessons: 6,
  totalLessonsFinished: 1,
  lastActivityAt: "2026-08-15T09:00:00",
  modules: [
    {
      id: 1,
      mandatory: true,
      totalLessons: 2,
      totalLessonsFinished: 1,
      // already certified, pending again: the module gained a lesson
      finished: false,
      completedAt: "2026-07-01T10:00:00",
    },
    {
      id: 2,
      mandatory: false,
      totalLessons: 4,
      totalLessonsFinished: 0,
      finished: false,
      completedAt: null,
    },
  ],
};

/** Never opened the training at all. */
const UNTOUCHED = {
  id: 12,
  name: "Maria Teste",
  email: "maria@example.com",
  active: true,
  newUser: false,
  mandatoryTotal: 1,
  mandatoryFinished: 0,
  optionalTotal: 1,
  optionalFinished: 0,
  totalLessons: 6,
  totalLessonsFinished: 0,
  lastActivityAt: null,
  modules: [
    {
      id: 1,
      mandatory: true,
      totalLessons: 2,
      totalLessonsFinished: 0,
      finished: false,
      completedAt: null,
    },
    {
      id: 2,
      mandatory: false,
      totalLessons: 4,
      totalLessonsFinished: 0,
      finished: false,
      completedAt: null,
    },
  ],
};

const INACTIVE = {
  ...UNTOUCHED,
  id: 13,
  name: "Inativo de Tal",
  email: "inativo@example.com",
  active: false,
};

const overview = {
  status: "success",
  data: {
    modules: MODULES,
    users: [AHEAD, BEHIND, UNTOUCHED, INACTIVE],
  },
};

const trainingList = {
  status: "success",
  data: [
    {
      id: 1,
      page: ["priorizacao"],
      title: "Módulo básico",
      description: "Primeiros passos",
      position: 1,
      totalLessons: 2,
      totalLessonsFinished: 2,
      mandatory: true,
      certificateAvailable: true,
    },
  ],
};

const rows = (page: Page) => page.locator(".ant-table-tbody tr.ant-table-row");

const summaryCard = (page: Page, label: string) =>
  page.locator("div").filter({ hasText: label }).last();

async function openTeamTab(page: Page) {
  await page.goto("/treinamento");
  await page.getByRole("tab", { name: "Minha equipe" }).click();
}

test("a user manager gets the team overview, fetched only when the tab opens", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /training/list", { json: trainingList });
  mockApi.override("GET /training/overview", { json: overview });

  await page.goto("/treinamento");

  // the manager lands on their own training; the overview is not requested yet
  await expect(page.getByRole("tab", { name: "Meu treinamento" })).toBeVisible();
  await expect(page.getByText("Primeiros passos")).toBeVisible();
  expect(
    mockApi.requests.filter((r) => r.path === "/training/overview"),
  ).toHaveLength(0);

  await page.getByRole("tab", { name: "Minha equipe" }).click();

  await expect(rows(page)).toHaveCount(3); // the inactive user is filtered out
  // no exact count: the mocked suite runs against the dev server, where
  // React.StrictMode double-invokes every effect. The assertion that matters is
  // the zero above — the overview is not requested until the tab is opened
  expect(
    mockApi.requests.filter((r) => r.path === "/training/overview").length,
  ).toBeGreaterThan(0);
});

test("the overview reports each user's progress and last activity", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /training/list", { json: trainingList });
  mockApi.override("GET /training/overview", { json: overview });

  await openTeamTab(page);

  const behind = rows(page).filter({ hasText: "Ciclano de Tal" });

  await expect(behind).toContainText("ciclano@example.com");
  await expect(behind).toContainText("0 / 1"); // mandatory
  await expect(behind).toContainText("1/6"); // lessons
  await expect(behind).toContainText("15/08/2026");
  await expect(behind).toContainText("Em andamento");

  await expect(rows(page).filter({ hasText: "Fulano" })).toContainText(
    "Concluído",
  );

  const untouched = rows(page).filter({ hasText: "Maria Teste" });
  await expect(untouched).toContainText("Não iniciado");
  // never touched the training: no date to show
  await expect(untouched).toContainText("—");
});

test("expanding a row shows a certified-but-reopened module", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /training/list", { json: trainingList });
  mockApi.override("GET /training/overview", { json: overview });

  await openTeamTab(page);

  await rows(page)
    .filter({ hasText: "Ciclano de Tal" })
    .locator(".ant-table-row-expand-icon")
    .click();

  const expanded = page.locator(".ant-table-expanded-row");

  await expect(expanded).toContainText("1 · Módulo básico");
  // the completion record survives the new lesson, so the date stays while the
  // module goes back to pending
  await expect(expanded).toContainText("01/07/2026");
  await expect(expanded).toContainText("Reaberto");
  await expect(expanded).toContainText("2 · Priorização avançada");
});

test("the summary counts only the users currently listed", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /training/list", { json: trainingList });
  mockApi.override("GET /training/overview", { json: overview });

  await openTeamTab(page);

  // 3 active users, 2 of them owing the mandatory module, 1 never started
  await expect(summaryCard(page, "Usuários")).toContainText("3");
  await expect(summaryCard(page, "Com obrigatórios pendentes")).toContainText(
    "2",
  );

  // "Todos" brings the inactive user in, and every card follows
  await openSelect(
    page.locator(".filter-field").filter({ hasText: "Situação do usuário" }),
  );
  await pickOption(page, "Todos");

  await expect(rows(page)).toHaveCount(4);
  await expect(summaryCard(page, "Usuários")).toContainText("4");
  await expect(summaryCard(page, "Com obrigatórios pendentes")).toContainText(
    "3",
  );
});

test("searching narrows the list to one user", async ({ page, mockApi }) => {
  mockApi.override("GET /training/list", { json: trainingList });
  mockApi.override("GET /training/overview", { json: overview });

  await openTeamTab(page);

  await page.getByPlaceholder("Nome ou e-mail").fill("ciclano@example.com");

  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page)).toContainText("Ciclano de Tal");
});

test.describe("without READ_USERS", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("the page renders unchanged, with no tab bar and no overview call", async ({
    page,
    mockApi,
  }) => {
    mockApi.override("GET /training/list", { json: trainingList });
    mockApi.override("GET /training/overview", { json: overview });

    await loginWithPermissions(page, mockApi, [
      "READ_BASIC_FEATURES",
      "READ_PRESCRIPTION",
    ]);

    await page.goto("/treinamento");

    await expect(page.getByText("Primeiros passos")).toBeVisible();
    await expect(page.locator(".ant-tabs")).toHaveCount(0);
    expect(
      mockApi.requests.filter((r) => r.path === "/training/overview"),
    ).toHaveLength(0);
  });
});
