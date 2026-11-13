import type { Page, Route } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loginWithAuth } from "../support/featureLogin";
import { openSelect, pickOption } from "../support/antd";

/**
 * Sending a support ticket when the request never gets an HTTP answer.
 *
 * A request refused at the edge (API Gateway answering without CORS headers,
 * e.g. for an oversized body) reaches the browser as a network error with
 * status 0. The forms must say so — with a hint about attachment size — rather
 * than leave the user retrying the same request, keep the attachments under
 * what the edge accepts, and send one request per submit.
 */

const PERMISSIONS = [
  "READ_BASIC_FEATURES",
  "WRITE_BASIC_FEATURES",
  "READ_PRESCRIPTION",
  "READ_SUPPORT",
  "WRITE_SUPPORT",
];

const TICKET_CREATED = {
  status: "success",
  data: [{ id: 1, access_token: "tok", ticket_ref: "REF-1" }],
};

const ticketRequests = (mockApi: MockApi) =>
  mockApi.requests.filter((r) => r.path === "/support/create-ticket");

/** a fake attachment of `bytes` bytes; only its size matters to the form */
const file = (name: string, bytes: number) => ({
  name,
  mimeType: "image/png",
  buffer: Buffer.alloc(bytes, 1),
});

async function openLegacyForm(page: Page, mockApi: MockApi) {
  mockApi.override("POST /support/knowledge-base-articles", {
    json: { status: "success", data: [] },
  });
  await loginWithAuth(page, mockApi, {
    permissions: PERMISSIONS,
    training: { mandatoryTotal: 1, mandatoryFinished: 1 },
  });

  await page.getByText("E2E Test").click();
  await page
    .locator(".ant-dropdown-menu")
    .getByRole("menuitem", { name: "Ajuda" })
    .click();
  await page.getByText("Abrir chamado", { exact: true }).click();
  await expect(page.getByRole("button", { name: "Enviar" })).toBeVisible();
}

async function fillLegacyForm(page: Page) {
  await openSelect(page.locator(".form-row").filter({ hasText: "Tipo de" }));
  await pickOption(page, "Dúvida");
  await page
    .getByPlaceholder("Ex: Erro ao checar prescrição")
    .fill("Chamado de teste");
  await page.locator(".ProseMirror").fill("Descrição do problema");
}

/** the Upload input takes one file per pick, as a user adding them one by one */
async function attach(page: Page, files: ReturnType<typeof file>[]) {
  for (const f of files) {
    await page.locator('.ant-upload input[type="file"]').setInputFiles(f);
    await expect(page.getByText(f.name)).toBeVisible();
  }
}

test.use({ storageState: { cookies: [], origins: [] } });

test("a ticket refused before any HTTP answer explains what to do", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /support/create-ticket", (route: Route) =>
    route.abort("failed"),
  );
  await openLegacyForm(page, mockApi);
  await fillLegacyForm(page);

  await page.getByRole("button", { name: "Enviar" }).click();

  const dialog = page.locator(".ant-modal").filter({
    hasText: "Não foi possível enviar",
  });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(
    "Sua solicitação não chegou ao nosso servidor.",
  );
  await expect(dialog).toContainText("anexos são grandes demais");
  await expect(page.getByText("Ocorreu um erro inesperado")).toHaveCount(0);
  expect(ticketRequests(mockApi)).toHaveLength(1);

  // the form keeps what was typed and can be sent again once it works
  await dialog.getByRole("button", { name: "Fechar" }).click();
  mockApi.override("POST /support/create-ticket", { json: TICKET_CREATED });
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(page.getByText("Chamado criado com sucesso")).toBeVisible();
  expect(ticketRequests(mockApi)).toHaveLength(2);
});

test("attachments over the total size are blocked before sending", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /support/create-ticket", { json: TICKET_CREATED });
  await openLegacyForm(page, mockApi);
  await fillLegacyForm(page);

  // each file is under the 2mb per-file cap, together they are over 3mb
  await attach(page, [
    file("captura-1.png", 1_600_000),
    file("captura-2.png", 1_600_000),
  ]);

  await page.getByRole("button", { name: "Enviar" }).click();

  await expect(
    page.getByText("Os anexos somados devem ter até 3mb", { exact: false }),
  ).toBeVisible();
  expect(ticketRequests(mockApi)).toHaveLength(0);

  // dropping one file brings the total back under the cap
  await page
    .locator(".ant-upload-list-item")
    .filter({ hasText: "captura-2.png" })
    .getByRole("button")
    .last()
    .click();
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(page.getByText("Chamado criado com sucesso")).toBeVisible();

  const [request] = ticketRequests(mockApi);
  expect(request.postData).toContain('filename="captura-1.png"');
  expect(request.postData).not.toContain('filename="captura-2.png"');
});

test("a burst of clicks while sending opens a single ticket", async ({
  page,
  mockApi,
}) => {
  let release: () => void = () => {};
  const answered = new Promise<void>((resolve) => (release = resolve));
  mockApi.override("POST /support/create-ticket", async (route: Route) => {
    await answered;
    await route.fulfill({ json: TICKET_CREATED });
  });
  await openLegacyForm(page, mockApi);
  await fillLegacyForm(page);

  const send = page.getByRole("button", { name: "Enviar" });
  // dispatched straight to the element, so the clicks land before React
  // re-renders the button as loading
  await send.evaluate((button: HTMLElement) => {
    button.click();
    button.click();
    button.click();
  });

  await expect.poll(() => ticketRequests(mockApi).length).toBe(1);
  release();

  await expect(page.getByText("Chamado criado com sucesso")).toBeVisible();
  expect(ticketRequests(mockApi)).toHaveLength(1);
});
