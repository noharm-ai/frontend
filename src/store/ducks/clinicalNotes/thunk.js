import isEmpty from 'lodash.isempty';

import { transformClinicalNotes, getPositionList } from '@utils/transformers/clinicalNotes';
import api from '@services/api';
import { errorHandler } from '@utils';
import { Creators as ReportsCreators } from './index';

const {
  clinicalNotesFetchListStart,
  clinicalNotesFetchListError,
  clinicalNotesFetchListSuccess,

  clinicalNotesSelect,
  clinicalNotesUpdate,

  clinicalNotesSaveStart,
  clinicalNotesSaveSuccess,
  clinicalNotesSaveReset,
  clinicalNotesSaveError
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
  dispatch(clinicalNotesFetchListSuccess(groups, getPositionList(data.data)));
  dispatch(clinicalNotesSelect(data.data[0]));
};

export const selectClinicalNoteThunk = clinicalNote => async dispatch => {
  dispatch(clinicalNotesSelect(clinicalNote));
};

export const updateClinicalNoteThunk = clinicalNote => async (dispatch, getState) => {
  dispatch(clinicalNotesSaveStart());
  const { access_token } = getState().auth.identify;

  const { error } = await api
    .updateClinicalNote(access_token, clinicalNote.id, clinicalNote.text)
    .catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(clinicalNotesSaveError(error));
    return;
  }

  dispatch(clinicalNotesUpdate(clinicalNote));
  dispatch(clinicalNotesSaveSuccess());
  dispatch(clinicalNotesSaveReset());
};
