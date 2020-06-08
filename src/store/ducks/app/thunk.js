import { Creators as AppCreators } from './index';

const { appSetSider, appSetScreeningListFilter, appSaveFilter, appRemoveFilter } = AppCreators;

export const setSiderThunk = (state = {}) => dispatch => {
  dispatch(appSetSider(state));
};

export const setScreeningListFilterThunk = (params = {}) => dispatch => {
  dispatch(appSetScreeningListFilter(params));
};

export const saveFilterThunk = (filterType, filter) => dispatch => {
  dispatch(appSaveFilter(filterType, filter));
};

export const removeFilterThunk = (filterType, index) => dispatch => {
  dispatch(appRemoveFilter(filterType, index));
};
