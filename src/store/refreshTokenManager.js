import { toDate, isPast, subSeconds } from "date-fns";

import api from "services/api";
import { tokenDecode } from "utils";
import notification from "components/notification";
import { getStorageItem, setStorageItem, removeStorageItem } from "utils/storage";

import { store } from "store/index";
import { Creators as AuthCreators } from "./ducks/auth";
import { Creators as UserCreators } from "./ducks/user";

const { authSetRefreshTokenPromise, authDelIdentify } = AuthCreators;
const { userLogout } = UserCreators;

// Starts a refresh, storing the in-flight promise in the shared gate
// (auth.refreshTokenPromise) so concurrent callers rendezvous on one request.
const runRefresh = () => {
  const refreshTokenPromise = api
    .refreshToken()
    .then((response) => {
      setStorageItem("ac1", response.data.access_token.substring(0, 10));
      setStorageItem("ac2", response.data.access_token.substring(10));

      store.dispatch(authSetRefreshTokenPromise(null));

      return response.data
        ? Promise.resolve(response.data)
        : Promise.reject({ message: "could not refresh token" });
    })
    .catch((e) => {
      store.dispatch(authSetRefreshTokenPromise(null));
      return Promise.reject(e);
    });

  store.dispatch(authSetRefreshTokenPromise(refreshTokenPromise));

  return refreshTokenPromise;
};

/**
 * Ensures a non-expired access token before a request/action proceeds.
 *
 * Returns `true` if a refresh occurred, `false` if the current token is still
 * valid or absent. Throws (after logging the user out) when the refresh itself
 * fails.
 *
 * Concurrency: the read of `auth.refreshTokenPromise` and the dispatch that
 * sets it happen with no `await` in between, so simultaneous callers (thunks
 * via the middleware, direct axios calls via the request interceptor) all share
 * a single in-flight refresh.
 */
export const ensureFreshToken = async () => {
  const ac1 = getStorageItem("ac1");
  const ac2 = getStorageItem("ac2");
  const access_token = ac1 && ac2 ? ac1 + ac2 : null;

  if (!access_token) return false;

  let expireDate = null;
  try {
    const { exp } = tokenDecode(access_token);
    expireDate = subSeconds(toDate(exp * 1000), 60);
  } catch {
    // corrupt/partial token -> treat as expired, force refresh below
  }

  if (expireDate && !isPast(expireDate)) return false;

  const inFlight = store.getState().auth.refreshTokenPromise;
  if (inFlight) {
    await inFlight;
    return true;
  }

  try {
    await runRefresh();
    return true;
  } catch (e) {
    removeStorageItem("ac1");
    removeStorageItem("ac2");

    notification.warning({
      message: "Sessão expirada.",
      description: "Faça login novamente para continuar.",
    });

    store.dispatch(authDelIdentify());
    store.dispatch(userLogout());

    throw e;
  }
};
