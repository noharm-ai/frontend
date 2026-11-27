import axios from "axios";
import moment from "moment";

import { FeatureService } from "services/FeatureService";
import api from "services/api";
import { store } from "store/index";
import * as patientCache from "utils/patientCache";
import { getStorageItem } from "utils/storage";

const FLAG = "{idPatient}";

/**
 * Per-patient name lookups (one GET per id, when there is no multipleNameUrl)
 * in flight at once, shared by every caller. Firing a whole list at once makes
 * the browser queue most requests behind its ~6 connections per host, so the
 * 8s timeout runs out before they are even sent, and a name service may answer
 * the burst with 429. 4 leaves room for the app's own API calls when getname
 * runs through the NoHarm backend (proxy mode, same host).
 */
export const NAME_REQUEST_CONCURRENCY = 4;
const NAME_REQUEST_TIMEOUT = 8000;
// retries of a lookup answered with 429 (Too Many Requests)
const NAME_RATE_LIMIT_RETRIES = 2;
const NAME_RETRY_BASE_DELAY = 1000;
const NAME_RETRY_MAX_DELAY = 10000;

let activeNameRequests = 0;
const nameRequestQueue = [];

const canceled = () => new axios.CanceledError();

/** Waits for a free name request slot; rejects when the signal aborts first. */
const acquireNameSlot = (signal) =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(canceled());
      return;
    }

    if (activeNameRequests < NAME_REQUEST_CONCURRENCY) {
      activeNameRequests++;
      resolve();
      return;
    }

    const onAbort = () => {
      const index = nameRequestQueue.indexOf(waiter);
      if (index !== -1) nameRequestQueue.splice(index, 1);
      reject(canceled());
    };
    const waiter = () => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    };
    signal?.addEventListener("abort", onAbort, { once: true });
    nameRequestQueue.push(waiter);
  });

/** Hands the slot over to the next queued lookup, or frees it. */
const releaseNameSlot = () => {
  const next = nameRequestQueue.shift();
  if (next) {
    next();
  } else {
    activeNameRequests--;
  }
};

const wait = (ms, signal) =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(canceled());
      return;
    }

    const onAbort = () => {
      clearTimeout(timer);
      reject(canceled());
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });

/**
 * How long to wait before retrying a 429: the Retry-After header (seconds or
 * an HTTP date) when present, an exponential backoff otherwise. A name service
 * on another origin only exposes Retry-After to the page when it lists it in
 * Access-Control-Expose-Headers, so the backoff is the usual case there.
 */
const rateLimitDelay = (error, attempt) => {
  const retryAfter = error?.response?.headers?.["retry-after"];
  if (retryAfter) {
    const seconds = Number(retryAfter);
    const ms = Number.isFinite(seconds)
      ? seconds * 1000
      : Date.parse(retryAfter) - Date.now();

    if (Number.isFinite(ms)) {
      return Math.min(Math.max(ms, 0), NAME_RETRY_MAX_DELAY);
    }
  }

  const backoff = NAME_RETRY_BASE_DELAY * 2 ** attempt;
  return Math.min(backoff + Math.random() * backoff, NAME_RETRY_MAX_DELAY);
};

/**
 * GETs one patient's name within the shared concurrency limit, retrying a
 * 429 a few times. The slot is kept while waiting to retry, so a rate-limited
 * service gets fewer requests, not more. Any other error is thrown as is.
 */
const requestName = async (url, { headers, signal }) => {
  await acquireNameSlot(signal);

  try {
    for (let attempt = 0; ; attempt++) {
      try {
        return await axios.get(url, {
          timeout: NAME_REQUEST_TIMEOUT,
          headers,
          signal,
        });
      } catch (error) {
        if (
          error?.response?.status !== 429 ||
          attempt >= NAME_RATE_LIMIT_RETRIES
        ) {
          throw error;
        }
        await wait(rateLimitDelay(error, attempt), signal);
      }
    }
  } finally {
    releaseNameSlot();
  }
};

// getPatients lookups in flight, keyed by schema and id, so a list loaded
// again while the previous load is still resolving does not ask twice
const pendingPatients = new Map();

/**
 * Builds the headers for the configured getname mode: the NoHarm token in
 * proxy mode, a short-lived getname token in auth mode, the configured
 * headers otherwise.
 */
