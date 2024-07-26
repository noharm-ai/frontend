import axios from "axios";
import moment from "moment";

import securityService from "services/security";
import appInfo from "utils/appInfo";

const FLAG = "{idPatient}";

const defaultValue = (idPatient) => ({
  idPatient,
  name: `Paciente ${idPatient}`,
  cache: false,
  status: "success",
});

/**
 *
 * @param {string} bearerToken
 * @param {object} requestConfig
 * @param {[object]} requestConfig.listToRequest array of object
 * containing the idPatient to request.
 * @param {{object}} requestConfig.listToEscape object of objects
 * containing the patients that has already requested.
 *
 * @return {[object]} array of object.
 * ex:
 * [
 *   {
 *     "status": "success",
 *     "idPatient": 7,
 *     "name": "Fulano da Silva e Santos"
 *   }
 * ]
 */
const getPatients = async (bearerToken, requestConfig) => {
  const { listToRequest, listToEscape, nameUrl, useCache, userRoles, proxy } =
    requestConfig;
  const nameHeaders = proxy
    ? {
        Authorization: `Bearer ${
          localStorage.getItem("ac1") + localStorage.getItem("ac2")
        }`,
        "x-api-key": appInfo.apiKey,
      }
    : requestConfig.nameHeaders;
  const security = securityService(userRoles);
  let promises;

  if (!listToRequest || !Array.isArray(listToRequest)) {
    return listToEscape;
  }

  if (security.isGetnameEnabled()) {
    if (requestConfig.multipleNameUrl && listToRequest.length > 1) {
      const cacheConfig = {};
      const requestIds = [];

      listToRequest.forEach((p) => {
        if (!listToEscape[p.idPatient]) {
          requestIds.push(p.idPatient);

          if (p.birthdate && moment().diff(p.birthdate, "years") > 0) {
            cacheConfig[p.idPatient] = true;
          } else {
            cacheConfig[p.idPatient] = false;
          }
        }
      });

      if (!requestIds.length) {
        promises = listToRequest
          .filter((p) => listToEscape[p.idPatient])
          .map((p) => listToEscape[p.idPatient]);
      } else {
        try {
          const { data: patientList } = await axios.post(
            requestConfig.multipleNameUrl,
            {
              patients: requestIds,
            },
            { headers: nameHeaders, timeout: 30000 }
          );

          promises = patientList
            .map((p) => ({
              ...p,
              cache:
                p.status === "success"
                  ? cacheConfig[p.idPatient] || false
                  : false,
            }))
            .concat(
              listToRequest
                .filter((p) => listToEscape[p.idPatient])
                .map((p) => listToEscape[p.idPatient])
            );
        } catch (error) {
          promises = listToRequest.map((p) => defaultValue(p.idPatient));
        }
      }
    } else {
      promises = await listToRequest.map(async ({ idPatient, birthdate }) => {
        if (listToEscape[idPatient] && useCache) {
          return listToEscape[idPatient];
        }

        const cache = birthdate
          ? moment().diff(birthdate, "years") > 0
          : useCache;
        console.log(
          "%cRequested patient of id: ",
          "color: #e67e22;",
          idPatient,
          "cache:",
          cache
        );
        console.log("%cRequested patient of url: ", "color: #e67e22;", nameUrl);
        const urlRequest = nameUrl.replace(FLAG, idPatient);

        try {
          const { data: patient } = await axios.get(urlRequest, {
            timeout: 8000,
            headers: nameHeaders,
          });

          if (patient == null || patient.status === "error") {
            console.log(
              "%cRequested patient error: ",
              "color: #e67e22;",
              idPatient,
              patient
            );
            return defaultValue(idPatient);
          }
          if (patient.id) {
            patient.idPatient = patient.id;
          }

          return { ...patient, cache };
        } catch (e) {
          return defaultValue(idPatient);
        }
      });
    }
  } else {
    console.log("bypass name resolution service");
    promises = listToRequest.map(async ({ idPatient }) =>
      defaultValue(idPatient)
    );
  }

  const patients = await Promise.all(promises);

  patients.forEach((p) => {
    listToEscape[p.idPatient] = p;
  });

  return listToEscape;
};

const getSinglePatient = async (bearerToken, requestConfig) => {
  const { idPatient, nameUrl, proxy } = requestConfig;
  const nameHeaders = proxy
    ? {
        Authorization: `Bearer ${bearerToken}`,
        "x-api-key": appInfo.apiKey,
      }
    : requestConfig.nameHeaders;

  const urlRequest = nameUrl.replace(FLAG, idPatient);

  const { data: patient } = await axios.get(urlRequest, {
    timeout: 8000,
    headers: nameHeaders,
  });

  if (patient.id) {
    patient.idPatient = patient.id;
  }

  return { ...patient };
};

const hospital = {
  getPatients,
  getSinglePatient,
};

export default hospital;
