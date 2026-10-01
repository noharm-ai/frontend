import type { Locator, Page, Route } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";
import { loginWithPermissions } from "../support/featureLogin";

/**
 * Help mode (src/features/knowledgeBase/HelpMode).
 *
 * Knowledge base articles are pinned to elements of a screen, found by a CSS
 * selector under the screen's route pattern (or "*" for every screen). With
 * the help mode on, those elements are highlighted and a click on one shows
 * its articles instead of reaching the element: a highlighted prescription
 * card must not open the prescription. Curators (WRITE_HELP_TEXT) pick
 * elements and pin articles to them from the same mode.
 */

const CARDS_PAGE = "/priorizacao/pacientes/cards";
const CARD = '[data-kb="prioritization.card"]';
const KB_LINK = '[id="gtm-lnk-knowledgeBase"]';
const STATUS = '[data-kb="prioritization.status"]';

const article = (id: number, title: string) => ({
  id,
  title,
  description: `Resumo de ${title}`,
});

const ELEMENTS = [
  {
    page: CARDS_PAGE,
    selector: CARD,
    label: "Card do paciente",
    articles: [article(1, "Lendo o card"), article(2, "Escore Global")],
  },
  {
    page: "*",
    selector: KB_LINK,
    label: "Base de conhecimento",
    articles: [article(3, "Usando a base de conhecimento")],
  },
  {
    page: CARDS_PAGE,
    selector: '[data-kb="prioritization.removed"]',
    label: "Bloco removido",
    articles: [article(4, "Artigo antigo")],
  },
];

const ARTICLES = [
  article(1, "Lendo o card"),
  article(2, "Escore Global"),
  article(3, "Usando a base de conhecimento"),
  article(4, "Artigo antigo"),
  article(5, "Filtro de situação"),
].map((summary) => ({
  ...summary,
  path: ["Prescrição"],
  link: null,
  hasContent: true,
  updatedAt: "2026-09-01T10:00:00",
}));

const ok = (data: unknown) => ({ json: { status: "success", data } });

/**
 * Serves the elements and records the page each request asked for
 */
const mockElements = (mockApi: MockApi, elements: unknown[] = ELEMENTS) => {
  const pages: string[] = [];

  mockApi.override("GET /knowledge-base/elements", async (route: Route) => {
    pages.push(new URL(route.request().url()).searchParams.get("page") ?? "");
    await route.fulfill({ json: { status: "success", data: elements } });
  });

  return pages;
};

const openCards = async (page: Page) => {
  await page.goto(CARDS_PAGE);
  await page.getByRole("main").getByRole("button", { name: "search" }).click();
  await expect(page.getByText("Paciente 99")).toBeVisible();
};

const headerHelp = (page: Page) => page.locator("#gtm-btn-header-help");
const drawerAction = (page: Page) => page.locator("#gtm-btn-help-mode");
const supportDrawer = (page: Page) =>
  page.getByRole("dialog", { name: "Suporte NoHarm" });

/** Header help icon, then "Mostrar ajuda na tela" in the support drawer */
const enableHelpMode = async (page: Page) => {
  await headerHelp(page).click();
  await drawerAction(page).click();
  // it slides away to uncover the highlights
  await expect(supportDrawer(page)).toBeHidden();
};
const highlight = (page: Page, selector: string) =>
  page.locator(`[data-help-selector='${selector}']`);

test.beforeEach(async ({ mockApi }) => {
  // the support drawer's articles for the screen (by category)
  mockApi.override("POST /support/knowledge-base-articles", ok([]));
  mockApi.override("GET /knowledge-base/articles", ok(ARTICLES));
  mockApi.override(
    "GET /knowledge-base/articles/:id",
    ok({
      ...ARTICLES[1],
      content: "<h2>Como ler</h2><p>O card mostra o paciente.</p>",
      related: [],
      relatedLessons: [],
    }),
  );
});

