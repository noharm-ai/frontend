import { test, expect } from "../support/mockApi";

/**
 * The "/" variable menu of the intervention observation
 * (src/components/SlashMenu/SlashMenu.tsx, used by
 * src/components/Forms/Intervention/Fields/Observation.jsx).
 *
 * Typing "/" opens the menu on its first item, the arrows move the selection,
 * Escape closes it without closing the modal, and every new opening starts
 * over from the first item.
 */

test.beforeEach(({ mockApi }) => {
  mockApi.override("GET /intervention/reasons", {
    json: { status: "success", data: [] },
  });
});

test("the slash menu opens on its first item and resets on every opening", async ({
  page,
}) => {
  await page.goto("/prescricao/199");
  await expect(page.getByText("Dipirona 500mg")).toBeVisible();
  await page.locator(".gtm-bt-interv").first().click();

  const modal = page.locator(".ant-modal");
  await expect(modal).toBeVisible();

  const observation = modal.locator("textarea").last();
  // the app sidebar is a vertical menu too: tell them apart by the variables
  const menu = page.getByRole("menu").filter({ hasText: "Data atual" });
  const selected = menu.locator(".ant-menu-item-selected");

  await observation.click();
  await observation.pressSequentially("texto /");
  await expect(menu).toBeVisible();
  await expect(selected).toHaveText("Data atual");

  await page.keyboard.press("ArrowDown");
  await expect(selected).toHaveText("Medicamento");

  // Escape closes the menu only; the intervention modal stays open
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(modal).toBeVisible();

  // a new "/" opens it again from the top, not where it was left
  await observation.pressSequentially(" /");
  await expect(menu).toBeVisible();
  await expect(selected).toHaveText("Data atual");
});
