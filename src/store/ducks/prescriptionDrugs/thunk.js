import isEmpty from 'lodash.isempty';

import api from '@services/api';
import { errorHandler } from '@utils';
import { Creators as PrescriptionDrugsCreators } from './index';
import { Creators as PrescriptionsCreators } from '../prescriptions/index';

const {
  prescriptionDrugsSelect,
  prescriptionDrugsUpdate,

  prescriptionDrugsSaveStart,
  prescriptionDrugsSaveError,
  prescriptionDrugsSaveSuccess,
  prescriptionDrugsSaveReset
} = PrescriptionDrugsCreators;

const { prescriptionsUpdatePrescriptionDrug } = PrescriptionsCreators;

export const savePrescriptionDrugNoteThunk = (idPrescriptionDrug, params = {}) => async (
  dispatch,
  getState
) => {
  dispatch(prescriptionDrugsSaveStart());

  const { access_token } = getState().auth.identify;

  const { error } = await api
    .updatePrescriptionDrugNote(access_token, idPrescriptionDrug, params)
    .catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(prescriptionDrugsSaveError(error));
    return;
  }

  dispatch(prescriptionDrugsSaveSuccess());
  dispatch(prescriptionDrugsSaveReset());
};

export const savePrescriptionDrugThunk = (idPrescriptionDrug, source, params = {}) => async (
  dispatch,
  getState
) => {
  dispatch(prescriptionDrugsSaveStart());

  const { access_token } = getState().auth.identify;

  const { error, data: updatedPrescriptionDrug } = await api
    .updatePrescriptionDrug(access_token, idPrescriptionDrug, params)
    .catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(prescriptionDrugsSaveError(error));
    return;
  }

  dispatch(
    prescriptionsUpdatePrescriptionDrug(
      idPrescriptionDrug,
      source,
      transformPrescriptionDrug(params, updatedPrescriptionDrug.data)
    )
  );
  dispatch(prescriptionDrugsSaveSuccess());
  dispatch(prescriptionDrugsSaveReset());
};

export const selectPrescriptionDrugThunk = item => async dispatch => {
  dispatch(prescriptionDrugsSelect(item));
};

export const clientUpdatePrescriptionDrugThunk = item => async dispatch => {
  dispatch(prescriptionDrugsUpdate(item));
};

const transformPrescriptionDrug = (data, updatedPrescriptionDrug) => {
  const transformedData = { ...data };

  transformedData.dosage = `${data.dose} ${data.measureUnit}`;
  transformedData.measureUnit = updatedPrescriptionDrug.measureUnit;
  transformedData.frequency = updatedPrescriptionDrug.frequency;
  transformedData.time = updatedPrescriptionDrug.time;
  transformedData.score = updatedPrescriptionDrug.score;

  return transformedData;
};