test("asks for nothing until the help mode is on", async ({
  page,
  mockApi,
}) => {
  const pages = mockElements(mockApi);
  await openCards(page);

  // not even the support drawer asks: only the help mode does
  await headerHelp(page).click();
  await expect(drawerAction(page)).toHaveText("Mostrar ajuda na tela");
  await page.waitForTimeout(500);
  expect(pages).toEqual([]);

  await drawerAction(page).click();
  await expect.poll(() => pages).toEqual([CARDS_PAGE]);
  // the drawer steps aside for the highlights, and the header says it is on
  await expect(drawerAction(page)).toBeHidden();
  await expect(highlight(page, CARD)).toHaveCount(1);
  await expect(headerHelp(page).locator(".ant-badge-dot")).toBeVisible();
});

test("the drawer lists the pinned articles with the screen's own", async ({
  page,
  mockApi,
}) => {
  mockElements(mockApi);
  mockApi.override(
    "POST /support/knowledge-base-articles",
    ok([article(2, "Escore Global"), article(9, "Artigo da categoria")]),
  );
  await openCards(page);
  await enableHelpMode(page);

  // "Mais ajuda" in the bar: articles, the AI agent and tickets
  await page.getByRole("button", { name: "Mais ajuda" }).click();
  const drawer = supportDrawer(page);
  await expect(drawer).toContainText("Modo ajuda ligado");

  // the category's first, then the pinned ones it left out, once each
  await expect(drawer.locator("strong")).toHaveText([
    "Escore Global",
    "Artigo da categoria",
    "Artigo antigo",
    "Lendo o card",
    "Usando a base de conhecimento",
  ]);

  // escape closes the drawer and leaves the help mode on
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(highlight(page, CARD)).toHaveCount(1);

  // and the drawer turns it off too
  await headerHelp(page).click();
  await drawerAction(page).click();
  await expect(highlight(page, CARD)).toHaveCount(0);
  await expect(headerHelp(page).locator(".ant-badge-dot")).toHaveCount(0);
});

test("the user menu still opens the help", async ({ page, mockApi }) => {
  mockElements(mockApi);
  await openCards(page);

  await page.getByText("E2E Test").first().click();
  await page
    .locator(".ant-dropdown-menu-item")
    .filter({ hasText: /^Ajuda$/ })
    .click();

  await expect(drawerAction(page)).toBeVisible();
});

test("asks for the screen's route pattern, not its url", async ({
  page,
  mockApi,
}) => {
  const pages = mockElements(mockApi);

  await page.goto("/prescricao/199");
  await enableHelpMode(page);

  await expect.poll(() => pages).toEqual(["/prescricao/:slug"]);
});

test("highlights pinned elements and opens their articles", async ({
  page,
  mockApi,
}) => {
  mockElements(mockApi);
  await openCards(page);

  await enableHelpMode(page);

  await expect(
    page
      .locator("#nh-help-mode-layer")
      .getByText("Modo ajuda", { exact: true }),
  ).toBeVisible();
  // one highlight per element, on the first card only, plus the global one
  await expect(highlight(page, CARD)).toHaveCount(1);
  await expect(highlight(page, KB_LINK)).toHaveCount(1);
  // an element not on screen is not highlighted, and a normal user is not
  // told about it
  await expect(
    highlight(page, '[data-kb="prioritization.removed"]'),
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: /não visíve/ })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Adicionar ajuda" }),
  ).toHaveCount(0);

  await highlight(page, CARD).click();

  await expect(page.getByText("Card do paciente")).toBeVisible();
  await expect(page.getByRole("button", { name: "Editar ajuda" })).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: /Escore Global/ }).click();

  await expect(page.getByRole("dialog")).toContainText("Como ler");
});

