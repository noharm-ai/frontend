import isEmpty from 'lodash.isempty';

import transformClinicalNotes from '@utils/transformers/clinicalNotes';
import api from '@services/api';
import { errorHandler } from '@utils';
import { Creators as ReportsCreators } from './index';

const {
  clinicalNotesFetchListStart,
  clinicalNotesFetchListError,
  clinicalNotesFetchListSuccess,

  clinicalNotesSelect
} = ReportsCreators;

export const fetchClinicalNotesListThunk = admissionNumber => async (dispatch, getState) => {
  dispatch(clinicalNotesFetchListStart());

  const { access_token } = getState().auth.identify;

  const { data, error } = await api
    .getClinicalNotes(access_token, admissionNumber)
    .catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(clinicalNotesFetchListError(error));
    return;
  }

  const groups = transformClinicalNotes(data.data);
  dispatch(clinicalNotesFetchListSuccess(groups));
  dispatch(clinicalNotesSelect(data.data[0]));
};

export const selectClinicalNoteThunk = clinicalNote => async dispatch => {
  dispatch(clinicalNotesSelect(clinicalNote));
};
