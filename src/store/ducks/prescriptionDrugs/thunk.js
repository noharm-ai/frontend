import isEmpty from 'lodash.isempty';

import api from '@services/api';
import { errorHandler } from '@utils';
import { sourceToStoreType } from '@utils/transformers/prescriptions';
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

export const savePrescriptionDrugNoteThunk = (idPrescriptionDrug, source, params = {}) => async (
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

  const data = { ...params };
  delete data.frequency;
  delete data.measureUnit;

  dispatch(prescriptionsUpdatePrescriptionDrug(idPrescriptionDrug, source, data));
  dispatch(prescriptionDrugsSaveSuccess());
  dispatch(prescriptionDrugsSaveReset());
};

const prepareParams = params => {
  const p = { ...params };

  switch (params.source) {
    case 'prescription':
      p.source = 'Medicamentos';
      break;
    case 'solution':
      p.source = 'Soluções';
      break;
    case 'procedure':
      p.source = 'Proced/Exames';
      break;
    case 'diet':
      p.source = 'Dietas';
      break;
    default:
      throw new Error('Undefined source');
  }

  return p;
};

export const savePrescriptionDrugThunk = (idPrescriptionDrug, source, params = {}) => async (
  dispatch,
  getState
) => {
  dispatch(prescriptionDrugsSaveStart());

  const { access_token } = getState().auth.identify;

  const preparedParams = prepareParams({ ...params, source });

  const { error, data: updatedPrescriptionDrug } = await api
    .savePrescriptionDrug(access_token, idPrescriptionDrug, preparedParams)
    .catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(prescriptionDrugsSaveError(error));
    return;
  }

  dispatch(
    prescriptionsUpdatePrescriptionDrug(
      idPrescriptionDrug,
      source,
      transformPrescriptionDrug({ ...params, source }, updatedPrescriptionDrug.data)
    )
  );
  dispatch(prescriptionDrugsSaveSuccess());
  dispatch(prescriptionDrugsSaveReset());
};

export const suspendPrescriptionDrugThunk = (idPrescriptionDrug, source, suspend) => async (
  dispatch,
  getState
) => {
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
    prescriptionsUpdatePrescriptionDrug(idPrescriptionDrug, source, updatedPrescriptionDrug.data)
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
  const transformedData = {
    ...updatedPrescriptionDrug,
    ...{
      dosage: `${data.dose} ${data.measureUnit}`,
      source: sourceToStoreType(data.source),
      key: updatedPrescriptionDrug.idPrescriptionDrug
    }
  };

  return transformedData;
};
