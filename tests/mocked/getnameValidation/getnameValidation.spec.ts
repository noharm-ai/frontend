import http from "http";
import type { AddressInfo } from "net";

import { test, expect } from "../support/mockApi";

/**
 * Public getname validation page (/validar-getname/:token). Someone at the
 * hospital opens a link generated in the admin and their browser tests the
 * getname - without a NoHarm account, which the schema may not have yet.
 *
 * The NoHarm backend is mocked as in every other spec. The getname is not: a
 * route fulfilled by Playwright skips what this page exists to diagnose (CORS,
 * a refused connection, a server that never answers), so each test starts a
 * small real HTTP server on a free port and the browser calls it for real.
 * One thing stays out of reach: with routing on, Playwright answers CORS
 * preflights itself, so the preflight of the lookup with a token never
 * reaches this server.
 *
 * As in the certificate spec, there is no `loginWithAuth(...)` anywhere: that
 * absence is part of what is being asserted.
 */

const TOKEN = "42-0123456789abcdef0123456789abcdef0123456789abcdef";
const ORIGIN = "http://localhost:3000";

type GetnameOptions = {
  cors?: boolean;
  authEnabled?: boolean;
  database?: "healthy" | "unhealthy";
  // status of GET /patient-name/0 when the request is authorized
  lookupStatus?: number;
  // bearer the getname accepts; any other answers 401
  acceptToken?: string;
  legacy?: boolean;
  hang?: boolean;
};

type Getname = {
  url: string;
  requests: string[];
  close: () => Promise<void>;
};

