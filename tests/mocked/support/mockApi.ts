import { test as base, expect, Route } from "@playwright/test";
import type { Page } from "@playwright/test";

import { defaultHandlers } from "./defaultHandlers";

/**
 * Nothing listens on this address in mocked mode: every request is
 * intercepted by context.route() before it reaches the network. It only
 * needs to match the VITE_APP_API_URL the dev server was started with.
 */
export const API_URL = process.env.VITE_APP_API_URL || "http://localhost:5001";

type Reply = {
  status?: number;
  json?: unknown;
  body?: string;
  contentType?: string;
};

export type Handler = Reply | ((route: Route) => Promise<void> | void);

/**
 * Handler keys are "METHOD /path". Path segments starting with ":" match
 * any single segment: "GET /prescriptions/:id" matches "GET /prescriptions/199".
 * Exact keys win over parameterized ones. Query strings are ignored.
 */
export class MockApi {
  private handlers = new Map<string, Handler>();
  readonly unmatched: string[] = [];
  /** Requests answered by the mock, e.g. "POST /prescriptions/status". */
  readonly requests: { method: string; path: string; postData?: string }[] = [];

  constructor(private page: Page) {}

  async install(defaults: Record<string, Handler>) {
    Object.entries(defaults).forEach(([key, handler]) =>
      this.handlers.set(key, handler),
    );

    // context-level so popup windows (window.open) are intercepted too
    await this.page.context().route(`${API_URL}/**`, async (route) => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      const key = this.findHandler(request.method(), path);

      if (!key) {
        this.unmatched.push(`${request.method()} ${path}`);
        return route.fulfill({
          status: 599,
          json: { status: "error", message: `UNMOCKED endpoint: ${path}` },
        });
      }

      this.requests.push({
        method: request.method(),
        path,
        postData: request.postData() ?? undefined,
      });

      const handler = this.handlers.get(key)!;
      if (typeof handler === "function") {
        return handler(route);
      }
      return route.fulfill({
        status: handler.status ?? 200,
        contentType: handler.contentType ?? "application/json",
        body:
          handler.body ?? JSON.stringify(handler.json ?? { status: "success" }),
      });
    });
  }

  /**
   * Replace (or add) the handler for one endpoint. Takes effect for the
   * next request, so it can also be called mid-test to flip an endpoint
   * into an error state.
   */
  override(key: string, handler: Handler) {
    this.handlers.set(key, handler);
  }

  /** Fails the test if any request hit an endpoint without a handler. */
  assertAllMatched() {
    expect
      .soft(this.unmatched, "API calls without a mock handler")
      .toEqual([]);
  }

  private findHandler(method: string, path: string): string | undefined {
    const exact = `${method} ${path}`;
    if (this.handlers.has(exact)) {
      return exact;
    }

    const pathSegments = path.split("/").filter(Boolean);
    for (const key of this.handlers.keys()) {
      const [keyMethod, keyPath] = key.split(" ");
      if (keyMethod !== method || !keyPath.includes(":")) {
        continue;
      }
      const keySegments = keyPath.split("/").filter(Boolean);
      if (keySegments.length !== pathSegments.length) {
        continue;
      }
      const matches = keySegments.every(
        (segment, i) =>
          segment.startsWith(":") || segment === pathSegments[i],
      );
      if (matches) {
        return key;
      }
    }
    return undefined;
  }
}

type MockFixtures = {
  mockApi: MockApi;
  /**
   * When true (default), a test fails if the app called any endpoint
   * without a handler. Opt out with test.use({ strictMocks: false })
   * while exploring a new page.
   */
  strictMocks: boolean;
};

export const test = base.extend<MockFixtures>({
  strictMocks: [true, { option: true }],
  mockApi: [
    async ({ page, strictMocks }, use) => {
      const mockApi = new MockApi(page);
      await mockApi.install(defaultHandlers());
      await use(mockApi);
      if (strictMocks) {
        mockApi.assertAllMatched();
      }
    },
    { auto: true },
  ],
});

export { expect };