test("lists every article of the screen, hidden elements included", async ({
  page,
  mockApi,
}) => {
  mockElements(mockApi, [
    ...ELEMENTS,
    // the same article on a second element is listed once
    {
      page: CARDS_PAGE,
      selector: STATUS,
      label: "Situação",
      articles: [article(2, "Escore Global")],
    },
  ]);
  await openCards(page);
  await enableHelpMode(page);

  const list = page
    .getByRole("dialog")
    .filter({ hasText: "Artigos desta tela" });
  const items = list.getByRole("listitem");

  await page.getByRole("button", { name: "4 artigos nesta tela" }).click();

  await expect(items.locator("strong")).toHaveText([
    "Artigo antigo",
    "Escore Global",
    "Lendo o card",
    "Usando a base de conhecimento",
  ]);
  await expect(items.filter({ hasText: "Escore Global" })).toContainText(
    "Em: Card do paciente, Situação",
  );

  // more articles in the knowledge base, without leaving this screen
  const search = list.getByRole("link", {
    name: /Buscar mais artigos na base de conhecimento/,
  });
  await expect(search).toHaveAttribute("href", "/base-de-conhecimento");
  await expect(search).toHaveAttribute("target", "_blank");

  // escape closes the list, not the help mode
  await page.keyboard.press("Escape");
  await expect(list).toHaveCount(0);
  await expect(highlight(page, CARD)).toHaveCount(1);

  // an article pinned to an element not on screen is still reachable
  await page.getByRole("button", { name: "4 artigos nesta tela" }).click();
  await items.filter({ hasText: "Artigo antigo" }).getByRole("button").click();
  await expect(list).toHaveCount(0);
  await expect
    .poll(() =>
      mockApi.requests.some((r) => r.path === "/knowledge-base/articles/4"),
    )
    .toBe(true);
});

test("a highlighted card does not open the prescription", async ({
  page,
  mockApi,
}) => {
  mockElements(mockApi);
  await openCards(page);

  const card = page.locator(CARD).first();
  const box = (await card.boundingBox())!;
  const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

  // control: with the help mode off, the card opens the prescription on a
  // click and on enter
  const clickPopup = page.waitForEvent("popup");
  await page.mouse.click(center.x, center.y);
  await (await clickPopup).close();

  const enterPopup = page.waitForEvent("popup");
  await card.focus();
  await page.keyboard.press("Enter");
  await (await enterPopup).close();

  let popups = 0;
  page.on("popup", () => {
    popups += 1;
  });

  await enableHelpMode(page);
  await expect(highlight(page, CARD)).toHaveCount(1);

  // the same click, at the same spot, shows the help instead
  await page.mouse.click(center.x, center.y);
  await expect(page.getByText("Card do paciente")).toBeVisible();

  // and the keyboard is held back too
  await card.focus();
  await page.keyboard.press("Enter");

  await page.waitForTimeout(500);
  expect(popups).toBe(0);
});

test("the highlight steps aside so its element can be used", async ({
  page,
  mockApi,
}) => {
  mockElements(mockApi);
  await openCards(page);
  await enableHelpMode(page);

  const box = (await page.locator(CARD).first().boundingBox())!;
  const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

  await page.mouse.click(center.x, center.y);
  await page.getByRole("button", { name: "Usar o elemento" }).click();

  // on the way from the popover to the element, the pointer is off it: that
  // must not bring the highlight back
  await page.mouse.move(center.x, center.y, { steps: 10 });
  await expect(highlight(page, CARD)).toHaveCSS("pointer-events", "none");

  // the very element now takes the click
  const popup = page.waitForEvent("popup");
  await page.mouse.click(center.x, center.y);
  await (await popup).close();

  // away from the element, the highlight is back in front of it
  // (in steps, as a real mouse moves: Chromium drops a lone move right
  // after the popup closes)
  await page.mouse.move(5, 300, { steps: 5 });
  let popups = 0;
  page.on("popup", () => {
    popups += 1;
  });
  await page.mouse.click(center.x, center.y);
  await expect(page.getByText("Card do paciente")).toBeVisible();
  await page.waitForTimeout(500);
  expect(popups).toBe(0);
});

test("the main screens carry their help anchors", async ({ page, mockApi }) => {
  // empty lists are enough: the anchors are on the blocks, not the rows
  for (const endpoint of [
    "POST /intervention/search",
    "GET /intervention/reasons",
    "GET /segments/departments",
    "POST /patient/list",
  ]) {
    mockApi.override(endpoint, ok([]));
  }

  const screens: [string, string[]][] = [
    [
      "/prescricao/199",
      [
        "prescription.title",
        "prescription.actions",
        "prescription.patient",
        "prescription.exams",
        "prescription.alerts",
        "prescription.clinicalNotes",
        "prescription.score",
        "prescription.drugs",
      ],
    ],
    [
      "/priorizacao/prescricoes",
      ["prioritization.title", "prioritization.filter", "prioritization.table"],
    ],
    [
      "/intervencoes",
      [
        "interventions.title",
        "filter",
        "interventions.status",
        "interventions.table",
      ],
    ],
    [
      "/pacientes-ambulatoriais",
      ["patients.title", "filter", "patients.search", "patients.table"],
    ],
    ["/priorizacao/pacientes/cards", ["prioritization.title"]],
    ["/base-de-conhecimento", ["knowledgeBase.title"]],
  ];

  for (const [url, anchors] of screens) {
    await page.goto(url);

    for (const anchor of anchors) {
      await expect(
        page.locator(`[data-kb="${anchor}"]`).first(),
        `${anchor} on ${url}`,
      ).toBeVisible({ timeout: 15000 });
    }
  }
});

