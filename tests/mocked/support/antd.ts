import type { Locator, Page } from "@playwright/test";

/**
 * antd Select renders its a11y options in a hidden virtual list and its
 * placeholder with pointer-events: none, so role/text based clicks time
 * out. Interact through the visible pieces instead.
 */

/** Opens the (single) antd Select inside `scope`. */
export async function openSelect(scope: Locator) {
  await scope.getByRole("combobox").click();
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