const startGetname = async (options: GetnameOptions = {}): Promise<Getname> => {
  const {
    cors = true,
    authEnabled = false,
    database = "healthy",
    lookupStatus = 400,
    acceptToken,
    legacy = false,
    hang = false,
  } = options;
  const requests: string[] = [];

  const server = http.createServer((req, res) => {
    requests.push(`${req.method} ${req.url}`);

    if (hang) {
      // accepts the connection and never answers: a firewall dropping packets
      return;
    }

    const headers: Record<string, string> = cors
      ? {
          "Access-Control-Allow-Origin": ORIGIN,
          "Access-Control-Allow-Headers": "authorization",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        }
      : {};
    const send = (status: number, body: unknown, contentType?: string) => {
      res.writeHead(status, {
        ...headers,
        "Content-Type": contentType ?? "application/json",
      });
      res.end(typeof body === "string" ? body : JSON.stringify(body));
    };

    if (req.method === "OPTIONS") {
      return send(cors ? 200 : 400, "");
    }

    if (req.url === "/" && legacy) {
      return send(200, "NoHarm - GetName\n", "text/plain");
    }

    if (req.url === "/health" && !legacy) {
      return send(200, { status: "healthy", version: "3.1.0" });
    }

    if (req.url === "/health/detailed" && !legacy) {
      return send(database === "healthy" ? 200 : 503, {
        status: database,
        version: "3.1.0",
        database: {
          status: database,
          type: "postgres",
          latency_ms: database === "healthy" ? 3.2 : null,
        },
        cache: { status: "healthy", size: 0, max_size: 1000 },
        auth_enabled: authEnabled,
      });
    }

    if (req.url === "/patient-name/0") {
      if (acceptToken && req.headers.authorization !== `Bearer ${acceptToken}`) {
        return send(401, { status: "error", message: "Token inválido" });
      }
      return send(lookupStatus, {
        status: "error",
        idPatient: 0,
        name: "Paciente 0",
      });
    }

    return send(404, { detail: "Not Found" });
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;

  return {
    url: `http://localhost:${port}/`,
    requests,
    close: () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  };
};

const plan = (getname: { url: string }, overrides: object = {}) => ({
  status: "success",
  data: {
    valid: true,
    schema: "hospital_teste",
    expiresAt: "2030-01-01T12:00:00+00:00",
    runs: 0,
    maxRuns: 30,
    getnameType: "default",
    mode: "browser",
    baseUrl: getname.url,
    nameUrl: `${getname.url}patient-name/{idPatient}`,
    lookup: "open",
    ...overrides,
  },
});

const saved = (ticket: string | null = "T0042", runs = 1) => ({
  status: "success",
  data: { saved: true, status: "passed", ticket, runs, maxRuns: 30 },
});

// anonymous: no stored session at all
test.use({ storageState: { cookies: [], origins: [] } });

let getname: Getname | undefined;

test.afterEach(async () => {
  await getname?.close();
  getname = undefined;
});

const verdict = (page: import("@playwright/test").Page) =>
  page.locator("[data-diagnosis]");

const check = (page: import("@playwright/test").Page, id: string) =>
  page.locator(`[data-check="${id}"]`);

test("an anonymous visitor tests a healthy getname and the receipt becomes a ticket", async ({
  page,
  mockApi,
}) => {
  getname = await startGetname();
  mockApi.override("GET /public/getname-validation/:token", {
    json: plan(getname),
  });
  mockApi.override("POST /public/getname-validation/:token/result", {
    json: saved(),
  });

  await page.goto(`/validar-getname/${TOKEN}`);

  // the auth gate must not bounce an anonymous visitor to login
  await expect(page).toHaveURL(new RegExp(`/validar-getname/${TOKEN}$`));
  await expect(page.getByText("hospital_teste")).toBeVisible();
  await expect(page.getByText(getname.url)).toBeVisible();

  // nothing is called before the person asks for it
  expect(getname.requests).toEqual([]);

  await page.getByRole("button", { name: "Iniciar teste" }).click();

  await expect(verdict(page)).toHaveAttribute("data-diagnosis", "ok");
  await expect(
    page.getByText("Tudo certo: o getname está acessível e funcionando"),
  ).toBeVisible();
  for (const id of ["reachability", "health", "database", "auth_config", "lookup"]) {
    await expect(check(page, id)).toHaveAttribute("data-status", "passed");
  }
  await expect(page.getByText("no chamado T0042")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Testar novamente" }),
  ).toBeEnabled();

  const result = mockApi.requests.find((r) => r.path.endsWith("/result"));
  const receipt = JSON.parse(result!.postData!);
  expect(result!.path).toBe(`/public/getname-validation/${TOKEN}/result`);
  expect(receipt.status).toBe("passed");
  expect(receipt.diagnosis).toBe("ok");
  expect(receipt.checks.map((c: any) => c.id)).toEqual([
    "config",
    "environment",
    "reachability",
    "health",
    "database",
    "auth_config",
    "lookup",
  ]);
  expect(receipt.environment.pageOrigin).toBe(ORIGIN);
  expect(receipt.environment.targetAddressSpace).toBe("loopback");
  expect(receipt.environment.getnameVersion).toBe("3.1.0");
  // the lookup asks for a patient that does not exist, and no name travels
  expect(getname.requests).toContain("GET /patient-name/0");
  expect(result!.postData).not.toContain("Paciente 0");
});

test("a getname with authentication is tested with the token the backend issues", async ({
  page,
  mockApi,
}) => {
  getname = await startGetname({ authEnabled: true, acceptToken: "getname-jwt" });
  mockApi.override("GET /public/getname-validation/:token", {
    json: plan(getname, { getnameType: "auth", lookup: "token" }),
  });
  mockApi.override("POST /public/getname-validation/:token/auth-token", {
    json: { status: "success", data: { token: "getname-jwt" } },
  });
  mockApi.override("POST /public/getname-validation/:token/result", {
    json: saved(),
  });

  await page.goto(`/validar-getname/${TOKEN}`);
  await page.getByRole("button", { name: "Iniciar teste" }).click();

  await expect(verdict(page)).toHaveAttribute("data-diagnosis", "ok");
  // this getname answers 401 to any other bearer: passing means the token went
  await expect(check(page, "lookup")).toHaveAttribute("data-status", "passed");
  expect(getname.requests).toContain("GET /patient-name/0");
});

test("a token the getname refuses points at the secret", async ({
  page,
  mockApi,
}) => {
  getname = await startGetname({ authEnabled: true, acceptToken: "another-jwt" });
  mockApi.override("GET /public/getname-validation/:token", {
    json: plan(getname, { getnameType: "auth", lookup: "token" }),
  });
  mockApi.override("POST /public/getname-validation/:token/auth-token", {
    json: { status: "success", data: { token: "getname-jwt" } },
  });
  mockApi.override("POST /public/getname-validation/:token/result", {
    json: saved(),
  });

  await page.goto(`/validar-getname/${TOKEN}`);
  await page.getByRole("button", { name: "Iniciar teste" }).click();

  await expect(verdict(page)).toHaveAttribute(
    "data-diagnosis",
    "auth_secret_mismatch",
  );
  await expect(check(page, "lookup")).toHaveAttribute("data-status", "failed");
});

test("a getname that asks for a token the configuration does not send is a mismatch", async ({
  page,
  mockApi,
}) => {
  getname = await startGetname({ authEnabled: true });
  mockApi.override("GET /public/getname-validation/:token", {
    json: plan(getname),
  });
  mockApi.override("POST /public/getname-validation/:token/result", {
    json: saved(),
  });

  await page.goto(`/validar-getname/${TOKEN}`);
  await page.getByRole("button", { name: "Iniciar teste" }).click();

  await expect(verdict(page)).toHaveAttribute("data-diagnosis", "auth_mismatch");
  // the lookup is not attempted once the mismatch is known
  expect(getname.requests).not.toContain("GET /patient-name/0");
});

test("nothing listening at the address is reported as unreachable, with a way to see why", async ({
  page,
  mockApi,
}) => {
  getname = await startGetname();
  const url = getname.url;
  await getname.close();
  getname = undefined;

  mockApi.override("GET /public/getname-validation/:token", {
    json: plan({ url }),
  });
  mockApi.override("POST /public/getname-validation/:token/result", {
    json: saved(),
  });

  await page.goto(`/validar-getname/${TOKEN}`);
  await page.getByRole("button", { name: "Iniciar teste" }).click();

  await expect(verdict(page)).toHaveAttribute("data-diagnosis", "unreachable");
  await expect(check(page, "reachability")).toHaveAttribute(
    "data-status",
    "failed",
  );
  await expect(
    page.getByRole("link", { name: "Abrir o endereço do getname em uma nova aba" }),
  ).toHaveAttribute("href", url);

  const receipt = JSON.parse(
    mockApi.requests.find((r) => r.path.endsWith("/result"))!.postData!,
  );
  expect(receipt.status).toBe("failed");
  expect(receipt.diagnosis).toBe("unreachable");
});

test("a getname that never answers is reported as a network without a path to it", async ({
  page,
  mockApi,
}) => {
  getname = await startGetname({ hang: true });
  mockApi.override("GET /public/getname-validation/:token", {
    json: plan(getname),
  });
  mockApi.override("POST /public/getname-validation/:token/result", {
    json: saved(),
  });

  await page.clock.install();
  await page.goto(`/validar-getname/${TOKEN}`);
  await page.getByRole("button", { name: "Iniciar teste" }).click();
  await expect(check(page, "reachability")).toHaveAttribute(
    "data-status",
    "running",
  );

  // the request and the one that ignores CORS each wait their own deadline
  await expect(async () => {
    await page.clock.runFor(11000);
    await expect(verdict(page)).toHaveAttribute(
      "data-diagnosis",
      "unreachable_timeout",
      { timeout: 1000 },
    );
  }).toPass();
});

test("a getname that does not allow the NoHarm origin is told apart from a network problem", async ({
  page,
  mockApi,
}) => {
  getname = await startGetname({ cors: false });
  mockApi.override("GET /public/getname-validation/:token", {
    json: plan(getname),
  });
  mockApi.override("POST /public/getname-validation/:token/result", {
    json: saved(),
  });

  await page.goto(`/validar-getname/${TOKEN}`);
  await page.getByRole("button", { name: "Iniciar teste" }).click();

  await expect(verdict(page)).toHaveAttribute("data-diagnosis", "cors");
  await expect(
    page.getByText(`não autoriza chamadas vindas de ${ORIGIN}`),
  ).toBeVisible();
});

test("a browser that blocks the local network is told apart from a network problem", async ({
  page,
  mockApi,
}) => {
  getname = await startGetname();
  const url = getname.url;
  await getname.close();
  getname = undefined;

  // the browser's answer for a site whose local network access was blocked
  await page.addInitScript(() => {
    const query = navigator.permissions.query.bind(navigator.permissions);
    navigator.permissions.query = (descriptor: any) =>
      descriptor.name === "local-network-access"
        ? Promise.resolve({ state: "denied" } as PermissionStatus)
        : query(descriptor);
  });
  mockApi.override("GET /public/getname-validation/:token", {
    json: plan({ url }),
  });
  mockApi.override("POST /public/getname-validation/:token/result", {
    json: saved(),
  });

  await page.goto(`/validar-getname/${TOKEN}`);
  await page.getByRole("button", { name: "Iniciar teste" }).click();

  await expect(verdict(page)).toHaveAttribute(
    "data-diagnosis",
    "local_network_denied",
  );
  await expect(page.getByText("LocalNetworkAccessAllowedForUrls")).toBeVisible();

  const receipt = JSON.parse(
    mockApi.requests.find((r) => r.path.endsWith("/result"))!.postData!,
  );
  expect(receipt.environment.permissions["local-network-access"]).toBe("denied");
});

test("a getname that cannot read the hospital database fails on the database step", async ({
  page,
  mockApi,
}) => {
  getname = await startGetname({ database: "unhealthy" });
  mockApi.override("GET /public/getname-validation/:token", {
    json: plan(getname),
  });
  mockApi.override("POST /public/getname-validation/:token/result", {
    json: saved(),
  });

  await page.goto(`/validar-getname/${TOKEN}`);
  await page.getByRole("button", { name: "Iniciar teste" }).click();

  await expect(verdict(page)).toHaveAttribute(
    "data-diagnosis",
    "unhealthy_database",
  );
  await expect(check(page, "reachability")).toHaveAttribute(
    "data-status",
    "passed",
  );
  await expect(check(page, "database")).toHaveAttribute("data-status", "failed");
});

test("a lookup that errors is reported even when the service is healthy", async ({
  page,
  mockApi,
}) => {
  getname = await startGetname({ lookupStatus: 500 });
  mockApi.override("GET /public/getname-validation/:token", {
    json: plan(getname),
  });
  mockApi.override("POST /public/getname-validation/:token/result", {
    json: saved(),
  });

  await page.goto(`/validar-getname/${TOKEN}`);
  await page.getByRole("button", { name: "Iniciar teste" }).click();

  await expect(verdict(page)).toHaveAttribute("data-diagnosis", "lookup_error");
});

test("a getname older than the health check passes with a note", async ({
  page,
  mockApi,
}) => {
  getname = await startGetname({ legacy: true });
  mockApi.override("GET /public/getname-validation/:token", {
    json: plan(getname),
  });
  mockApi.override("POST /public/getname-validation/:token/result", {
    json: saved(),
  });

  await page.goto(`/validar-getname/${TOKEN}`);
  await page.getByRole("button", { name: "Iniciar teste" }).click();

  await expect(verdict(page)).toHaveAttribute(
    "data-diagnosis",
    "legacy_version",
  );
  const receipt = JSON.parse(
    mockApi.requests.find((r) => r.path.endsWith("/result"))!.postData!,
  );
  expect(receipt.status).toBe("passed");
});

test("names resolved by the NoHarm servers have nothing to test in the browser", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /public/getname-validation/:token", {
    json: plan(
      { url: "" },
      {
        getnameType: "proxy",
        mode: "backend",
        baseUrl: null,
        nameUrl: null,
        lookup: "skip",
      },
    ),
  });
  mockApi.override("POST /public/getname-validation/:token/result", {
    json: saved(),
  });

  await page.goto(`/validar-getname/${TOKEN}`);
  await page.getByRole("button", { name: "Iniciar teste" }).click();

  await expect(verdict(page)).toHaveAttribute(
    "data-diagnosis",
    "not_applicable",
  );
  const receipt = JSON.parse(
    mockApi.requests.find((r) => r.path.endsWith("/result"))!.postData!,
  );
  expect(receipt.status).toBe("not_applicable");
});