const resolveNameHeaders = async ({ nameHeaders, proxy }) => {
  const getnameType = store.getState().app.config.getnameType;
  const apiKey = store.getState().user.account.apiKey;

  if (getnameType === "auth") {
    const { data: token_response } = await api.getGetnameToken();
    return {
      Authorization: `Bearer ${token_response.data}`,
    };
  }

  if (getnameType === "proxy" || proxy) {
    return {
      Authorization: `Bearer ${getStorageItem("ac1") + getStorageItem("ac2")}`,
      "x-api-key": apiKey,
    };
  }

  return nameHeaders;
};

/**
 * Fetches patient names and stores results in patientCache.
 * Absence from cache means the patient name was not found.
 *
 * @param {object} requestConfig
 * @param {[object]} requestConfig.listToRequest array of objects containing idPatient (and optionally birthdate)
 * @param {boolean} [requestConfig.forceRefresh] ignore cached entries and always request the names again
 */
const getPatients = async (requestConfig) => {
  const { listToRequest, nameUrl, forceRefresh } = requestConfig;
  const getnameType = store.getState().app.config.getnameType;

  if (!listToRequest || !Array.isArray(listToRequest)) {
    return;
  }

  if (FeatureService.has("DISABLE_GETNAME")) {
    console.log("bypass name resolution");
    return;
  }

  const nameHeaders = await resolveNameHeaders(requestConfig);

  if (requestConfig.multipleNameUrl) {
    const cacheConfig = {};
    const requestIds = [];

    listToRequest.forEach((p) => {
      const cachedPatient = patientCache.getPatient(p.idPatient);
      if (forceRefresh || !cachedPatient?.cache) {
        requestIds.push(p.idPatient);

        if (p.birthdate && moment().diff(p.birthdate, "years") > 0) {
          cacheConfig[p.idPatient] = true;
        } else {
          cacheConfig[p.idPatient] = false;
        }
      }
    });

    if (!requestIds.length) {
      return;
    }

    patientCache.markLoading(requestIds);
    try {
      const { data: patientList } = await axios.post(
        getnameType === "proxy"
          ? `${import.meta.env.VITE_APP_API_URL}/names`
          : requestConfig.multipleNameUrl,
        {
          patients: requestIds,
        },
        { headers: nameHeaders, timeout: 30000 },
      );

      const results = {};
      patientList
        .filter((p) => p.status === "success")
        .forEach((p) => {
          results[p.idPatient] = {
            ...p,
            cache: cacheConfig[p.idPatient] || false,
          };
        });

      const failed = requestIds.filter((id) => !results[id]);
      if (failed.length) {
        patientCache.clearLoading(failed);
      }

      patientCache.setPatients(results);
    } catch (error) {
      patientCache.clearLoading(requestIds);
    }
  } else {
    const schema = getStorageItem("schema");
    const seen = new Set();
    const toRequest = [];
    const pending = [];

    listToRequest.forEach(({ idPatient, birthdate }) => {
      const key = `${schema}:${idPatient}`;
      if (seen.has(key)) {
        return;
      }
      seen.add(key);

      if (!forceRefresh && patientCache.getPatient(idPatient)?.cache) {
        return;
      }

      if (!forceRefresh && pendingPatients.has(key)) {
        pending.push(pendingPatients.get(key));
        return;
      }

      toRequest.push({ idPatient, birthdate, key });
    });

    // every queued id shows as loading, not only the ones in flight
    if (toRequest.length) {
      patientCache.markLoading(toRequest.map(({ idPatient }) => idPatient));
    }

    const fetchPatient = async ({ idPatient, birthdate }) => {
      const cache = birthdate ? moment().diff(birthdate, "years") > 0 : false;
      const urlRequest =
        getnameType === "proxy"
          ? `${import.meta.env.VITE_APP_API_URL}/names/${idPatient}`
          : nameUrl.replace(FLAG, idPatient);

      try {
        const { data: patient } = await requestName(urlRequest, {
          headers: nameHeaders,
        });

        if (patient == null || patient.status === "error") {
          patientCache.clearLoading([idPatient]);
          return;
        }
        if (patient.id) {
          patient.idPatient = patient.id;
        }

        patientCache.setPatient({ ...patient, cache });
      } catch (e) {
        patientCache.clearLoading([idPatient]);
      }
    };

    await Promise.all([
      ...pending,
      ...toRequest.map((item) => {
        const request = fetchPatient(item).finally(() => {
          if (pendingPatients.get(item.key) === request) {
            pendingPatients.delete(item.key);
          }
        });
        pendingPatients.set(item.key, request);
        return request;
      }),
    ]);
  }
};

