import type { Locator, Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import { loginWithFeatures } from "../support/featureLogin";
import { openSelect, pickOption } from "../support/antd";

/**
 * Typing bursts in the rich-text editor (src/components/Editor.jsx) inside a
 * Formik form on the prescription page.
 *
 * Production recorded React error #185 ("Maximum update depth exceeded")
 * while users wrote drug notes or clinical notes. The editor handed each
 * change to Formik from inside ProseMirror's input handler, so every
 * keystroke became a synchronous React commit. When an antd Portal sat under
 * the form (the Modal of the drug notes form, the dropdown of a select that
 * was opened once), each of those commits re-rendered it and its effect left
 * one more update pending. With keystrokes handled back to back React never
 * finished with no work left, its nested-update counter reached the limit
 * after ~30 keys and the next setFieldValue threw.
 *
 * The keystrokes are queued all at once through CDP, so the page handles them
 * back to back, the way it catches up on keys typed during a long task.
 * `keyboard.type` waits for each key and only reproduced the loop now and
 * then.
 */

const BURST = "a".repeat(200);

/** Collects React's update-depth errors (spelled out in dev, a code in prod). */
const watchUpdateDepthErrors = (page: Page) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => {
    if (/Maximum update depth|#185/.test(error.message)) {
      errors.push(error.message);
    }
  });
  return errors;
};

async function typeBurst(page: Page, editor: Locator) {
  await editor.click();
  const cdp = await page.context().newCDPSession(page);
  await Promise.all(
    [...BURST].flatMap((key) => [
      cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key, text: key }),
      cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key }),
    ]),
  );
  await cdp.detach();
}

test("a burst of typing in the drug notes editor reaches the saved notes", async ({
  page,
  mockApi,
}) => {
  const errors = watchUpdateDepthErrors(page);
  mockApi.override("PUT /prescriptions/drug/:id", {
    json: { status: "success", data: {} },
  });

  await page.goto("/prescricao/199");
  await expect(page.getByText("Dipirona 500mg").first()).toBeVisible();

  await page.locator(".gtm-bt-notes").first().click();
  const editor = page.locator(".ant-modal .tiptap");
  await typeBurst(page, editor);

  await expect(editor).toHaveText(BURST);
  expect(errors).toEqual([]);

  // the form holds the whole text, not just what the editor shows
  await page.locator(".gtm-bt-save-drugEdit").click();
  await expect(editor).toHaveCount(0);

  const saves = mockApi.requests.filter(
    (r) => r.method === "PUT" && r.path === "/prescriptions/drug/9001",
  );
  expect(saves).toHaveLength(1);
  expect(JSON.parse(saves[0].postData!).notes).toBe(`<p>${BURST}</p>`);
});

test.describe("clinical notes custom form", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("a burst of typing in a rich-text answer after opening a select", async ({
    page,
    mockApi,
  }) => {
    const errors = watchUpdateDepthErrors(page);
    mockApi.override("POST /patient/list", {
      json: { status: "success", data: [] },
    });
    mockApi.override("GET /memory/:type", {
      json: {
        status: "success",
        data: [
          {
            key: 1,
            type: "custom-forms",
            value: {
              name: "Evolução Teste",
              active: true,
              data: [
                {
                  group: "Avaliação",
                  questions: [
                    {
                      id: "evolucao",
                      label: "Evolução",
                      type: "text",
                      options: [],
                      required: true,
                    },
                    {
                      id: "adesao",
                      label: "Adesão",
                      type: "options",
                      options: ["Sim", "Não"],
                      required: false,
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    });

    // PRIMARYCARE opens the custom forms instead of the plain clinical note
    await loginWithFeatures(page, mockApi, ["PRIMARYCARE"]);
    await page.goto("/prescricao/199");
    await expect(page.getByText("Dipirona 500mg").first()).toBeVisible();

    await page.locator(".gtm-bt-clinical-notes").click();
    const modal = page.locator(".ant-modal");
    await openSelect(modal);
    await pickOption(page, "Evolução Teste");

    // once opened, the answer's dropdown stays mounted inside the form
    await openSelect(modal.locator(".ant-select").last());
    await page.keyboard.press("Escape");

    const editor = modal.locator(".tiptap");
    await typeBurst(page, editor);

    await expect(editor).toHaveText(BURST);
    expect(errors).toEqual([]);
  });
});