test("highlights an anchored block of the prescription", async ({
  page,
  mockApi,
}) => {
  mockElements(mockApi, [
    {
      page: "/prescricao/:slug",
      selector: '[data-kb="prescription.alerts"]',
      label: "Alertas",
      articles: [article(1, "Lendo os alertas")],
    },
  ]);

  await page.goto("/prescricao/199");
  await expect(page.locator('[data-kb="prescription.alerts"]')).toBeVisible({
    timeout: 15000,
  });
  await enableHelpMode(page);

  await expect(
    highlight(page, '[data-kb="prescription.alerts"]'),
  ).toBeVisible();
});

test("escape and the exit button leave help mode", async ({
  page,
  mockApi,
}) => {
  mockElements(mockApi);
  await openCards(page);

  await enableHelpMode(page);
  await expect(highlight(page, CARD)).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(highlight(page, CARD)).toHaveCount(0);

  await enableHelpMode(page);
  await page
    .locator("#nh-help-mode-layer")
    .getByRole("button", { name: "Sair do modo ajuda" })
    .click();
  await expect(highlight(page, CARD)).toHaveCount(0);
});

test.describe("curator", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  const loginAsCurator = async (page: Page, mockApi: MockApi) => {
    const auth = loadFixture<{ permissions: string[] }>(
      "auth/authenticate.json",
    );
    await loginWithPermissions(page, mockApi, [
      ...auth.permissions,
      "WRITE_HELP_TEXT",
    ]);
  };

  const saves = (mockApi: MockApi) =>
    mockApi.requests
      .filter(
        (r) => r.method === "PUT" && r.path === "/knowledge-base/elements",
      )
      .map((r) => JSON.parse(r.postData ?? "{}"));

  test("pins articles to a picked element", async ({ page, mockApi }) => {
    const pages = mockElements(mockApi, []);
    mockApi.override(
      "PUT /knowledge-base/elements",
      ok({ ...ELEMENTS[0], selector: STATUS }),
    );
    await loginAsCurator(page, mockApi);
    await openCards(page);

    // shown to curators even when the screen has no help yet
    await enableHelpMode(page);
    await page.getByRole("button", { name: "Adicionar ajuda" }).click();

    // the click on the status select snaps to its anchored block
    const select = page.locator(STATUS).locator(".ant-select").first();
    const box = await select.boundingBox();
    await page.getByTestId("help-mode-picker").click({
      position: { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 },
    });

    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText("Adicionar ajuda ao elemento");
    await expect(dialog).toContainText(STATUS);
    await expect(dialog).not.toContainText("identificador estável");

    await dialog
      .getByPlaceholder("Ex.: Lista de medicamentos")
      .fill("Situação");
    await dialog.getByRole("combobox").last().click();
    await page.getByTitle("Filtro de situação").click();

    const before = pages.length;
    await dialog.getByRole("button", { name: "Salvar" }).click();

    await expect(page.getByText("Ajuda salva.")).toBeVisible();
    expect(saves(mockApi)).toEqual([
      {
        page: CARDS_PAGE,
        selector: STATUS,
        label: "Situação",
        articleIds: [5],
      },
    ]);
    // the screen's elements are fetched again
    await expect.poll(() => pages.length).toBeGreaterThan(before);
  });

  test("an element picked exactly is flagged as fragile", async ({
    page,
    mockApi,
  }) => {
    mockElements(mockApi, []);
    await loginAsCurator(page, mockApi);
    await openCards(page);

    await enableHelpMode(page);
    await page.getByRole("button", { name: "Adicionar ajuda" }).click();

    const label = page.locator(STATUS).locator(".filters-item-label");
    const box = await label.boundingBox();
    await page.getByTestId("help-mode-picker").click({
      modifiers: ["Alt"],
      position: { x: box!.x + 4, y: box!.y + box!.height / 2 },
    });

    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText(`${STATUS} > div`);
    await expect(dialog).toContainText("identificador estável");
  });

  test("edits and removes a pinned element, hidden ones included", async ({
    page,
    mockApi,
  }) => {
    mockElements(mockApi);
    mockApi.override("PUT /knowledge-base/elements", ok(null));
    await loginAsCurator(page, mockApi);
    await openCards(page);

    await enableHelpMode(page);

    // the pinned element no longer on screen is listed for curators
    await page.getByRole("button", { name: "1 não visível" }).click();
    await page.getByRole("button", { name: /Bloco removido/ }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText("Editar ajuda do elemento");
    await dialog.getByRole("button", { name: "Remover ajuda" }).click();
    await page.getByRole("button", { name: "OK" }).click();

    await expect(page.getByText("Ajuda removida.")).toBeVisible();
    expect(saves(mockApi)).toEqual([
      {
        page: CARDS_PAGE,
        selector: '[data-kb="prioritization.removed"]',
        label: "Bloco removido",
        articleIds: [],
      },
    ]);
  });

  test("removes one article in the editor", async ({ page, mockApi }) => {
    mockElements(mockApi);
    mockApi.override("PUT /knowledge-base/elements", ok(null));
    await loginAsCurator(page, mockApi);
    await openCards(page);

    await enableHelpMode(page);
    await highlight(page, CARD).click();
    await page.getByRole("button", { name: "Editar ajuda" }).click();

    const dialog = page.getByRole("dialog");
    const pinned = dialog.getByRole("listitem");
    await expect(pinned).toHaveText(["Lendo o card", "Escore Global"]);

    await pinned
      .filter({ hasText: "Lendo o card" })
      .getByRole("button", { name: "Remover artigo" })
      .click();
    await expect(pinned).toHaveText(["Escore Global"]);
    await dialog.getByRole("button", { name: "Salvar" }).click();

    await expect(page.getByText("Ajuda salva.")).toBeVisible();
    expect(saves(mockApi)).toEqual([
      {
        page: CARDS_PAGE,
        selector: CARD,
        label: "Card do paciente",
        articleIds: [2],
      },
    ]);
  });

  test("removes one article straight from the highlight", async ({
    page,
    mockApi,
  }) => {
    const pages = mockElements(mockApi);
    mockApi.override("PUT /knowledge-base/elements", ok(null));
    await loginAsCurator(page, mockApi);
    await openCards(page);

    await enableHelpMode(page);
    await highlight(page, CARD).click();

    await page
      .getByRole("listitem")
      .filter({ hasText: "Escore Global" })
      .getByRole("button", { name: "Remover artigo" })
      .click();
    await expect(
      page.getByText("Remover “Escore Global” deste elemento?"),
    ).toBeVisible();

    const before = pages.length;
    await page.getByRole("button", { name: "OK" }).click();

    await expect(page.getByText("Artigo removido do elemento.")).toBeVisible();
    expect(saves(mockApi)).toEqual([
      {
        page: CARDS_PAGE,
        selector: CARD,
        label: "Card do paciente",
        articleIds: [1],
      },
    ]);
    await expect.poll(() => pages.length).toBeGreaterThan(before);
  });

  test("a normal user has no remove buttons", async ({ page, mockApi }) => {
    mockElements(mockApi);
    const auth = loadFixture<{ permissions: string[] }>(
      "auth/authenticate.json",
    );
    await loginWithPermissions(page, mockApi, auth.permissions);
    await openCards(page);

    await enableHelpMode(page);
    await highlight(page, CARD).click();

    await expect(page.getByText("Card do paciente")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Remover artigo" }),
    ).toHaveCount(0);
  });

  const editorDialog = (page: Page) =>
    page.getByRole("dialog").filter({
      hasText: /Adicionar ajuda ao elemento|Editar ajuda do elemento/,
    });

  /** Starts the picker and clicks the middle of the element */
  const pickAt = async (page: Page, target: Locator) => {
    // the help mode bar pushed the page down: the target may be below the fold
    await target.scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: "Adicionar ajuda" }).click();
    const box = (await target.boundingBox())!;
    await page.getByTestId("help-mode-picker").click({
      position: { x: box.x + box.width / 2, y: box.y + box.height / 2 },
    });
    await expect(editorDialog(page)).toBeVisible();
    // antd moves the focus into the modal once it has zoomed in, which
    // would close a dropdown opened before that
    await expect(editorDialog(page)).not.toHaveClass(/zoom-(appear|enter)/);
  };

  const cancelEditor = async (page: Page) => {
    await editorDialog(page).getByRole("button", { name: "Cancelar" }).click();
    await expect(editorDialog(page)).toHaveCount(0);
  };

  test("picks single parts of the drug list", async ({ page, mockApi }) => {
    mockElements(mockApi, []);
    await loginAsCurator(page, mockApi);
    await page.goto("/prescricao/199");
    const drugs = page.locator('[data-kb="prescription.drugs"]');
    await expect(drugs).toBeVisible({ timeout: 15000 });
    await enableHelpMode(page);

    const cases: [Locator, string][] = [
      // a cell snaps to its column
      [
        drugs.locator("td", { hasText: "500 mg" }).first(),
        '[data-kb="prescription.column.dosage"]',
      ],
      [
        drugs.getByText("Ativar seleção múltipla"),
        '[data-kb="prescription.drugs.multipleSelection"]',
      ],
      // buttons with an analytics class need no anchor of their own
      [drugs.locator("button.gtm-bt-notes").first(), ".gtm-bt-notes"],
    ];

    for (const [target, selector] of cases) {
      await pickAt(page, target);
      await expect(editorDialog(page).locator("code").first()).toHaveText(
        selector,
      );
      await expect(editorDialog(page)).not.toContainText(
        "identificador estável",
      );
      await cancelEditor(page);
    }
  });

  test("help pinned inside a modal is found when it opens again", async ({
    page,
    mockApi,
  }) => {
    mockElements(mockApi, []);
    mockApi.override("PUT /knowledge-base/elements", ok(null));
    await loginAsCurator(page, mockApi);
    await page.goto("/prescricao/199");
    await expect(page.locator('[data-kb="prescription.alerts"]')).toBeVisible({
      timeout: 15000,
    });
    await enableHelpMode(page);

    const alertsModal = page.locator(
      '[data-kb="prescription.alerts.modal"] .ant-modal',
    );
    await page.getByText("Ver todos").click();
    await expect(alertsModal).toBeVisible();
    await expect(alertsModal).not.toHaveClass(/zoom-(appear|enter)/);

    // the report's title has an anchor of its own
    await pickAt(
      page,
      alertsModal.getByRole("heading", { name: /Relatório: Alertas/ }),
    );
    await expect(editorDialog(page).locator("code").first()).toHaveText(
      '[data-kb="reports.alertList.title"]',
    );
    await cancelEditor(page);

    // the footnote under it has none
    await pickAt(page, alertsModal.getByText(/A quantidade de alertas/));
    const selector = await editorDialog(page)
      .locator("code")
      .first()
      .textContent();
    // the path starts at the modal, never at its position under <body>
    expect(selector).toMatch(/^\[data-kb="prescription\.alerts\.modal"\] > /);

    // what the screen's elements are once this is saved (they are fetched
    // again right after the save)
    mockElements(mockApi, [
      {
        page: "/prescricao/:slug",
        selector,
        label: "Relatório de alertas",
        articles: [article(1, "Lendo o card")],
      },
    ]);

    await editorDialog(page).getByRole("combobox").last().click();
    await page.getByTitle("Lendo o card").click();
    await editorDialog(page).getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText("Ajuda salva.")).toBeVisible();
    expect(saves(mockApi).map((save) => save.selector)).toEqual([selector]);
    await expect(highlight(page, selector!)).toBeVisible();

    // the modal is rendered again, after other portals, when reopened
    // escape closes the modal and the help mode alike
    await page.keyboard.press("Escape");
    await expect(alertsModal).toHaveCount(0);
    await enableHelpMode(page);
    await page.getByText("Ver todos").click();
    await expect(alertsModal).toBeVisible();

    await expect(highlight(page, selector!)).toBeVisible();
  });
});
