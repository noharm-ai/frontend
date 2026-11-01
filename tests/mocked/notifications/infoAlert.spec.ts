import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import { loginWithAuth } from "../support/featureLogin";

/**
 * Notification bell (src/features/notifications/InfoAlert).
 *
 * The notifications come in the /authenticate response and are shown on the
 * prioritization header only: a bell with a badge opens a modal listing them,
 * and "mark as read" stores a memory item keyed by notification and user. The
 * bell disappears once the last one is read.
 */

test.use({ storageState: { cookies: [], origins: [] } });

const NOTIFICATIONS = [
  {
    id: 11,
    date: "2026-03-10",
    title: "Manutenção programada",
    text: "<p>O sistema ficará indisponível no sábado.</p>",
  },
  {
    id: 12,
    date: "2026-03-12",
    title: "Nova versão disponível",
    text: "<p>Confira as novidades da versão.</p>",
  },
];

const PRIORITIZATION = "/priorizacao/pacientes/cards";

/** Opens the modal and waits for its zoom-in to end: a click during it can land on the mask */
async function openNotifications(page: Page) {
  await page.locator(".anticon-bell").click();
  const modal = page.getByRole("dialog");
  await expect(modal.getByText("Manutenção programada")).toBeVisible();
  await expect(page.locator(".ant-modal")).not.toHaveClass(/zoom/);
  return modal;
}

test("shows the bell with the unread count and lists the notifications", async ({
  page,
  mockApi,
}) => {
  await loginWithAuth(page, mockApi, { notifications: NOTIFICATIONS });
  await page.goto(PRIORITIZATION);

  const bell = page.locator(".anticon-bell");
  await expect(bell).toBeVisible();
  await expect(page.locator(".ant-badge-count")).toHaveText("2");

  await bell.click();
  const modal = page.getByRole("dialog");
  await expect(modal.getByText("Manutenção programada")).toBeVisible();
  await expect(modal.getByText("Nova versão disponível")).toBeVisible();
  await expect(modal.getByText("10/03/2026")).toBeVisible();
  await expect(modal.getByText("12/03/2026")).toBeVisible();
  await expect(
    modal.getByRole("button", { name: "Marcar como lida" }),
  ).toHaveCount(2);
});

test("hides the bell when there are no notifications", async ({
  page,
  mockApi,
}) => {
  await loginWithAuth(page, mockApi, { notifications: [] });
  await page.goto(PRIORITIZATION);

  await expect(page.locator(".anticon-bell")).toHaveCount(0);
});

test("marking as read stores a per-user memory item and removes the card", async ({
  page,
  mockApi,
}) => {
  await loginWithAuth(page, mockApi, { notifications: NOTIFICATIONS });
  mockApi.override("PUT /memory", { json: { status: "success", data: 1 } });
  await page.goto(PRIORITIZATION);

  const modal = await openNotifications(page);
  await modal.getByRole("button", { name: "Marcar como lida" }).first().click();

  await expect(modal.getByText("Manutenção programada")).toHaveCount(0);
  await expect(modal.getByText("Nova versão disponível")).toBeVisible();
  await expect(page.locator(".ant-badge-count")).toHaveText("1");

  const puts = mockApi.requests.filter(
    (r) => r.method === "PUT" && r.path === "/memory",
  );
  expect(puts).toHaveLength(1);
  expect(JSON.parse(puts[0].postData ?? "{}")).toEqual({
    type: "info-alert-11-1",
    value: true,
  });
});

test("reading the last notification removes the bell", async ({
  page,
  mockApi,
}) => {
  await loginWithAuth(page, mockApi, {
    notifications: [NOTIFICATIONS[0]],
  });
  mockApi.override("PUT /memory", { json: { status: "success", data: 1 } });
  await page.goto(PRIORITIZATION);

  const modal = await openNotifications(page);
  await modal.getByRole("button", { name: "Marcar como lida" }).click();

  await expect(page.locator(".anticon-bell")).toHaveCount(0);
});

test("keeps the notification when saving fails and shows the server message", async ({
  page,
  mockApi,
}) => {
  await loginWithAuth(page, mockApi, { notifications: NOTIFICATIONS });
  mockApi.override("PUT /memory", {
    status: 500,
    json: { status: "error", message: "Falha ao gravar a leitura" },
  });
  await page.goto(PRIORITIZATION);

  const modal = await openNotifications(page);
  await modal.getByRole("button", { name: "Marcar como lida" }).first().click();

  await expect(page.getByText("Falha ao gravar a leitura")).toBeVisible();
  await expect(modal.getByText("Manutenção programada")).toBeVisible();
  await expect(page.locator(".ant-badge-count")).toHaveText("2");
});

test("does not show the bell outside the prioritization screens", async ({
  page,
  mockApi,
}) => {
  await loginWithAuth(page, mockApi, { notifications: NOTIFICATIONS });
  await page.goto("/novidades");

  await expect(page.getByText("E2E Test").first()).toBeVisible();
  await expect(page.locator(".anticon-bell")).toHaveCount(0);
});
