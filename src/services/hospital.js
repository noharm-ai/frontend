import axios from "axios";
import moment from "moment";

import { FeatureService } from "services/FeatureService";
import api from "services/api";
import { store } from "store/index";
import * as patientCache from "utils/patientCache";
import { getStorageItem } from "utils/storage";

const FLAG = "{idPatient}";

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
    await Promise.all(
      listToRequest.map(async ({ idPatient, birthdate }) => {
        if (!forceRefresh && patientCache.getPatient(idPatient)?.cache) {
          return;
        }

        patientCache.markLoading([idPatient]);
        const cache = birthdate ? moment().diff(birthdate, "years") > 0 : false;
        const urlRequest =
          getnameType === "proxy"
            ? `${import.meta.env.VITE_APP_API_URL}/names/${idPatient}`
            : nameUrl.replace(FLAG, idPatient);

        try {
          const { data: patient } = await axios.get(urlRequest, {
            timeout: 8000,
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
      }),
    );
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
 * @param {AbortSignal} [requestConfig.signal] cancels the in-flight requests
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
        const { data: patient } = await axios.get(urlRequest, {
          timeout: 8000,
          headers: nameHeaders,
          signal,
        });
        collect(patient, idPatient);
      } catch (error) {
        if (axios.isCancel(error)) {
          throw error;
        }
        // the backend answers a patient it does not know with an error body
        if (error?.response?.data?.status === "error") {
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
