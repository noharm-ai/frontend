import { isEmpty } from "lodash";

import api from "services/api";
import { errorHandler } from "utils";
import { sourceToStoreType } from "utils/transformers/prescriptions";
import { fetchScreeningThunk } from "store/ducks/prescriptions/thunk";
import { Creators as PrescriptionDrugsCreators } from "./index";
import { Creators as PrescriptionsCreators } from "../prescriptions/index";
import Feature from "models/Feature";

const {
  prescriptionDrugsSelect,

  prescriptionDrugsSaveStart,
  prescriptionDrugsSaveError,
  prescriptionDrugsSaveSuccess,
  prescriptionDrugsSaveReset,
} = PrescriptionDrugsCreators;

const { prescriptionsUpdatePrescriptionDrug } = PrescriptionsCreators;

export const savePrescriptionDrugNoteThunk =
  (idPrescriptionDrug, source, params = {}) =>
  (dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
      dispatch(prescriptionDrugsSaveStart());

      const { access_token } = getState().auth.identify;

      const { error } = await api
        .updatePrescriptionDrugNote(access_token, idPrescriptionDrug, params)
        .catch(errorHandler);

      if (!isEmpty(error)) {
        dispatch(prescriptionDrugsSaveError(error));
        reject(error);
        return;
      }

      const data = {
        idPrescription: params.idPrescription,
        idPrescriptionDrug: params.idPrescriptionDrug,
        notes: params.notes,
      };

      let drugSource = source;
      let features = getState().user?.account?.features || [];

      if (
        drugSource === "solution" &&
        features.indexOf(Feature.DISABLE_SOLUTION_TAB) !== -1
      ) {
        drugSource = "prescription";
      }

      dispatch(
        prescriptionsUpdatePrescriptionDrug(
          idPrescriptionDrug,
          drugSource,
          data
        )
      );
      dispatch(prescriptionDrugsSaveSuccess());
      resolve();
    });
  };

export const savePrescriptionDrugFormThunk =
  (idPrescriptionDrug, params = {}) =>
  (dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
      const { access_token } = getState().auth.identify;

      const { error } = await api
        .updatePrescriptionDrugNote(access_token, idPrescriptionDrug, params)
        .catch(errorHandler);

      if (!isEmpty(error)) {
        reject(error);
        return;
      }

      resolve();
    });
  };

const prepareParams = (params) => {
  const p = { ...params };

  switch (params.source) {
    case "prescription":
      p.source = "Medicamentos";
      break;
    case "solution":
      p.source = "Soluções";
      break;
    case "procedure":
      p.source = "Proced/Exames";
      break;
    case "diet":
      p.source = "Dietas";
      break;
    default:
      throw new Error("Undefined source");
  }

  return p;
};

export const savePrescriptionDrugThunk =
  (idPrescriptionDrug, aggId, source, params = {}) =>
  (dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
      dispatch(prescriptionDrugsSaveStart());

      const { access_token } = getState().auth.identify;

      const preparedParams = prepareParams({ ...params, source });

      const { error, data: updatedPrescriptionDrug } = await api
        .savePrescriptionDrug(access_token, idPrescriptionDrug, preparedParams)
        .catch(errorHandler);

      if (!isEmpty(error)) {
        dispatch(prescriptionDrugsSaveError(error));
        reject(error);
        return;
      }

      if (idPrescriptionDrug) {
        //updating
        dispatch(
          prescriptionsUpdatePrescriptionDrug(
            idPrescriptionDrug,
            source,
            transformPrescriptionDrug(
              { ...params, source },
              updatedPrescriptionDrug.data
            )
          )
        );
      } else {
        // adding new
        if (aggId) {
          dispatch(fetchScreeningThunk(aggId));
        } else {
          dispatch(fetchScreeningThunk(params.idPrescription));
        }
      }

      dispatch(prescriptionDrugsSaveSuccess());
      resolve();
    });
  };

export const copyPrescriptionDrugThunk =
  (idPrescription, aggId, idDrugs) => (dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
      dispatch(prescriptionDrugsSaveStart());

      const { access_token } = getState().auth.identify;

      const { error } = await api
        .copyPrescriptionMissingDrugs(access_token, idPrescription, idDrugs)
        .catch(errorHandler);

      if (!isEmpty(error)) {
        dispatch(prescriptionDrugsSaveError(error));
        reject(error);
        return;
      }

      if (aggId) {
        dispatch(fetchScreeningThunk(aggId));
      } else {
        dispatch(fetchScreeningThunk(idPrescription));
      }

      dispatch(prescriptionDrugsSaveSuccess());
      resolve();
    });
  };

export const suspendPrescriptionDrugThunk =
  (idPrescriptionDrug, source, suspend) => async (dispatch, getState) => {
    dispatch(prescriptionDrugsSaveStart());

    const { access_token } = getState().auth.identify;

    const { error, data: updatedPrescriptionDrug } = await api
      .suspendPrescriptionDrug(access_token, idPrescriptionDrug, suspend)
      .catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(prescriptionDrugsSaveError(error));
      return;
    }

    dispatch(
      prescriptionsUpdatePrescriptionDrug(
        idPrescriptionDrug,
        source,
        updatedPrescriptionDrug.data
      )
    );
    dispatch(prescriptionDrugsSaveSuccess());
    dispatch(prescriptionDrugsSaveReset());
  };

export const selectPrescriptionDrugThunk = (item) => async (dispatch) => {
  dispatch(prescriptionDrugsSelect(item));
};

const transformPrescriptionDrug = (data, updatedPrescriptionDrug) => {
  const transformedData = {
    ...updatedPrescriptionDrug,
    ...{
      dosage: `${data.dose} ${data.measureUnit}`,
      source: sourceToStoreType(data.source),
      key: updatedPrescriptionDrug.idPrescriptionDrug,
    },
  };

  return transformedData;
};
