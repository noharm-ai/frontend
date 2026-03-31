import axios from "axios";
import moment from "moment";

import { FeatureService } from "services/FeatureService";
import api from "services/api";
import { store } from "store/index";
import * as patientCache from "utils/patientCache";

const FLAG = "{idPatient}";

/**
 * Fetches patient names and stores results in patientCache.
 * Absence from cache means the patient name was not found.
 *
 * @param {object} requestConfig
 * @param {[object]} requestConfig.listToRequest array of objects containing idPatient (and optionally birthdate)
 */
const getPatients = async (requestConfig) => {
  const { listToRequest, nameUrl, proxy } = requestConfig;
  const getnameType = store.getState().app.config.getnameType;
  const apiKey = store.getState().user.account.apiKey;
  let nameHeaders =
    getnameType === "proxy" || proxy
      ? {
          Authorization: `Bearer ${
            localStorage.getItem("ac1") + localStorage.getItem("ac2")
          }`,
          "x-api-key": apiKey,
        }
      : requestConfig.nameHeaders;

  if (!listToRequest || !Array.isArray(listToRequest)) {
    return;
  }

  if (FeatureService.has("DISABLE_GETNAME")) {
    console.log("bypass name resolution");
    return;
  }

  if (getnameType === "auth") {
    const { data: token_response } = await api.getGetnameToken();
    nameHeaders = {
      Authorization: `Bearer ${token_response.data}`,
    };
  }

  if (requestConfig.multipleNameUrl) {
    const cacheConfig = {};
    const requestIds = [];

    listToRequest.forEach((p) => {
      const cachedPatient = patientCache.getPatient(p.idPatient);
      if (!cachedPatient || !cachedPatient?.cache) {
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
        const cached = patientCache.getPatient(idPatient);
        if (cached?.cache) {
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
  const { idPatient, nameUrl, proxy } = requestConfig;
  const getnameType = store.getState().app.config.getnameType;
  const apiKey = store.getState().user.account.apiKey;
  let nameHeaders =
    getnameType === "proxy" || proxy
      ? {
          Authorization: `Bearer ${
            localStorage.getItem("ac1") + localStorage.getItem("ac2")
          }`,
          "x-api-key": apiKey,
        }
      : requestConfig.nameHeaders;

  if (getnameType === "auth") {
    const { data: token_response } = await api.getGetnameToken();
    nameHeaders = {
      Authorization: `Bearer ${token_response.data}`,
    };
  }

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

const hospital = {
  getPatients,
  getSinglePatient,
};

export default hospital;
