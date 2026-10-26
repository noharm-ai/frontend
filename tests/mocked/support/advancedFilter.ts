import type { Page } from "@playwright/test";

/**
 * Opens the "Ver mais" secondary filters of an AdvancedFilter-styled search
 * box and waits for their expand transition to finish. Until it does, the
 * fields keep sliding down, so a click aimed at one can land on whatever is
 * passing under the pointer.
 */
export async function openMoreFilters(page: Page) {
  await page.getByRole("button", { name: /Ver mais/ }).click();
  await page.locator(".open .filters").evaluate(async (filters) => {
    // a re-render mid-way cancels the running transition (its `finished`
    // rejects) and starts a new one, so wait until none is left
    const running = () =>
      filters
        .getAnimations()
        .filter((animation) => animation instanceof CSSTransition);
    for (let transitions = running(); transitions.length; ) {
      await Promise.allSettled(transitions.map((t) => t.finished));
      transitions = running();
    }
  });
}
