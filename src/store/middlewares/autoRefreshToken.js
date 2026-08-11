import { ensureFreshToken } from "../refreshTokenManager";

const errorHandler = (e) => ({
  error: e.response ? e.response.data : "error",
  status: e.response ? e.response.status : e.code,
  data: {},
});

const autoRefreshToken = () => (next) => (action) => {
  // Only thunks (function actions) need the async refresh gate. Plain actions
  // pass straight through synchronously so dispatch keeps returning the action
  // object (not a Promise).
  if (typeof action !== "function") {
    return next(action);
  }

  // Two-arg then: errorHandler runs ONLY when the refresh itself fails. The
  // thunk's own rejection (from next(action)) must propagate untouched, as it
  // did before this refactor.
  return ensureFreshToken().then(
    () => next(action),
    (e) => errorHandler(e),
  );
};

export default autoRefreshToken;
