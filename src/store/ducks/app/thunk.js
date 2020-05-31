import { Creators as AppCreators } from './index';

const { appSetSider, appSetScreeningListFilter } = AppCreators;

export const setSiderThunk = (state = {}) => dispatch => {
  dispatch(appSetSider(state));
};

export const setScreeningListFilterThunk = (params = {}) => dispatch => {
  dispatch(appSetScreeningListFilter(params));
};