test("a getname without a url is reported instead of tested", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /public/getname-validation/:token", {
    json: plan(
      { url: "" },
      { mode: "unconfigured", baseUrl: null, nameUrl: null, lookup: "skip" },
    ),
  });
  mockApi.override("POST /public/getname-validation/:token/result", {
    json: saved(),
  });

  await page.goto(`/validar-getname/${TOKEN}`);
  await page.getByRole("button", { name: "Iniciar teste" }).click();

  await expect(verdict(page)).toHaveAttribute(
    "data-diagnosis",
    "not_configured",
  );
});

for (const [reason, message] of [
  [null, "Este link não é válido"],
  ["expired", "Este link expirou"],
  ["exhausted", "Este link atingiu o limite de testes"],
] as const) {
  test(`a link that opens nothing says why (${reason ?? "unknown"})`, async ({
    page,
    mockApi,
  }) => {
    mockApi.override("GET /public/getname-validation/:token", {
      json: { status: "success", data: { valid: false, reason } },
    });

    await page.goto(`/validar-getname/${TOKEN}`);

    await expect(page.getByText("Link de validação inválido")).toBeVisible();
    await expect(page.getByText(message)).toBeVisible();
    await expect(page.getByRole("button", { name: "Iniciar teste" })).toHaveCount(
      0,
    );
  });
}

