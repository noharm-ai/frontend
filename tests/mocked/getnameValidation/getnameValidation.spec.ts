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
  // while true, every connection is dropped without an answer
  control: { down: boolean };
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
  const control = { down: false };

  const server = http.createServer((req, res) => {
    requests.push(`${req.method} ${req.url}`);

    if (control.down) {
      req.socket.destroy();
      return;
    }

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
    control,
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

const option = (page: import("@playwright/test").Page, observation: string) =>
  page.locator(`[data-observation="${observation}"]`);

/** The receipts posted so far, oldest first. */
const receipts = (mockApi: { requests: { path: string; postData?: string }[] }) =>
  mockApi.requests
    .filter((r) => r.path.endsWith("/result"))
    .map((r) => JSON.parse(r.postData!));

/** A port with nothing listening: connections to it are refused. */
const closedPort = async () => {
  const server = await startGetname();
  const port = new URL(server.url).port;
  await server.close();

  return port;
};

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
  // the browser in words, for who reads the ticket: name and version
  expect(receipt.environment.browser).toMatch(/Chrom\w* \d+\./);
  expect(receipt.environment.platform).toBeTruthy();
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

test("a connection that fails is narrowed down in two clicks, and the answer goes with the receipt", async ({
  page,
  mockApi,
}) => {
  const port = await closedPort();
  const url = `http://localhost:${port}/`;
  mockApi.override("GET /public/getname-validation/:token", {
    json: plan({ url }),
  });
  mockApi.override("POST /public/getname-validation/:token/result", {
    json: saved(),
  });

  await page.goto(`/validar-getname/${TOKEN}`);
  await page.getByRole("button", { name: "Iniciar teste" }).click();

  // the page cannot know why: it says so and asks for two clicks
  await expect(verdict(page)).toHaveAttribute("data-diagnosis", "unreachable");
  await expect(check(page, "reachability")).toHaveAttribute(
    "data-status",
    "failed",
  );
  // a http getname has no certificate and localhost has no name to resolve:
  // those two are not offered
  await expect(page.locator("[data-observation]")).toHaveCount(3);
  await expect(option(page, "saw_security_warning")).toHaveCount(0);
  await expect(option(page, "saw_not_found")).toHaveCount(0);
  // nothing to mark before the getname was opened
  await expect(option(page, "saw_refused")).toBeDisabled();

  // the getname opens in a tab of its own, where the browser shows its error
  await expect(
    page.getByRole("link", { name: "Abrir o getname" }),
  ).toHaveAttribute("href", url);
  const popup = page.waitForEvent("popup");
  await page.getByRole("link", { name: "Abrir o getname" }).click();
  await popup;

  await option(page, "saw_refused").click();

  // the test ran again and the answer named the cause
  await expect(verdict(page)).toHaveAttribute(
    "data-diagnosis",
    "connection_refused",
  );
  await expect(
    page.getByText(`O getname não está atendendo na porta ${port}`),
  ).toBeVisible();
  await expect(check(page, "manual")).toHaveAttribute("data-status", "warning");
  // whoever fixes it already has the result: nothing to report by hand
  await expect(page.locator("[data-owner]")).toHaveAttribute(
    "data-owner",
    "noharm",
  );
  await expect(
    page.getByText(
      "Você não precisa fazer nada. A equipe NoHarm já recebeu este resultado no chamado T0042",
    ),
  ).toBeVisible();

  const [first, second] = receipts(mockApi);
  expect(first.diagnosis).toBe("unreachable");
  expect(second.status).toBe("failed");
  expect(second.diagnosis).toBe("connection_refused");
  expect(second.checks.find((c: any) => c.id === "manual").code).toBe(
    "saw_refused",
  );

  // the person only runs the test: no errand to the hospital's IT. The
  // message for IT goes in the ticket, for the NoHarm staff (backend)
  await expect(
    page.getByRole("button", { name: "Copiar mensagem para a TI" }),
  ).toHaveCount(0);
  await expect(page.getByText(/envie .* para a TI/i)).toHaveCount(0);
});

test("a https getname offers the security warning, which points at the certificate", async ({
  page,
  mockApi,
}) => {
  const url = `https://localhost:${await closedPort()}/`;
  mockApi.override("GET /public/getname-validation/:token", {
    json: plan({ url }),
  });
  mockApi.override("POST /public/getname-validation/:token/result", {
    json: saved(),
  });

  await page.goto(`/validar-getname/${TOKEN}`);
  await page.getByRole("button", { name: "Iniciar teste" }).click();
  await expect(verdict(page)).toHaveAttribute("data-diagnosis", "unreachable");

  await page.getByRole("link", { name: "Abrir o getname" }).click();
  await option(page, "saw_security_warning").click();

  await expect(verdict(page)).toHaveAttribute("data-diagnosis", "certificate");
  await expect(
    page.getByText(
      "O certificado https do getname não é aceito por este computador",
    ),
  ).toBeVisible();
});

test("a getname with a name offers the address not found, which goes to the hospital IT", async ({
  page,
  mockApi,
}) => {
  // .invalid never resolves (RFC 2606)
  mockApi.override("GET /public/getname-validation/:token", {
    json: plan({ url: "http://getname.invalid:8443/" }),
  });
  mockApi.override("POST /public/getname-validation/:token/result", {
    json: saved(),
  });

  await page.goto(`/validar-getname/${TOKEN}`);
  await page.getByRole("button", { name: "Iniciar teste" }).click();
  await expect(verdict(page)).toHaveAttribute("data-diagnosis", "unreachable", {
    timeout: 30000,
  });

  await page.getByRole("link", { name: "Abrir o getname" }).click();
  await option(page, "saw_not_found").click();

  await expect(verdict(page)).toHaveAttribute("data-diagnosis", "dns", {
    timeout: 30000,
  });
  await expect(
    page.getByText("Este computador não encontra o endereço getname.invalid"),
  ).toBeVisible();
  // IT has to act, and it is the NoHarm team that goes to IT
  await expect(page.locator("[data-owner]")).toHaveAttribute("data-owner", "it");
  await expect(
    page.getByText(
      "Você não precisa fazer nada. A equipe NoHarm já recebeu este resultado no chamado T0042 e vai tratar com a TI do hospital.",
    ),
  ).toBeVisible();
  await expect(page.getByText(/envie .* para a TI/i)).toHaveCount(0);
});

test("a getname that works after the security warning was accepted is not the same as ok", async ({
  page,
  mockApi,
}) => {
  // a plain http server addressed as https: the handshake fails, as it does
  // with a certificate the browser does not accept
  getname = await startGetname();
  const httpUrl = getname.url;
  const httpsUrl = httpUrl.replace("http://", "https://");
  mockApi.override("GET /public/getname-validation/:token", {
    json: plan({ url: httpsUrl }),
  });
  mockApi.override("POST /public/getname-validation/:token/result", {
    json: saved(),
  });

  await page.goto(`/validar-getname/${TOKEN}`);
  await page.getByRole("button", { name: "Iniciar teste" }).click();
  await expect(verdict(page)).toHaveAttribute("data-diagnosis", "unreachable");

  // the person goes past the warning in the other tab: from here on the
  // browser reaches the getname
  await page.route(`${httpsUrl}**`, async (route) =>
    route.fulfill({
      response: await route.fetch({
        url: route.request().url().replace(httpsUrl, httpUrl),
      }),
    }),
  );
  await page.getByRole("link", { name: "Abrir o getname" }).click();
  await option(page, "saw_security_warning").click();

  await expect(verdict(page)).toHaveAttribute(
    "data-diagnosis",
    "certificate_accepted",
  );
  await expect(
    page.getByText("Funciona neste computador, mas o certificado do getname não é confiável"),
  ).toBeVisible();
  const last = receipts(mockApi).at(-1);
  expect(last.status).toBe("passed");
  expect(last.diagnosis).toBe("certificate_accepted");
});

test("a getname that opens in a tab and still cannot be called is blocked by the browser", async ({
  page,
  mockApi,
}) => {
  const url = `http://localhost:${await closedPort()}/`;
  mockApi.override("GET /public/getname-validation/:token", {
    json: plan({ url }),
  });
  mockApi.override("POST /public/getname-validation/:token/result", {
    json: saved(),
  });

  await page.goto(`/validar-getname/${TOKEN}`);
  await page.getByRole("button", { name: "Iniciar teste" }).click();
  await expect(verdict(page)).toHaveAttribute("data-diagnosis", "unreachable");

  await page.getByRole("link", { name: "Abrir o getname" }).click();
  await option(page, "saw_getname_page").click();

  await expect(verdict(page)).toHaveAttribute(
    "data-diagnosis",
    "blocked_by_browser",
  );
  await expect(page.locator("[data-owner]")).toHaveAttribute("data-owner", "you");
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
    page.getByText(`O getname não autoriza chamadas vindas de ${ORIGIN}`),
  ).toBeVisible();
  // the fix is NoHarm's and NoHarm already has the result
  await expect(page.locator("[data-owner]")).toHaveAttribute(
    "data-owner",
    "noharm",
  );
  await expect(page.getByText("Você não precisa fazer nada.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Copiar mensagem para a TI" }),
  ).toHaveCount(0);
});

