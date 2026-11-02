import { store, persistor } from "store/index";
import { setUpdateAvailable } from "./AppVersionSlice";

/**
 * Detects that a newer frontend has been deployed while this tab keeps
 * running the code it loaded.
 *
 * Every build stamps an id into index.html (`<meta name="app-build">`) and
 * into the bundle (`VITE_APP_BUILD_ID`, see vite.config.ts). index.html is
 * served with no-cache, so fetching it tells which build is live now; when it
 * differs from the running one, `appVersion.updateAvailable` is set and
 * AppVersionWatcher reloads the app at the next screen change.
 */

const RUNNING_BUILD: string | undefined = import.meta.env.VITE_APP_BUILD_ID;

// unforced checks (token refresh, tab focus) run at most this often
const CHECK_INTERVAL_MS = 5 * 60 * 1000;

// Last reload made to pick up a build, in sessionStorage so it outlives the
// reload. If a cache in front of index.html still hands the old page to the
// reload, the next check would find the same newer build and reload again,
// forever: within this window that build is not offered again.
const RELOAD_ATTEMPT_KEY = "appVersion.reloadAttempt";
const RELOAD_RETRY_MS = 10 * 60 * 1000;

const recentlyReloadedFor = (build: string): boolean => {
  try {
    const attempt = JSON.parse(
      sessionStorage.getItem(RELOAD_ATTEMPT_KEY) || "null",
    );
    return (
      attempt?.build === build && Date.now() - attempt.at < RELOAD_RETRY_MS
    );
  } catch {
    return false;
  }
};

const rememberReloadFor = (build: string | null) => {
  if (!build) return;
  try {
    sessionStorage.setItem(
      RELOAD_ATTEMPT_KEY,
      JSON.stringify({ build, at: Date.now() }),
    );
  } catch {
    // storage unavailable: no loop protection, reload anyway
  }
};

let lastCheckAt = 0;
let inFlight: Promise<boolean> | null = null;

const readBuild = (html: string): string | null => {
  const match = html.match(/<meta\s+name="app-build"\s+content="([^"]*)"/);
  return match ? match[1] : null;
};

/**
 * Resolves `true` when a newer build is live. Never rejects: a failed check
 * just means "no update known".
 */
export const checkForNewVersion = ({
  force = false,
} = {}): Promise<boolean> => {
  if (store.getState().appVersion.updateAvailable) return Promise.resolve(true);
  if (!RUNNING_BUILD) return Promise.resolve(false);
  if (inFlight) return inFlight;
  if (!force && Date.now() - lastCheckAt < CHECK_INTERVAL_MS) {
    return Promise.resolve(false);
  }

  lastCheckAt = Date.now();
  inFlight = fetch(`/index.html?build-check=${Date.now()}`, {
    cache: "no-store",
  })
    .then((response) => (response.ok ? response.text() : null))
    .then((html) => {
      const deployed = html ? readBuild(html) : null;

      // no tag, or a placeholder Vite did not replace: cannot tell
      if (!deployed || deployed.startsWith("%") || deployed === RUNNING_BUILD) {
        return false;
      }

      if (recentlyReloadedFor(deployed)) return false;

      store.dispatch(setUpdateAvailable(deployed));
      return true;
    })
    .catch(() => false)
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
};

/**
 * Loads the current URL again, picking up the deployed build. Pending
 * redux-persist writes are flushed first so nothing persisted is lost.
 */
export const reloadApp = async () => {
  rememberReloadFor(store.getState().appVersion.deployedBuild);

  try {
    await persistor.flush();
  } catch {
    // reload anyway: the newer code matters more than a pending write
  }

  window.location.reload();
};