test("a result that could not be saved can be sent again or copied", async ({
  page,
  mockApi,
}) => {
  getname = await startGetname();
  mockApi.override("GET /public/getname-validation/:token", {
    json: plan(getname),
  });
  mockApi.override("POST /public/getname-validation/:token/result", {
    status: 500,
    json: { status: "error", message: "Ocorreu um erro inesperado" },
  });

  await page.goto(`/validar-getname/${TOKEN}`);
  await page.getByRole("button", { name: "Iniciar teste" }).click();

  // the verdict does not depend on the result being saved
  await expect(verdict(page)).toHaveAttribute("data-diagnosis", "ok");
  await expect(
    page.getByText("Não foi possível registrar o resultado"),
  ).toBeVisible();

  mockApi.override("POST /public/getname-validation/:token/result", {
    json: saved(null),
  });
  await page.getByRole("button", { name: "Tentar registrar de novo" }).click();

  await expect(
    page.getByText("Resultado registrado para a equipe NoHarm."),
  ).toBeVisible();
});

test("a link that reached its run limit cannot test again", async ({
  page,
  mockApi,
}) => {
  getname = await startGetname();
  mockApi.override("GET /public/getname-validation/:token", {
    json: plan(getname, { runs: 29 }),
  });
  mockApi.override("POST /public/getname-validation/:token/result", {
    json: saved("T0042", 30),
  });

  await page.goto(`/validar-getname/${TOKEN}`);
  await page.getByRole("button", { name: "Iniciar teste" }).click();

  await expect(verdict(page)).toHaveAttribute("data-diagnosis", "ok");
  await expect(
    page.getByRole("button", { name: "Testar novamente" }),
  ).toBeDisabled();
  await expect(
    page.getByText("Este link atingiu o limite de testes"),
  ).toBeVisible();
});
