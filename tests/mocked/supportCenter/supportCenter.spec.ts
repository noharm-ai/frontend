import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";

/**
 * Support center (/suporte, src/features/support/SupportCenter).
 *
 * One GET /support/list-tickets/v2 feeds three tabs: my tickets, the ones I
 * follow and — only for ADMIN_SUPPORT — my whole organization. Everything
 * else is presentation the backend has no say over: the Odoo stage id is
 * mapped to a coloured label, a ticket waiting on the requester is flagged,
 * and following a ticket hands it off to Odoo in a new tab with its
 * access token.
 */

const BASE_PERMISSIONS = [
  "READ_BASIC_FEATURES",
  "WRITE_BASIC_FEATURES",
  "READ_PRESCRIPTION",
  "READ_SUPPORT",
  "WRITE_SUPPORT",
];

/** stage_id is Odoo's [id, label] pair; the UI only reads the id. */
const ticket = (overrides: Record<string, unknown> = {}) => ({
  id: 41,
  ticket_ref: "NH-0041",
  name: "Prescrição não carrega",
  create_date: "2024-06-01 09:30:00",
  stage_id: [1, "Novo"],
  tag_ids: [],
  partner_name: "Fulano Beltrano",
  description: "A prescrição fica carregando indefinidamente.",
  access_token: "tok-41",
  ...overrides,
});

const TICKETS = {
  myTickets: [
    ticket(),
    ticket({
      id: 42,
      ticket_ref: "NH-0042",
      name: "Escore divergente",
      stage_id: [3, "Em espera"],
      // tag 23 on a waiting ticket means the requester owes an answer
      tag_ids: [23],
      access_token: "tok-42",
      create_date: "2024-05-20 14:00:00",
    }),
    ticket({
      id: 43,
      ticket_ref: "NH-0043",
      name: "Estágio desconhecido",
      stage_id: [99, "Alguma coisa"],
      access_token: "tok-43",
    }),
  ],
  following: [
    ticket({
      id: 50,
      ticket_ref: "NH-0050",
      name: "Integração de exames",
      stage_id: [12, "Resolvido"],
      access_token: "tok-50",
    }),
  ],
  organization: [
    ticket({
      id: 60,
      ticket_ref: "NH-0060",
      name: "Cadastro de usuários",
      stage_id: [2, "Em andamento"],
      access_token: "tok-60",
    }),
  ],
};

const rows = (page: Page) =>
  page.locator(".ant-tabs-content-active .ant-table-tbody tr.ant-table-row");

const installTickets = (mockApi: MockApi, data: unknown = TICKETS) =>
  mockApi.override("GET /support/list-tickets/v2", {
    json: { status: "success", data },
  });

/**
 * Tickets and FAQ entries leave for Odoo through window.open. VITE_APP_ODOO_LINK
 * is not set in CI, so the recorded URL is asserted on its path, and stubbing
 * window.open keeps a half-built URL from loading the SPA in a second tab.
 */
async function recordWindowOpen(page: Page) {
  await page.addInitScript(() => {
    (window as any).__opened = [];
    window.open = ((url: string) => {
      (window as any).__opened.push(url);
      return null;
    }) as any;
  });
  return () => page.evaluate(() => (window as any).__opened as string[]);
}

async function openCenter(page: Page, mockApi: MockApi) {
  installTickets(mockApi);
  await page.goto("/suporte");
  await expect(page.getByRole("heading", { name: "Ajuda" })).toBeVisible();
}

test("my tickets carry the reference, the date and the mapped stage", async ({
  page,
  mockApi,
}) => {
  await openCenter(page, mockApi);

  await expect(rows(page)).toHaveCount(3);

  const first = rows(page).nth(0);
  await expect(first).toContainText("NH-0041");
  await expect(first).toContainText("Prescrição não carrega");
  await expect(first).toContainText("01/06/2024");
  await expect(first).toContainText("Novo");

  // a stage the UI has no label for falls back to the raw id
  await expect(rows(page).nth(2)).toContainText("99");

  await expect(page.getByText("* Lista limitada em 50 registros.")).toBeVisible();
});

