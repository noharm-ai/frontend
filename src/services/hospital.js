import axios from 'axios';
import moment from 'moment';

import securityService from '@services/security';

const defaultValue = idPatient => ({
  idPatient,
  name: `Paciente ${idPatient}`,
  cache: false,
  status: 'success'
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
  const flag = '{idPatient}';

  const { listToRequest, listToEscape, nameUrl, nameHeaders, useCache, userRoles } = requestConfig;
  const security = securityService(userRoles);
  let promises;

  if (!security.isAdmin()) {
    promises = await listToRequest.map(async ({ idPatient, birthdate }) => {
      if (listToEscape[idPatient] && useCache) {
        return listToEscape[idPatient];
      }

      const cache = moment().diff(birthdate, 'years') > 0;
      console.log('%cRequested patient of id: ', 'color: #e67e22;', idPatient, 'cache:', cache);
      console.log('%cRequested patient of url: ', 'color: #e67e22;', nameUrl);
      const urlRequest = nameUrl.replace(flag, idPatient);

      try {
        const { data: patient } = await axios.get(urlRequest, {
          timeout: 8000,
          headers: nameHeaders
        });

        if (patient == null || patient.status === 'error') {
          console.log('%cRequested patient error: ', 'color: #e67e22;', idPatient, patient);
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
  } else {
    console.log('bypass name resolution service');
    promises = listToRequest.map(async ({ idPatient }) => defaultValue(idPatient));
  }

  const patients = await Promise.all(promises);

  patients.forEach(p => {
    listToEscape[p.idPatient] = p;
  });

  return listToEscape;
};

const hospital = {
  getPatients
};

export default hospital;
