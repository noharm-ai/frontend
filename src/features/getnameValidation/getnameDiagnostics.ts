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
  | "manual"
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
  // the app authenticates with headers of its own (never handed to this page)
  customHeaders?: boolean;
  runs?: number;
  maxRuns?: number;
}

export type AddressSpace = "private" | "loopback" | "public" | "hostname";

/**
 * What the person saw when the getname was opened in a tab of its own. A
 * failed connection reaches JavaScript with no reason attached - DNS, a
 * refused connection and a certificate the computer does not trust are the
 * same error here - but the browser shows the reason on its own error page.
 */
export type Observation =
  | "saw_getname_page"
  | "saw_security_warning"
  | "saw_refused"
  | "saw_not_found"
  | "saw_timeout";

export interface IEnvironment {
  userAgent: string;
  // readable name and version of the browser and of the operating system
  browser?: string;
  platform?: string;
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
  // what the person saw in the getname's own tab, after a run that could not
  // connect: it goes in the receipt and names the cause if this run fails too
  observation?: Observation;
  // the previous run ended waiting for the browser's permission prompt: if
  // this one gets no answer either, the silence is the network's
  afterPendingPrompt?: boolean;
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
// its address until DNS answers: a getname is never this computer itself, so
// a name is taken for a private address; a public address needs none.
const PERMISSIONS_BY_SPACE: Record<AddressSpace, string[]> = {
  private: ["local-network-access", "local-network"],
  loopback: ["local-network-access", "loopback-network"],
  hostname: ["local-network-access", "local-network"],
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

const UA_BROWSERS: [RegExp, string][] = [
  // order matters: Edge and Opera also say "Chrome", Chrome also says "Safari"
  [/Edg(?:e|A|iOS)?\/([\d.]+)/, "Microsoft Edge"],
  [/OPR\/([\d.]+)/, "Opera"],
  [/Firefox\/([\d.]+)/, "Firefox"],
  [/(?:Chrome|CriOS)\/([\d.]+)/, "Chrome"],
  [/Version\/([\d.]+).*Safari/, "Safari"],
];

const UA_PLATFORMS: [RegExp, string][] = [
  [/Windows NT 10/, "Windows 10/11"],
  [/Windows NT/, "Windows"],
  [/Android ([\d.]+)/, "Android"],
  [/(?:iPhone|iPad).*OS ([\d_]+)/, "iOS"],
  [/Mac OS X ([\d_.]+)/, "macOS"],
  [/CrOS/, "ChromeOS"],
  [/Linux/, "Linux"],
];

const fromUserAgent = (userAgent: string, table: [RegExp, string][]) => {
  for (const [pattern, name] of table) {
    const match = userAgent.match(pattern);

    if (match) {
      return [name, match[1]?.replace(/_/g, ".")].filter(Boolean).join(" ");
    }
  }

  return undefined;
};

/**
 * The browser and the operating system in words someone can read on a ticket
 * ("Google Chrome 142.0.7444.60", "Windows 11"). Chromium browsers say it
 * themselves (User-Agent Client Hints); the others are read off the user
 * agent, which is sent along as it is anyway.
 */
export const describeBrowser = async (): Promise<
  Pick<IEnvironment, "browser" | "platform">
> => {
  const userAgent = navigator.userAgent;
  let browser = fromUserAgent(userAgent, UA_BROWSERS);
  let platform = fromUserAgent(userAgent, UA_PLATFORMS);
  const hints = (navigator as any).userAgentData;

  if (hints?.getHighEntropyValues) {
    try {
      const values = await hints.getHighEntropyValues([
        "fullVersionList",
        "platformVersion",
      ]);
      // the list carries a decoy ("Not A Brand") and the engine next to the
      // product: the product is the one that is neither
      const brands: { brand: string; version: string }[] = (
        values.fullVersionList ?? []
      ).filter((item: { brand: string }) => !/not.?a.?brand/i.test(item.brand));
      const product =
        brands.find((item) => item.brand !== "Chromium") ?? brands[0];

      if (product) {
        browser = `${product.brand} ${product.version}`;
      }

      if (values.platform === "Windows") {
        // Windows 11 reports a platform version of 13 or more
        const major = parseInt(values.platformVersion ?? "", 10);
        platform = major >= 13 ? "Windows 11" : major > 0 ? "Windows 10" : "Windows";
      } else if (values.platform) {
        platform = [values.platform, values.platformVersion]
          .filter(Boolean)
          .join(" ");
      }
    } catch {
      // the user agent already answered
    }
  }

  return { browser: browser?.slice(0, 80), platform: platform?.slice(0, 80) };
};

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
  // the parsed body, when it was asked for and is JSON
  body?: any;
  timedOut: boolean;
  durationMs: number;
}

/**
 * One request with a deadline; never throws. With `readJson` the body is read
 * under the same deadline: a server that sends its headers and then stalls
 * must not hold the test forever.
 */
const attempt = async (
  url: string,
  init: RequestInit,
  timeoutMs: number,
  readJson = false,
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

    const durationMs = Math.round(performance.now() - start);
    let body = null;

    if (readJson) {
      try {
        body = await response.json();
      } catch {
        // not JSON, or the deadline passed while it was coming
        body = null;
      }
    }

    return { response, body, timedOut: false, durationMs };
  } catch {
    return { timedOut, durationMs: Math.round(performance.now() - start) };
  } finally {
    clearTimeout(timer);
  }
};

