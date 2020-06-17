import isEmpty from 'lodash.isempty';

import api from '@services/api';
import { errorHandler } from '@utils';
import { Creators as PrescriptionDrugsCreators } from './index';

const {
  prescriptionDrugsSelect,
  prescriptionDrugsUpdate,

  prescriptionDrugsSaveStart,
  prescriptionDrugsSaveError,
  prescriptionDrugsSaveSuccess,
  prescriptionDrugsSaveReset
} = PrescriptionDrugsCreators;

export const savePrescriptionDrugThunk = (idPrescriptionDrug, params = {}) => async (
  dispatch,
  getState
) => {
  dispatch(prescriptionDrugsSaveStart());

  const { access_token } = getState().auth.identify;

  const { error } = await api
    .updatePrescriptionDrug(access_token, idPrescriptionDrug, params)
    .catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(prescriptionDrugsSaveError(error));
    return;
  }

  dispatch(prescriptionDrugsSaveSuccess());
  dispatch(prescriptionDrugsSaveReset());
};

export const selectPrescriptionDrugThunk = item => async dispatch => {
  dispatch(prescriptionDrugsSelect(item));
};

export const clientUpdatePrescriptionDrugThunk = item => async dispatch => {
  dispatch(prescriptionDrugsUpdate(item));
};
