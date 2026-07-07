import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

import { trainingHandlers } from "./handlers";
import { findHandlerKey } from "./matchHandler";
import { isTrainingMockActive } from "./trainingMockState";

const handlerKeys = Object.keys(trainingHandlers);

/** Endpoint path without query string (api.js always uses relative urls). */
const pathOf = (config: InternalAxiosRequestConfig): string =>
  (config.url ?? "").split("?")[0];

const mockedSuccess: (config: InternalAxiosRequestConfig) => unknown = () => ({
  status: "success",
  data: [],
});

/**
 * Installed unconditionally on the main axios instance (services/api.js) and
 * a no-op until training mode turns the flag on. While active, matched
 * requests are short-circuited by swapping the adapter, so thunks,
 * transformers and error handling see a normal AxiosResponse.
 *
 * Unmatched requests: GETs pass through (read-only, and blocking them would
 * break ambient features like memory/preferences); everything else is always
 * swallowed with a generic success — the hard invariant is that no write
 * ever reaches the backend during training, even for flows a training author
 * forgot to mock.
 */
export const installTrainingMock = (instance: AxiosInstance): void => {
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (!isTrainingMockActive()) {
      return config;
    }

    const method = (config.method ?? "get").toUpperCase();
    const path = pathOf(config);
    const key = findHandlerKey(method, path, handlerKeys);

    if (!key && method === "GET") {
      return config;
    }

    if (!key) {
      console.warn(`[training] blocked unmocked write: ${method} ${path}`);
    }

    const handler = key ? trainingHandlers[key] : mockedSuccess;

    config.adapter = (adapterConfig) =>
      Promise.resolve({
        data: handler(adapterConfig),
        status: 200,
        statusText: "OK",
        headers: {},
        config: adapterConfig,
      });

    return config;
  });
};