const clip = (text: string) => text.slice(0, MAX_DETAIL);

/** Verdict of a run: the first step that failed names the diagnosis. */
const DIAGNOSIS_BY_CODE: Record<string, string> = {
  not_configured: "not_configured",
  mixed_content: "mixed_content",
  local_network_denied: "local_network_denied",
  permission_pending: "permission_pending",
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

/** The cause of a connection that failed, by what the person saw in the tab. */
const DIAGNOSIS_BY_OBSERVATION: Record<Observation, string> = {
  // the tab opens it and the page cannot call it: the browser is in the way
  saw_getname_page: "blocked_by_browser",
  saw_security_warning: "certificate",
  saw_refused: "connection_refused",
  saw_not_found: "dns",
  saw_timeout: "unreachable_timeout",
};

export const diagnose = (
  checks: ICheck[],
): Pick<IReceipt, "status" | "diagnosis"> => {
  const failed = checks.find((check) => check.status === "failed");
  const observation = checks.find((check) => check.id === "manual")?.code as
    | Observation
    | undefined;

  if (failed) {
    const diagnosis = DIAGNOSIS_BY_CODE[failed.code ?? ""] ?? "http_error";

    return {
      status: "failed",
      diagnosis:
        diagnosis === "unreachable" && observation
          ? (DIAGNOSIS_BY_OBSERVATION[observation] ?? diagnosis)
          : diagnosis,
    };
  }

  // it works now, after the person went past the browser's security warning:
  // only on this computer, so it is not the same as "ok"
  if (observation === "saw_security_warning") {
    return { status: "passed", diagnosis: "certificate_accepted" };
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

  Object.assign(environment, await describeBrowser());

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

  if (options.observation) {
    add({
      id: "manual",
      status: options.observation === "saw_getname_page" ? "passed" : "warning",
      code: options.observation,
    });
  }

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
    true,
  );
  permissions = await queryPermissions();
  environment.permissions = permissions;

  if (!health.response) {
    // every failure looks the same from here; narrow it down
    let code = "unreachable";

    if (health.timedOut) {
      // Silence. What the browser blocks (a denied permission, mixed content)
      // fails at once, so those are out. Left: a prompt nobody answered - the
      // request waits behind it - or a network with no path to the getname.
      // The browser does not say whether a prompt is showing, so the first
      // silence with the permission still unanswered asks for it; a second one
      // is the network's.
      code =
        waitingPrompt &&
        hasPermissionState(permissions, space, "prompt") &&
        !options.afterPendingPrompt
          ? "permission_pending"
          : "timeout";
    } else {
      // It failed at once. A request that ignores CORS tells whether the
      // getname is there: an answer means it only refuses this origin. Only
      // with no answer at all is a browser block (permission, mixed content)
      // taken for the cause.
      const opaque = await attempt(healthUrl, { mode: "no-cors" }, timeoutMs);

      if (opaque.response) {
        code = "cors";
      } else if (opaque.timedOut) {
        code = "timeout";
      } else if (hasPermissionState(permissions, space, "denied")) {
        code = "local_network_denied";
      } else if (mixedContent) {
        code = "mixed_content";
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
    const body = health.response!.ok ? health.body : null;

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
      true,
    );
    const detail = detailed.response ? detailed.body : null;

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
  } else if (plan.getnameType !== "auth" && authEnabled && plan.customHeaders) {
    // the app answers this getname with headers of its own, which this page
    // never receives: nothing here can say whether they are the right ones
    add({ id: "auth_config", status: "skipped", code: "custom_headers" });
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

/**
 * What the getname's own tab can show for a plan: a http getname has no
 * certificate to warn about, and an ip (or localhost) has no name to resolve.
 */
export const observationOptions = (plan: IValidationPlan): Observation[] => {
  const base = parseBaseUrl(plan);
  const options: Observation[] = ["saw_getname_page"];

  if (!base) {
    return options;
  }

  if (base.protocol === "https:") {
    options.push("saw_security_warning");
  }
  options.push("saw_refused");
  if (addressSpaceOf(base.hostname) === "hostname") {
    options.push("saw_not_found");
  }
  options.push("saw_timeout");

  return options;
};

/** Host, port and protocol of the getname, for a message to who runs the network. */
export const serverOf = (
  plan: IValidationPlan,
): { host: string; port: string; protocol: string } | null => {
  const base = parseBaseUrl(plan);

  if (!base) {
    return null;
  }

  return {
    host: base.hostname,
    port: base.port || (base.protocol === "https:" ? "443" : "80"),
    protocol: base.protocol.replace(":", ""),
  };
};

/**
 * Calls back when a local network permission of this site changes (the person
 * allowed it in the site settings). Returns the function that stops watching.
 */
export const watchPermissions = (onChange: () => void): (() => void) => {
  const watched: PermissionStatus[] = [];
  let stopped = false;

  PERMISSION_NAMES.forEach(async (name) => {
    try {
      const status = await navigator.permissions.query({
        name: name as PermissionName,
      });

      if (stopped) return;
      status.onchange = () => {
        if (status.state !== "denied") onChange();
      };
      watched.push(status);
    } catch {
      // a name this browser does not have
    }
  });

  return () => {
    stopped = true;
    watched.forEach((status) => {
      status.onchange = null;
    });
  };
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
    `browser: ${receipt.environment.browser ?? "-"} (${receipt.environment.platform ?? "-"})`,
    `user agent: ${receipt.environment.userAgent}`,
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
