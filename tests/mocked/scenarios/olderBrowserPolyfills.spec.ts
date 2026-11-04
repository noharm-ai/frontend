import { test, expect } from "../support/mockApi";

// start unauthenticated: the polyfills must be in place before any login
test.use({ storageState: { cookies: [], origins: [] } });

/**
 * Older browsers (e.g. Firefox 83) lack Array.prototype.findLast,
 * findLastIndex and at, String.prototype.at and Object.hasOwn. tiptap calls
 * findLast on every editor transaction, so without it typed text never
 * reached form state. src/lib/polyfills.ts installs them before the app
 * boots. Chromium has them natively, so the init script deletes them first
 * to simulate an older browser.
 */
test("app installs built-in polyfills when the browser lacks them", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const strip = (target: object, names: string[]) =>
      names.forEach((name) => delete (target as Record<string, unknown>)[name]);
    strip(Array.prototype, ["at", "findLast", "findLastIndex"]);
    strip(String.prototype, ["at"]);
    strip(Object, ["hasOwn"]);
  });

  await page.goto("/");

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByPlaceholder("Email")).toBeVisible();

  const result = await page.evaluate(() => {
    type Modern = {
      at: (index: number) => unknown;
      findLast: (predicate: (value: number) => boolean) => unknown;
      findLastIndex: (predicate: (value: number) => boolean) => number;
    };
    const list = [1, 2, 3] as unknown as Modern;
    const text = "abc" as unknown as Modern;
    const { hasOwn } = Object as unknown as {
      hasOwn: (object: object, key: string) => boolean;
    };
    const keys: string[] = [];
    for (const key in [1]) keys.push(key);

    return {
      native: Function.prototype.toString
        .call(list.findLast)
        .includes("[native code]"),
      atLast: list.at(-1),
      atNaN: list.at(NaN),
      atOutOfRange: list.at(5),
      findLast: list.findLast((value) => value < 3),
      findLastIndexMissing: list.findLastIndex((value) => value > 5),
      stringAt: text.at(-1),
      hasOwn: [hasOwn({ a: 1 }, "a"), hasOwn({}, "toString")],
      enumerableKeys: keys,
    };
  });

  expect(result).toEqual({
    native: false,
    atLast: 3,
    atNaN: 1,
    atOutOfRange: undefined,
    findLast: 2,
    findLastIndexMissing: -1,
    stringAt: "c",
    hasOwn: [true, false],
    enumerableKeys: ["0"],
  });
});
