import isEmpty from "lodash.isempty";

import api from "services/api";
import { errorHandler } from "utils";
import { Creators as ReportsCreators } from "./index";

const {
  clinicalNotesFetchListStart,
  clinicalNotesFetchListError,
  clinicalNotesFetchListSuccess,

  clinicalNotesFetchListExtraStart,
  clinicalNotesFetchListExtraSuccess,

  clinicalNotesSelect,
  clinicalNotesUpdate,

  clinicalNotesSaveStart,
  clinicalNotesSaveSuccess,
  clinicalNotesSaveReset,
  clinicalNotesSaveError,
} = ReportsCreators;

export const fetchClinicalNotesListThunk =
  (admissionNumber) => async (dispatch, getState) => {
    dispatch(clinicalNotesFetchListStart());

    const { access_token } = getState().auth.identify;

    const { data, error } = await api
      .getClinicalNotes(access_token, admissionNumber)
      .catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(clinicalNotesFetchListError(error));
      return;
    }

    const groups = {};
    const dates = {};
    data.data.dates.forEach((d) => {
      groups[d.date] = [];
      dates[d.date] = { ...d };
    });

    data.data.notes.forEach((n) => {
      groups[n.date.substr(0, 10)].push(n);
    });

    dispatch(clinicalNotesFetchListSuccess(groups, dates));
    dispatch(clinicalNotesSelect(data.data.notes[0]));
  };

export const fetchExtraClinicalNotesListThunk =
  (admissionNumber, date) => async (dispatch, getState) => {
    dispatch(clinicalNotesFetchListExtraStart(date));

    const { access_token } = getState().auth.identify;

    const { data, error } = await api
      .getClinicalNotes(access_token, admissionNumber, { date })
      .catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(clinicalNotesFetchListError(error));
      return;
    }

    dispatch(clinicalNotesFetchListExtraSuccess(data.data.notes));
  };

export const selectClinicalNoteThunk = (clinicalNote) => async (dispatch) => {
  dispatch(clinicalNotesSelect(clinicalNote));
};

export const updateClinicalNoteThunk =
  (clinicalNote) => async (dispatch, getState) => {
    dispatch(clinicalNotesSaveStart());
    const { access_token } = getState().auth.identify;

    const { error } = await api
      .updateClinicalNote(access_token, clinicalNote.id, clinicalNote)
      .catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(clinicalNotesSaveError(error));
      return;
    }

    dispatch(clinicalNotesUpdate(clinicalNote));
    dispatch(clinicalNotesSaveSuccess());
    dispatch(clinicalNotesSaveReset());
  };

export const createClinicalNoteThunk =
  (params) => async (dispatch, getState) => {
    dispatch(clinicalNotesSaveStart());
    const { access_token } = getState().auth.identify;

    const { error } = await api
      .createClinicalNote(access_token, params)
      .catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(clinicalNotesSaveError(error));
      return;
    }

    dispatch(clinicalNotesSaveSuccess());
    dispatch(clinicalNotesSaveReset());
  };
