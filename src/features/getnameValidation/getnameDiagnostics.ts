/**
 * The getname test of the public validation page (/validar-getname/:token).
 *
 * The getname usually lives inside the hospital's network, so the only place
 * that can tell whether the names will show up is the browser of someone
 * there. This runs the same kind of request the app makes (hospital.js) and,
 * when it fails, narrows down why: a browser hands every network failure to
 * JavaScript as the same opaque error, so the cause is inferred from what is
 * around it - the page and target protocols, the browser's local network
 * permission, a second request that ignores CORS, and whether the failure was
 * a timeout.
 *
 * Nothing here reads a patient's name: the lookup step asks for an id that
 * does not exist and only looks at the status code.
 */

export type CheckStatus = "passed" | "failed" | "warning" | "skipped";

export type CheckId =
  | "config"
  | "environment"
  | "reachability"
  | "health"
  | "database"
  | "auth_config"
  | "lookup";

export interface ICheck {
  id: CheckId;
  status: CheckStatus;
  code?: string;
  httpStatus?: number;
  durationMs?: number;
  detail?: string;
}

export interface IValidationPlan {
  valid: boolean;
  reason?: "expired" | "exhausted" | null;
  schema?: string;
  expiresAt?: string;
  getnameType?: string;
  // browser: the app calls the getname from the browser; backend: the names
  // come through the NoHarm backend; unconfigured: there is no url to call
  mode?: "browser" | "backend" | "unconfigured";
  baseUrl?: string | null;
  nameUrl?: string | null;
  // token: with a getname token; open: without one; skip: not tested
  lookup?: "token" | "open" | "skip";
  runs?: number;
  maxRuns?: number;
}

export type AddressSpace = "private" | "loopback" | "public" | "hostname";

export interface IEnvironment {
  userAgent: string;
  pageOrigin: string;
  online: boolean;
  secureContext: boolean;
  targetAddressSpace?: AddressSpace;
  permissions?: Record<string, string>;
  getnameVersion?: string;
  language: string;
}

export interface IReceipt {
  status: "passed" | "failed" | "not_applicable";
  diagnosis: string;
  checks: ICheck[];
  environment: IEnvironment;
}

export interface IRunOptions {
  // getname token for the lookup step (plan.lookup === "token")
  getAuthToken: () => Promise<string>;
  // called whenever a step starts or ends, with every step so far
  onProgress?: (checks: ICheck[], running: CheckId | null) => void;
  // the browser is about to ask (or is asking) for the local network permission
  onPermissionPrompt?: () => void;
  timeoutMs?: number;
}

// An id no patient has: the lookup step must never bring a name back.
const LOOKUP_ID = "0";
const ID_FLAG = "{idPatient}";
const DEFAULT_TIMEOUT = 10000;
// While the browser's permission prompt is open the request is on hold: give
// the person time to read it before calling the wait a timeout.
const PROMPT_TIMEOUT = 30000;
// Chrome asked for "local-network-access" at first and later split it in two:
// "local-network" (private addresses) and "loopback-network" (this computer).
const PERMISSION_NAMES = [
  "local-network-access",
  "local-network",
  "loopback-network",
];
// The permissions that gate a request to each kind of address. A name hides
// its address until DNS answers, so any of them may apply; a public address
// needs none.
const PERMISSIONS_BY_SPACE: Record<AddressSpace, string[]> = {
  private: ["local-network-access", "local-network"],
  loopback: ["local-network-access", "loopback-network"],
  hostname: PERMISSION_NAMES,
  public: [],
};
const MAX_DETAIL = 300;

/**
 * Where a host lives, as far as its text tells: a literal ip is classified, a
 * name is "hostname" (it may resolve to a private ip - only DNS knows).
 */
export const addressSpaceOf = (hostname: string): AddressSpace => {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (host === "localhost" || host.endsWith(".localhost") || host === "::1") {
    return "loopback";
  }

  if (host.endsWith(".local")) {
    return "private";
  }

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];

    if (a === 127) return "loopback";
    if (
      a === 10 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254) ||
      (a === 100 && b >= 64 && b <= 127)
    ) {
      return "private";
    }

    return "public";
  }

  if (host.includes(":")) {
    // unique local (fc00::/7) and link-local (fe80::/10)
    return /^f[cd]/.test(host) || /^fe[89ab]/.test(host) ? "private" : "public";
  }

  return "hostname";
};

/**
 * A https page calling a http getname: browsers block it as mixed content.
 * Loopback is exempt everywhere, so it is left out.
 */
