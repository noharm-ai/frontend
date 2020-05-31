import isEmpty from 'lodash.isempty';

import api from '@services/api';
import { errorHandler } from '@utils';
import { Creators as ReportsCreators } from './index';

const {
  reportsFetchListStart,
  reportsFetchListError,
  reportsFetchListSuccess,

  reportsSelect
} = ReportsCreators;

export const fetchReportsListThunk = (params = {}) => async (dispatch, getState) => {
  dispatch(reportsFetchListStart());

  const { access_token } = getState().auth.identify;

  const { data, error } = await api.getReports(access_token, params).catch(errorHandler);

  if (!isEmpty(error)) {
    dispatch(reportsFetchListError(error));
    return;
  }

  dispatch(reportsFetchListSuccess(data.reports));
};

export const selectReportThunk = reportData => async dispatch => {
  dispatch(reportsSelect(reportData));
};
