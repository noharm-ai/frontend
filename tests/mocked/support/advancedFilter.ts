import type { Page } from "@playwright/test";

/**
 * Opens the "Ver mais" secondary filters of an AdvancedFilter-styled search
 * box and waits for their expand transition to finish. Until it does, the
 * fields keep sliding down, so a click aimed at one can land on whatever is
 * passing under the pointer.
 */
export async function openMoreFilters(page: Page) {
  await page.getByRole("button", { name: /Ver mais/ }).click();
  await page
    .locator(".open .filters")
    .evaluate((filters) =>
      Promise.all(
        filters
          .getAnimations({ subtree: true })
          .map((animation) => animation.finished),
      ),
    );
}
