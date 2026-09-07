import type { Locator, Page } from "@playwright/test";

/**
 * antd Select renders its a11y options in a hidden virtual list and its
 * placeholder with pointer-events: none, so role/text based clicks time
 * out. Interact through the visible pieces instead.
 */

/**
 * Opens the (first) antd Select inside `scope`. The click goes to
 * `.ant-select-content` — the box antd binds the toggle to — and not to the
 * inner combobox input: once the Select holds a value, the rendered value (a
 * Tag, in most of our filters) sits on top of that input, and a click aimed at
 * the input is blocked by it. The value renders *inside* the content box, so
 * clicking the box is a real user click, actionability checks included.
 */
export async function openSelect(scope: Locator) {
  await scope.locator(".ant-select-content").first().click();
}

/** Opens the antd Select carrying `id`. */
export async function openSelectById(page: Page, id: string) {
  await openSelect(
    page.locator(".ant-select").filter({ has: page.locator(`#${id}`) }),
  );
}

/** Clicks an option in the currently open Select dropdown. */
export async function pickOption(page: Page, text: string) {
  await page
    .locator(
      ".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option",
    )
    .filter({ hasText: text })
    .first()
    .click();
}