test("a browser that blocks the local network says where to click, and the test restarts by itself", async ({
  page,
  mockApi,
}) => {
  getname = await startGetname();
  // what a blocked request looks like from the page: it never gets an answer
  getname.control.down = true;

  // the browser's answer for a site whose local network access was blocked,
  // with a handle for the test to "allow it in the site settings"
  await page.addInitScript(() => {
    const status: any = { state: "denied", onchange: null };
    (window as any).__localNetwork = status;
    const query = navigator.permissions.query.bind(navigator.permissions);
    navigator.permissions.query = (descriptor: any) =>
      descriptor.name === "local-network-access"
        ? Promise.resolve(status as PermissionStatus)
        : query(descriptor);
  });
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
    "local_network_denied",
  );
  await expect(page.locator("[data-owner]")).toHaveAttribute("data-owner", "you");
  await expect(
    page.getByText('Em "Acesso à rede local" (ou "Dispositivos na rede local"), escolha Permitir.'),
  ).toBeVisible();
  expect(
    receipts(mockApi)[0].environment.permissions["local-network-access"],
  ).toBe("denied");

  // a locked option is not the person's problem either
  await expect(
    page.getByText(
      "Se a opção não aparecer ou estiver travada, não é preciso fazer mais nada",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Copiar mensagem para a TI" }),
  ).toHaveCount(0);

  // the person allows it in the site settings: no click on this page
  getname.control.down = false;
  await page.evaluate(() => {
    const status = (window as any).__localNetwork;
    status.state = "granted";
    status.onchange?.();
  });

  await expect(verdict(page)).toHaveAttribute("data-diagnosis", "ok");
  expect(receipts(mockApi)).toHaveLength(2);
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
