import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loginWithAuth } from "../support/featureLogin";
import { openSelect, pickOption } from "../support/antd";

/**
 * Support tickets are blocked while the user still owes mandatory training.
 * ADMIN_SUPPORT holders may override it for an urgent ticket, which the backend
 * records in the ticket body. The backend enforces the rule regardless — these
 * tests cover what the UI offers.
 */

const BASE_PERMISSIONS = [
  "READ_BASIC_FEATURES",
  "WRITE_BASIC_FEATURES",
  "READ_PRESCRIPTION",
  "READ_SUPPORT",
  "WRITE_SUPPORT",
];

const installSupportHandlers = (mockApi: MockApi) => {
  mockApi.override("POST /support/knowledge-base-articles", {
    json: { status: "success", data: [] },
  });
  mockApi.override("POST /support/create-ticket", {
    json: {
      status: "success",
      data: [{ id: 1, access_token: "tok", ticket_ref: "REF-1" }],
    },
  });
};

const openSupportDrawer = async (page: any) => {
  await page.getByText("E2E Test").click();
  // the sider also has a "Central de Ajuda" entry, so scope to the dropdown
  await page
    .locator(".ant-dropdown-menu")
    .getByRole("menuitem", { name: "Ajuda" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Suporte NoHarm" }),
  ).toBeVisible();
};

test.use({ storageState: { cookies: [], origins: [] } });

test("pending training removes the ticket path and explains why", async ({
  page,
  mockApi,
}) => {
  installSupportHandlers(mockApi);
  await loginWithAuth(page, mockApi, {
    permissions: BASE_PERMISSIONS,
    training: { mandatoryTotal: 2, mandatoryFinished: 0 },
  });

  await openSupportDrawer(page);

  await expect(page.getByText("Treinamento obrigatório pendente")).toBeVisible();
  await expect(page.getByText("Abrir chamado", { exact: true })).toHaveCount(0);

  // the AI assistant and the knowledge base stay available
  await expect(page.getByText("Suporte IA")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Ir para o treinamento" }),
  ).toBeVisible();
});

test("the notice links to the training center", async ({ page, mockApi }) => {
  installSupportHandlers(mockApi);
  mockApi.override("GET /training/list", { json: { status: "success", data: [] } });
  await loginWithAuth(page, mockApi, {
    permissions: BASE_PERMISSIONS,
    training: { mandatoryTotal: 1, mandatoryFinished: 0 },
  });

  await openSupportDrawer(page);
  await page.getByRole("button", { name: "Ir para o treinamento" }).click();

  await expect(page).toHaveURL(/\/treinamento$/);
});

test("ADMIN_SUPPORT can open an urgent ticket but must confirm urgency", async ({
  page,
  mockApi,
}) => {
  installSupportHandlers(mockApi);
  await loginWithAuth(page, mockApi, {
    permissions: [...BASE_PERMISSIONS, "ADMIN_SUPPORT"],
    training: { mandatoryTotal: 1, mandatoryFinished: 0 },
  });

  await openSupportDrawer(page);

  await page.getByText("Abrir chamado urgente").click();

  const urgentCheckbox = page.getByRole("checkbox", {
    name: "Este chamado é urgente e não pode aguardar",
  });
  await expect(urgentCheckbox).toBeVisible();

  // fill the form but leave urgency unconfirmed
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(
    page.getByText("Confirme que o chamado é urgente", { exact: false }),
  ).toBeVisible();
  expect(
    mockApi.requests.filter((r) => r.path === "/support/create-ticket"),
  ).toHaveLength(0);

  // confirming urgency lets the ticket through, flagged for the backend
  await urgentCheckbox.check();
  await openSelect(page.locator(".form-row").filter({ hasText: "Tipo de" }));
  await pickOption(page, "Erro");
  await page.getByPlaceholder("Ex: Erro ao checar prescrição").fill("Assunto");
  await page.locator(".ProseMirror").fill("Descrição do problema");

  await page.getByRole("button", { name: "Enviar" }).click();

  await expect(page.getByText("Chamado criado com sucesso")).toBeVisible();

  const [request] = mockApi.requests.filter(
    (r) => r.path === "/support/create-ticket",
  );
  expect(request).toBeTruthy();
  expect(request.postData).toContain('name="urgent"');
  expect(request.postData).toContain("true");
});

test("no pending training keeps the normal ticket flow", async ({
  page,
  mockApi,
}) => {
  installSupportHandlers(mockApi);
  await loginWithAuth(page, mockApi, {
    permissions: BASE_PERMISSIONS,
    training: { mandatoryTotal: 3, mandatoryFinished: 3 },
  });

  await openSupportDrawer(page);

  await expect(page.getByText("Abrir chamado", { exact: true })).toBeVisible();
  await expect(page.getByText("Treinamento obrigatório pendente")).toHaveCount(
    0,
  );

  await page.getByText("Abrir chamado", { exact: true }).click();
  await expect(
    page.getByRole("checkbox", {
      name: "Este chamado é urgente e não pode aguardar",
    }),
  ).toHaveCount(0);
});
