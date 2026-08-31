import { expect, Locator, Page } from "@playwright/test";

/**
 * Drug rows of the table shown in the active tab.
 *
 * Scoped on purpose: `.ant-table` matches every table on the page, so an
 * unscoped row index depends on which tables happen to be mounted at that
 * moment. Filtering by the intervention button also skips group/expanded rows.
 *
 * antd 6 renamed the tab pane element: `.ant-tabs-tabpane` became
 * `.ant-tabs-content` (the old `.ant-tabs-content` wrapper is now
 * `.ant-tabs-body`), so the active pane is `.ant-tabs-content-active`.
 */
const drugRows = (page: Page): Locator =>
  page
    .locator(".ant-tabs-content-active .ant-table-tbody tr")
    .filter({ has: page.locator(".gtm-bt-interv") });

/** Opens the intervention modal of a drug row (0-based). */
export const openDrugIntervention = async (page: Page, row: number) => {
  await drugRows(page).nth(row).locator(".gtm-bt-interv").click();
};

/** Opens the patient (admission level) intervention modal. */
export const openPatientIntervention = async (page: Page) => {
  await page.locator(".gtm-bt-patient-intervention").first().click();
};

/**
 * The reason select of the intervention form, only once the form is on screen
 * and its options have loaded.
 *
 * Waiting for `.ant-select-loading` to detach is not enough by itself: it also
 * passes when the form never rendered at all.
 */
export const interventionReasonSelect = async (page: Page): Promise<Locator> => {
  const select = page.locator(".ant-modal-body .ant-select").first();

  await expect(select).toBeVisible();
  await expect(select).not.toHaveClass(/ant-select-loading/);

  return select;
};

/** An option of the select dropdown that is currently open. */
export const selectOption = (
  page: Page,
  label: string | RegExp,
  options?: { exact?: boolean },
): Locator =>
  page
    .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
    .getByText(label, options);

/**
 * Saves the intervention through one of the "Salvar" split-button menu items.
 *
 * The menu opens on hover and antd closes it as soon as the pointer leaves the
 * trigger, so the item has to be hovered before being clicked: playwright's
 * click retry loop re-resolves and re-scrolls without keeping the hover.
 */
export const saveInterventionAs = async (page: Page, option: string) => {
  const trigger = page.locator(
    "#btn-interv-save-action button.ant-dropdown-trigger",
  );
  const item = page
    .locator(".ant-dropdown:not(.ant-dropdown-hidden)")
    .getByRole("menuitem", { name: option, exact: true });

  await trigger.hover();
  await expect(item).toBeVisible();
  await item.hover();
  await item.click();
};
