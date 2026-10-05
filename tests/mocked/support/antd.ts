import { expect } from "@playwright/test";
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

/**
 * Opens the antd Dropdown behind `trigger` and clicks its `item` menuitem
 * (a string matches the accessible name exactly; pass a RegExp when the item
 * carries an icon, whose name prefixes the label).
 *
 * The popup is found by the item it carries, and each step waits for its
 * motion to settle: a popup still playing its leave motion (from a previous
 * pick) is visible and holds the menu as it was rendered back then, so a
 * trigger click landing on it toggles it shut instead of opening a fresh one,
 * and a role lookup can resolve to its stale items. Waiting for the popup to
 * close after the click also proves the pick was handled.
 */
export async function pickMenuItem(
  page: Page,
  trigger: Locator,
  item: string | RegExp,
) {
  const byName = { name: item, exact: true };
  const popup = page
    .locator(".ant-dropdown")
    .filter({ has: page.getByRole("menuitem", byName) });

  await expect(popup).toBeHidden();
  await trigger.click();
  await expect(popup).toBeVisible();
  await expect(popup).not.toHaveClass(/-(enter|appear|leave)/);

  await popup.getByRole("menuitem", byName).click();
  await expect(popup).toBeHidden();
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