export const isMixedContent = (
  pageProtocol: string,
  target: URL,
  space: AddressSpace,
): boolean =>
  pageProtocol === "https:" &&
  target.protocol === "http:" &&
  space !== "loopback";

/** State of each local network permission this browser knows about. */
export const queryPermissions = async (): Promise<Record<string, string>> => {
  const states: Record<string, string> = {};

  if (!navigator.permissions?.query) {
    return states;
  }

  await Promise.all(
    PERMISSION_NAMES.map(async (name) => {
      try {
        const result = await navigator.permissions.query({
          name: name as PermissionName,
        });
        states[name] = result.state;
      } catch {
        // a name this browser does not have: nothing to report
      }
    }),
  );

  return states;
};

/** Whether a permission that gates this kind of address is in a state. */
export const hasPermissionState = (
  permissions: Record<string, string>,
  space: AddressSpace,
  state: string,
) => PERMISSIONS_BY_SPACE[space].some((name) => permissions[name] === state);

interface IAttempt {
  response?: Response;
  timedOut: boolean;
  durationMs: number;
}

/** One request with a deadline; never throws. */
const attempt = async (
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<IAttempt> => {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const start = performance.now();

  try {
    const response = await fetch(url, {
      cache: "no-store",
      ...init,
      signal: controller.signal,
    });

    return {
      response,
      timedOut: false,
      durationMs: Math.round(performance.now() - start),
    };
  } catch {
    return { timedOut, durationMs: Math.round(performance.now() - start) };
  } finally {
    clearTimeout(timer);
  }
};

const readJson = async (response: Response): Promise<any> => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const clip = (text: string) => text.slice(0, MAX_DETAIL);

/** Verdict of a run: the first step that failed names the diagnosis. */
const DIAGNOSIS_BY_CODE: Record<string, string> = {
  not_configured: "not_configured",
  mixed_content: "mixed_content",
  local_network_denied: "local_network_denied",
  timeout: "unreachable_timeout",
  unreachable: "unreachable",
  cors: "cors",
  preflight_blocked: "cors",
  http_error: "http_error",
  not_healthy: "http_error",
  request_failed: "http_error",
  unhealthy: "unhealthy_database",
  database_timeout: "unhealthy_database",
  lookup_timeout: "lookup_error",
  auth_required_by_getname: "auth_mismatch",
  auth_disabled_on_getname: "auth_mismatch",
  unauthorized: "auth_mismatch",
  token_refused: "auth_secret_mismatch",
  token_unavailable: "lookup_error",
  lookup_error: "lookup_error",
};

export const diagnose = (
  checks: ICheck[],
): Pick<IReceipt, "status" | "diagnosis"> => {
  const failed = checks.find((check) => check.status === "failed");

  if (failed) {
    return {
      status: "failed",
      diagnosis: DIAGNOSIS_BY_CODE[failed.code ?? ""] ?? "http_error",
    };
  }

  if (checks.some((check) => check.code === "resolved_by_backend")) {
    return { status: "not_applicable", diagnosis: "not_applicable" };
  }

  if (checks.some((check) => check.code === "legacy_version")) {
    return { status: "passed", diagnosis: "legacy_version" };
  }

  return { status: "passed", diagnosis: "ok" };
};

/** The getname root a browser can call, when the plan has one. */
const parseBaseUrl = (plan: IValidationPlan): URL | null => {
  if (plan.mode !== "browser" || !plan.baseUrl) {
    return null;
  }

  try {
    return new URL(plan.baseUrl);
  } catch {
    return null;
  }
};

/**
 * Runs the test a plan asks for and returns its receipt. Never throws: a step
 * that cannot run is a failed or skipped step of the receipt.
 */
export const runGetnameValidation = async (
  plan: IValidationPlan,
  options: IRunOptions,
): Promise<IReceipt> => {
  const checks: ICheck[] = [];
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT;
  const environment: IEnvironment = {
    userAgent: navigator.userAgent.slice(0, 400),
    pageOrigin: window.location.origin,
    online: navigator.onLine,
    secureContext: window.isSecureContext,
    language: navigator.language,
  };

  const progress = (running: CheckId | null) =>
    options.onProgress?.([...checks], running);
  const add = (check: ICheck) => {
    checks.push(check);
    progress(null);
  };
  const finish = (): IReceipt => {
    progress(null);
    return { ...diagnose(checks), checks, environment };
  };

  // --- config: is there anything for a browser to test? ---------------------
  if (plan.mode === "backend") {
    add({ id: "config", status: "skipped", code: "resolved_by_backend" });
    return finish();
  }

  const base = parseBaseUrl(plan);

  if (!base) {
    add({ id: "config", status: "failed", code: "not_configured" });
    return finish();
  }

  add({ id: "config", status: "passed", detail: base.origin });

  // --- environment: what the browser allows before any request --------------
  progress("environment");
  const space = addressSpaceOf(base.hostname);
  const mixedContent = isMixedContent(window.location.protocol, base, space);
  let permissions = await queryPermissions();
  environment.targetAddressSpace = space;
  environment.permissions = permissions;

  const deniedBefore = hasPermissionState(permissions, space, "denied");
  add({
    id: "environment",
    status: mixedContent || deniedBefore ? "warning" : "passed",
    code: mixedContent
      ? "mixed_content_risk"
      : deniedBefore
        ? "local_network_denied"
        : undefined,
  });

  // --- reachability: does a request from this browser get an answer? --------
  progress("reachability");
  const healthUrl = new URL("health", base).toString();
  const waitingPrompt = hasPermissionState(permissions, space, "prompt");
  if (waitingPrompt) {
    options.onPermissionPrompt?.();
  }

  let health = await attempt(
    healthUrl,
    { mode: "cors" },
    waitingPrompt ? PROMPT_TIMEOUT : timeoutMs,
  );
  permissions = await queryPermissions();
  environment.permissions = permissions;

  if (!health.response) {
    // every failure looks the same from here; narrow it down
    let code = "unreachable";

    if (hasPermissionState(permissions, space, "denied")) {
      code = "local_network_denied";
    } else if (mixedContent) {
      code = "mixed_content";
    } else {
      // a request that ignores CORS: an answer means the getname is there and
      // only refuses this origin
      const opaque = await attempt(healthUrl, { mode: "no-cors" }, timeoutMs);

      if (opaque.response) {
        code = "cors";
      } else if (health.timedOut || opaque.timedOut) {
        code = "timeout";
      }
    }

    add({
      id: "reachability",
      status: "failed",
      code,
      durationMs: health.durationMs,
      detail: environment.online ? undefined : "navigator.onLine = false",
    });
    return finish();
  }

  let legacy = false;
  if (health.response.status === 404) {
    // a getname older than the health check: its root still says it is alive
    const root = await attempt(base.toString(), { mode: "cors" }, timeoutMs);

    if (root.response?.ok) {
      legacy = true;
      health = root;
    }
  }

  add({
    id: "reachability",
    status: legacy ? "warning" : "passed",
    code: legacy ? "legacy_version" : undefined,
    httpStatus: health.response!.status,
    durationMs: health.durationMs,
  });

  // --- health: is what answered a healthy getname? --------------------------
  let authEnabled: boolean | null = null;

  if (legacy) {
    add({ id: "health", status: "skipped", code: "legacy_version" });
    add({ id: "database", status: "skipped", code: "legacy_version" });
  } else {
    const body = health.response!.ok ? await readJson(health.response!) : null;

    if (!health.response!.ok) {
      add({
        id: "health",
        status: "failed",
        code: "http_error",
        httpStatus: health.response!.status,
      });
      return finish();
    }

    if (body?.status !== "healthy") {
      add({
        id: "health",
        status: "failed",
        code: "not_healthy",
        httpStatus: health.response!.status,
        detail: clip(`status: ${String(body?.status ?? "?")}`),
      });
      return finish();
    }

    environment.getnameVersion = String(body.version ?? "").slice(0, 40);
    add({
      id: "health",
      status: "passed",
      detail: clip(`GetName ${environment.getnameVersion}`),
    });

    // --- database: can the getname read the hospital's database? ------------
    progress("database");
    const detailed = await attempt(
      new URL("health/detailed", base).toString(),
      { mode: "cors" },
      // the getname waits for the database before answering
      timeoutMs * 2,
    );
    const detail = detailed.response ? await readJson(detailed.response) : null;

    if (!detailed.response) {
      add({
        id: "database",
        status: "failed",
        code: detailed.timedOut ? "database_timeout" : "request_failed",
        durationMs: detailed.durationMs,
      });
      return finish();
    }

    if (detailed.response.status === 404) {
      add({ id: "database", status: "skipped", code: "not_available" });
    } else if (detail?.database?.status === "healthy") {
      authEnabled =
        typeof detail.auth_enabled === "boolean" ? detail.auth_enabled : null;
      add({
        id: "database",
        status: "passed",
        httpStatus: detailed.response.status,
        durationMs: detailed.durationMs,
        detail: clip(
          `${String(detail.database.type ?? "?")}, ${String(
            detail.database.latency_ms ?? "?",
          )} ms`,
        ),
      });
    } else {
      add({
        id: "database",
        status: "failed",
        code: detail?.database ? "unhealthy" : "http_error",
        httpStatus: detailed.response.status,
        durationMs: detailed.durationMs,
        detail: detail?.database
          ? clip(String(detail.database.type ?? ""))
          : undefined,
      });
      return finish();
    }
  }

  // --- auth_config: does the getname ask for what the config sends? ---------
  if (authEnabled === null) {
    add({ id: "auth_config", status: "skipped", code: "not_available" });
  } else if (plan.getnameType === "auth" && !authEnabled) {
    add({
      id: "auth_config",
      status: "failed",
      code: "auth_disabled_on_getname",
    });
    return finish();
  } else if (plan.getnameType !== "auth" && authEnabled) {
    add({
      id: "auth_config",
      status: "failed",
      code: "auth_required_by_getname",
    });
    return finish();
  } else {
    add({ id: "auth_config", status: "passed" });
  }

  // --- lookup: does a name request go all the way to the database? ----------
  if (plan.lookup === "skip" || !plan.nameUrl) {
    add({ id: "lookup", status: "skipped", code: "not_tested" });
    return finish();
  }

  progress("lookup");
  const headers: Record<string, string> = {};

  if (plan.lookup === "token") {
    try {
      headers.Authorization = `Bearer ${await options.getAuthToken()}`;
    } catch {
      add({ id: "lookup", status: "failed", code: "token_unavailable" });
      return finish();
    }
  }

  const lookup = await attempt(
    plan.nameUrl.replace(ID_FLAG, LOOKUP_ID),
    { mode: "cors", headers },
    timeoutMs,
  );

  if (!lookup.response) {
    // the getname answered /health a moment ago: what changed is the request
    // (its header asks for a CORS preflight)
    add({
      id: "lookup",
      status: "failed",
      code: lookup.timedOut ? "lookup_timeout" : "preflight_blocked",
      durationMs: lookup.durationMs,
    });
    return finish();
  }

  const httpStatus = lookup.response.status;
  // the body is never read: found or not, no name is kept or shown. The
  // getname answers an id it does not know with 400; a 404 is a wrong path
  if (httpStatus === 200 || httpStatus === 400) {
    add({
      id: "lookup",
      status: "passed",
      code: httpStatus === 200 ? "found" : "not_found_as_expected",
      httpStatus,
      durationMs: lookup.durationMs,
    });
  } else if (httpStatus === 401 || httpStatus === 403) {
    add({
      id: "lookup",
      status: "failed",
      code: plan.lookup === "token" ? "token_refused" : "unauthorized",
      httpStatus,
      durationMs: lookup.durationMs,
    });
  } else {
    add({
      id: "lookup",
      status: "failed",
      code: "lookup_error",
      httpStatus,
      durationMs: lookup.durationMs,
    });
  }

  return finish();
};

/** The receipt as plain text, for the person to copy and send. */
export const receiptToText = (
  plan: IValidationPlan,
  receipt: IReceipt,
  ticket?: string | null,
): string => {
  const lines = [
    `NoHarm - getname validation`,
    `date: ${new Date().toISOString()}`,
    `schema: ${plan.schema ?? "-"}`,
    `type: ${plan.getnameType ?? "-"}`,
    `url: ${plan.baseUrl ?? "-"}`,
    `result: ${receipt.status} (${receipt.diagnosis})`,
    `ticket: ${ticket ?? "-"}`,
    `origin: ${receipt.environment.pageOrigin}`,
    `browser: ${receipt.environment.userAgent}`,
    `address: ${receipt.environment.targetAddressSpace ?? "-"}`,
    `permissions: ${
      Object.entries(receipt.environment.permissions ?? {})
        .map(([name, state]) => `${name}=${state}`)
        .join(", ") || "-"
    }`,
    `getname version: ${receipt.environment.getnameVersion ?? "-"}`,
    "",
    ...receipt.checks.map((check) =>
      [
        check.id,
        check.status,
        check.code ?? "",
        check.httpStatus !== undefined ? `http ${check.httpStatus}` : "",
        check.durationMs !== undefined ? `${check.durationMs} ms` : "",
        check.detail ?? "",
      ]
        .filter(Boolean)
        .join(" | "),
    ),
  ];

  return lines.join("\n");
};
