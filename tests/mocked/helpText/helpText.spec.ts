import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";

/**
 * Help text icon (src/components/HelpTextIcon): a "?" next to a field that
 * opens a modal with rich text stored under /help-text/nhapp_<pageKey>.
 * Users with WRITE_HELP_TEXT edit it, and may embed YouTube videos.
 */

const HELP_PATH = "/help-text/nhapp_priorizacao-setores";

const VIDEO_SRC = "https://www.youtube-nocookie.com/embed/aaaaaaaaaaa";

const openDepartmentsHelp = async (page: Page) => {
  await page.goto("/priorizacao/pacientes/cards");
  await page.getByRole("button", { name: "Ver mais" }).click();
  await page
    .locator(".form-label-actions")
    .filter({ hasText: "Setores" })
    .getByRole("button")
    .click();

  return page.getByRole("dialog");
};

test("embeds YouTube videos and drops any other iframe", async ({
  page,
  mockApi,
}) => {
  mockApi.override(`GET ${HELP_PATH}`, {
    json: {
      status: "success",
      data: {
        key: "nhapp_priorizacao-setores",
        content:
          "<p>Como filtrar setores</p>" +
          `<div data-youtube-video=""><iframe src="${VIDEO_SRC}" onload="alert(1)"></iframe></div>` +
          '<iframe src="https://example.com/embed/evil"></iframe>',
      },
    },
  });

  const dialog = await openDepartmentsHelp(page);

  await expect(dialog.getByText("Como filtrar setores")).toBeVisible();

  const iframes = dialog.locator("iframe");
  await expect(iframes).toHaveCount(1);
  await expect(iframes.first()).toHaveAttribute("src", VIDEO_SRC);
  await expect(iframes.first()).not.toHaveAttribute("onload", /.*/);
  await expect(dialog.locator(".help-video iframe")).toHaveCount(1);
});

test.describe("with WRITE_HELP_TEXT", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("adds a YouTube video from its url and saves it", async ({
    page,
    mockApi,
  }) => {
    mockApi.override(`GET ${HELP_PATH}`, {
      json: {
        status: "success",
        data: { key: "nhapp_priorizacao-setores", content: null },
      },
    });
    mockApi.override(`PUT ${HELP_PATH}`, (route) =>
      route.fulfill({
        json: {
          status: "success",
          data: {
            key: "nhapp_priorizacao-setores",
            content: route.request().postDataJSON().content,
          },
        },
      }),
    );

    await loginWithPermissions(page, mockApi, [
      "READ_BASIC_FEATURES",
      "WRITE_BASIC_FEATURES",
      "READ_PRESCRIPTION",
      "WRITE_HELP_TEXT",
    ]);

    // an empty help text opens straight into the editor
    const dialog = await openDepartmentsHelp(page);
    await expect(dialog.locator(".tiptap")).toBeVisible();

    page.once("dialog", (prompt) =>
      prompt.accept("https://www.youtube.com/watch?v=aaaaaaaaaaa&t=30"),
    );
    await dialog.getByRole("button", { name: "youtube" }).click();

    await expect(dialog.locator(".tiptap iframe")).toHaveAttribute(
      "src",
      /^https:\/\/www\.youtube-nocookie\.com\/embed\/aaaaaaaaaaa/,
    );

    // a video alone is content: it must not be saved as an empty help text
    await dialog.getByRole("button", { name: "Salvar" }).click();
    // a successful save closes the modal
    await expect(dialog).toBeHidden();

    const put = mockApi.requests.find(
      (r) => r.method === "PUT" && r.path === HELP_PATH,
    );
    const content = JSON.parse(put?.postData ?? "{}").content;
    expect(content).toContain("data-youtube-video");
    expect(content).toContain(
      "https://www.youtube-nocookie.com/embed/aaaaaaaaaaa",
    );
  });

  test("re-edits a saved video and removes it", async ({ page, mockApi }) => {
    mockApi.override(`GET ${HELP_PATH}`, {
      json: {
        status: "success",
        data: {
          key: "nhapp_priorizacao-setores",
          content: `<p>Veja o vídeo</p><div data-youtube-video=""><iframe src="${VIDEO_SRC}"></iframe></div>`,
        },
      },
    });

    await loginWithPermissions(page, mockApi, [
      "READ_BASIC_FEATURES",
      "WRITE_BASIC_FEATURES",
      "READ_PRESCRIPTION",
      "WRITE_HELP_TEXT",
    ]);

    const dialog = await openDepartmentsHelp(page);
    await dialog.getByRole("button", { name: "Editar" }).click();

    // the stored markup parses back into a video node
    const video = dialog.locator(".tiptap div[data-youtube-video]");
    await expect(video.locator("iframe")).toHaveAttribute(
      "src",
      new RegExp(`^${VIDEO_SRC}`),
    );

    await video.click();
    await page.keyboard.press("Backspace");

    await expect(dialog.locator(".tiptap iframe")).toHaveCount(0);
    await expect(dialog.getByText("Veja o vídeo")).toBeVisible();
  });

  test("rejects a url that is not a YouTube video", async ({
    page,
    mockApi,
  }) => {
    mockApi.override(`GET ${HELP_PATH}`, {
      json: {
        status: "success",
        data: { key: "nhapp_priorizacao-setores", content: null },
      },
    });

    await loginWithPermissions(page, mockApi, [
      "READ_BASIC_FEATURES",
      "WRITE_BASIC_FEATURES",
      "READ_PRESCRIPTION",
      "WRITE_HELP_TEXT",
    ]);

    const dialog = await openDepartmentsHelp(page);
    await expect(dialog.locator(".tiptap")).toBeVisible();

    page.once("dialog", (prompt) =>
      prompt.accept("https://example.com/watch?v=aaaaaaaaaaa"),
    );
    await dialog.getByRole("button", { name: "youtube" }).click();

    await expect(page.getByText("URL do YouTube inválida")).toBeVisible();
    await expect(dialog.locator(".tiptap iframe")).toHaveCount(0);
  });
});