test("only a waiting ticket the requester owes an answer on is flagged", async ({
  page,
  mockApi,
}) => {
  await openCenter(page, mockApi);

  const waiting = rows(page).nth(1);
  await expect(waiting).toContainText("Em espera");
  await expect(waiting).toContainText("Aguardando resposta");

  // same tag, but the ticket moved on: nothing is owed anymore
  installTickets(mockApi, {
    ...TICKETS,
    myTickets: [
      ticket({ id: 44, ticket_ref: "NH-0044", tag_ids: [23], stage_id: [2, "Em andamento"] }),
    ],
  });
  await page.reload();

  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).nth(0)).toContainText("Em andamento");
  await expect(page.getByText("Aguardando resposta")).toHaveCount(0);
});

test("expanding a ticket shows who owns it and what was reported", async ({
  page,
  mockApi,
}) => {
  await openCenter(page, mockApi);

  await rows(page).nth(0).locator(".ant-table-row-expand-icon").click();

  await expect(page.getByText("Responsável:")).toBeVisible();
  await expect(page.getByText("Fulano Beltrano")).toBeVisible();
  await expect(
    page.getByText("A prescrição fica carregando indefinidamente."),
  ).toBeVisible();
});

test("the tabs are fed by a single fetch and the organization one needs ADMIN_SUPPORT", async ({
  page,
  mockApi,
}) => {
  await openCenter(page, mockApi);

  const ticketFetches = () =>
    mockApi.requests.filter((r) => r.path === "/support/list-tickets/v2").length;
  const fetchesOnLoad = ticketFetches();

  await expect(page.getByRole("tab", { name: "Meus chamados" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Seguindo" })).toBeVisible();
  await expect(
    page.getByRole("tab", { name: "Minha organização" }),
  ).toHaveCount(0);

  await page.getByRole("tab", { name: "Seguindo" }).click();
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).nth(0)).toContainText("Integração de exames");
  await expect(rows(page).nth(0)).toContainText("Resolvido");

  // switching tabs never re-queries: one payload holds all three lists
  expect(ticketFetches()).toBe(fetchesOnLoad);
});

test.describe("with ADMIN_SUPPORT", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("the organization tab lists everyone else's tickets", async ({
    page,
    mockApi,
  }) => {
    installTickets(mockApi);
    await loginWithPermissions(page, mockApi, [
      ...BASE_PERMISSIONS,
      "ADMIN_SUPPORT",
    ]);

    await page.goto("/suporte");
    await page.getByRole("tab", { name: "Minha organização" }).click();

    await expect(rows(page)).toHaveCount(1);
    await expect(rows(page).nth(0)).toContainText("Cadastro de usuários");
    await expect(rows(page).nth(0)).toContainText("Em andamento");
  });
});

test("following a ticket opens it in Odoo with its access token", async ({
  page,
  mockApi,
}) => {
  const opened = await recordWindowOpen(page);
  await openCenter(page, mockApi);

  await rows(page)
    .nth(1)
    .getByRole("button", { name: /edit/i })
    .click();

  expect(await opened()).toHaveLength(1);
  expect((await opened())[0]).toContain("my/ticket/42?access_token=tok-42");
});

test("the FAQ shortcuts point at the knowledge base", async ({
  page,
  mockApi,
}) => {
  const opened = await recordWindowOpen(page);
  await openCenter(page, mockApi);

  await page.getByRole("button", { name: "Escore 4: o que fazer?" }).click();
  await page.getByRole("button", { name: "Ver todas" }).click();

  const urls = await opened();
  expect(urls).toHaveLength(2);
  expect(urls[0]).toContain("/knowledge/article/111");
  expect(urls[1]).toContain("/knowledge/article/39");
});

test("the page offers the same ticket drawer as the rest of the app", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /support/knowledge-base-articles", {
    json: { status: "success", data: [] },
  });
  await openCenter(page, mockApi);

  await page.getByRole("button", { name: "Abrir um Novo Chamado" }).click();

  await expect(
    page.getByRole("heading", { name: "Suporte NoHarm" }),
  ).toBeVisible();
});

test("a failing fetch warns and leaves every tab empty", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /support/list-tickets/v2", {
    status: 500,
    json: { status: "error", message: "boom" },
  });

  await page.goto("/suporte");
  await expect(page.getByRole("heading", { name: "Ajuda" })).toBeVisible();

  await expect(page.locator(".ant-notification-notice").first()).toBeVisible();
  await expect(page.getByText("Nenhum registro encontrado").first()).toBeVisible();
});
