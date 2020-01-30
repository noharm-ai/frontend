import { Creators as AppCreators } from './index';

const { appSetSider } = AppCreators;

export const setSiderThunk = (state = {}) => dispatch => {
  dispatch(appSetSider(state));
};