const getSinglePatient = async (requestConfig) => {
  const { idPatient, nameUrl } = requestConfig;
  const getnameType = store.getState().app.config.getnameType;
  const nameHeaders = await resolveNameHeaders(requestConfig);

  const urlRequest =
    getnameType === "proxy"
      ? `${import.meta.env.VITE_APP_API_URL}/names/${idPatient}`
      : nameUrl.replace(FLAG, idPatient);

  patientCache.markLoading([idPatient]);
  const { data: patient } = await axios.get(urlRequest, {
    timeout: 8000,
    headers: nameHeaders,
  });

  if (patient.id) {
    patient.idPatient = patient.id;
  }

  patientCache.setPatient({ ...patient, cache: false });
};

/**
 * Resolves the names of one batch of patients WITHOUT writing to patientCache,
 * for screens that keep names only in page memory (e.g. custom reports, which
 * would otherwise evict the names the rest of the app relies on). The caller
 * chunks the ids: up to ~100 per call with multipleNameUrl, one per call
 * without it (each id is one GET).
 *
 * An id is either found (`names`), reported as not found by the name service
 * (`notFound`, an entry with status "error"), or neither: the lookup failed or
 * was never made (e.g. the backend time budget ran out), so it can be retried.
 *
 * @param {object} requestConfig
 * @param {(number|string)[]} requestConfig.ids patient ids (fkpessoa)
 * @param {string} [requestConfig.nameUrl] single-patient url, with {idPatient}
 * @param {string} [requestConfig.multipleNameUrl] batch url; one GET per id when absent
 * @param {object} [requestConfig.nameHeaders] headers for a direct getname call
 * @param {boolean} [requestConfig.proxy] call getname through the NoHarm backend
 * @param {object} [requestConfig.headers] headers already resolved with
 *   resolveNameHeaders, so a run of many calls fetches an auth token once
 * @param {AbortSignal} [requestConfig.signal] cancels the in-flight and the
 *   queued requests
 * @returns {Promise<{ names: Record<string, string>, notFound: string[] }>}
 *   keyed by String(idPatient). Empty when name resolution is disabled.
 *   Rejects when a batch request fails or is aborted.
 */
const getPatientNames = async (requestConfig) => {
  const { ids, nameUrl, multipleNameUrl, signal } = requestConfig;
  const getnameType = store.getState().app.config.getnameType;
  const result = { names: {}, notFound: [] };

  if (!Array.isArray(ids) || !ids.length) {
    return result;
  }

  if (FeatureService.has("DISABLE_GETNAME")) {
    return result;
  }

  const nameHeaders =
    requestConfig.headers ?? (await resolveNameHeaders(requestConfig));

  const collect = (patient, fallbackId) => {
    const key = String(patient?.idPatient ?? patient?.id ?? fallbackId);
    if (patient?.status === "success" && patient.name) {
      result.names[key] = patient.name;
    } else if (patient?.status === "error") {
      result.notFound.push(key);
    }
  };

  if (multipleNameUrl) {
    const { data: patientList } = await axios.post(
      getnameType === "proxy"
        ? `${import.meta.env.VITE_APP_API_URL}/names`
        : multipleNameUrl,
      { patients: ids },
      { headers: nameHeaders, timeout: 30000, signal },
    );

    (Array.isArray(patientList) ? patientList : []).forEach((p) =>
      collect(p),
    );

    return result;
  }

  await Promise.all(
    ids.map(async (idPatient) => {
      const urlRequest =
        getnameType === "proxy"
          ? `${import.meta.env.VITE_APP_API_URL}/names/${idPatient}`
          : nameUrl.replace(FLAG, idPatient);

      try {
        const { data: patient } = await requestName(urlRequest, {
          headers: nameHeaders,
          signal,
        });
        collect(patient, idPatient);
      } catch (error) {
        if (axios.isCancel(error)) {
          throw error;
        }
        // the backend answers a patient it does not know with an error body
        // (a 429 that outlasted the retries is a failed lookup, not that)
        if (
          error?.response?.status !== 429 &&
          error?.response?.data?.status === "error"
        ) {
          collect(error.response.data, idPatient);
        }
        // otherwise the lookup failed: the id is left out, to be retried
      }
    }),
  );

  return result;
};

const hospital = {
  getPatients,
  getSinglePatient,
  getPatientNames,
  resolveNameHeaders,
};

export default hospital;
