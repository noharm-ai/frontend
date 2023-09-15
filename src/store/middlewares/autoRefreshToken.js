import isEmpty from "lodash.isempty";
import { toDate, isPast } from "date-fns";

import api from "services/api";
import { tokenDecode } from "utils";

import { Creators as AuthCreators } from "../ducks/auth";
import { Creators as UserCreators } from "../ducks/user";

const { authSetIdentify, authSetRefreshTokenPromise, authDelIdentify } =
  AuthCreators;
const { userLogout } = UserCreators;

const autoRefreshToken =
  ({ dispatch, getState }) =>
  (next) =>
  async (action) => {
    if (typeof action !== "function") {
      return next(action);
    }

    const access_token =
      localStorage.getItem("ac1") + localStorage.getItem("ac2");
    const { auth } = getState();

    if (!isEmpty(access_token)) {
      const { exp } = tokenDecode(access_token);
      const expireDate = toDate(exp * 1000);
      const errorHandler = (e) => {
        return {
          error: e.response ? e.response.data : "error",
          status: e.response ? e.response.status : e.code,
          data: {},
        };
      };

      if (!isPast(expireDate)) {
        return next(action);
      }

      if (!auth.refreshTokenPromise) {
        return refreshToken(dispatch)
          .then(() => next(action))
          .catch((e) => {
            localStorage.removeItem("ac1");
            localStorage.removeItem("ac2");

            dispatch(authDelIdentify());
            dispatch(userLogout());

            return errorHandler(e);
          });
      } else {
        return getState().auth.refreshTokenPromise.then(() => next(action));
      }
    }
    return next(action);
  };

const refreshToken = (dispatch) => {
  const refreshTokenPromise = api
    .refreshToken()
    .then((response) => {
      localStorage.setItem("ac1", response.data.access_token.substring(0, 10));
      localStorage.setItem("ac2", response.data.access_token.substring(10));

      dispatch(authSetRefreshTokenPromise(null));

      return response.data
        ? Promise.resolve(response.data)
        : Promise.reject({
            message: "could not refresh token",
          });
    })
    .catch((e) => {
      console.error("error refreshing token", e);

      dispatch(authSetRefreshTokenPromise(null));
      return Promise.reject(e);
    });

  dispatch(authSetRefreshTokenPromise(refreshTokenPromise));

  return refreshTokenPromise;
};

export default autoRefreshToken;
