import api from "services/api";
import { errorHandler } from "utils";
import { Creators as UserCreators } from "./index";

const { userSaveStart, userSaveSuccess, userSaveError, userSaveReset } =
  UserCreators;

export const updatePasswordThunk =
  ({ ...params }) =>
  async (dispatch, getState) => {
    dispatch(userSaveStart());

    const { access_token } = getState().auth.identify;
    const { status, error } = await api
      .updatePassword(access_token, params)
      .catch(errorHandler);

    if (status !== 200) {
      dispatch(userSaveError(error));
      return;
    }

    dispatch(userSaveSuccess());
    dispatch(userSaveReset());
  };

export const forgotPasswordThunk = (email) => async (dispatch) => {
  dispatch(userSaveStart());

  const { status, error } = await api.forgotPassword(email).catch(errorHandler);

  if (status !== 200) {
    dispatch(userSaveError(error));
    return;
  }

  dispatch(userSaveSuccess());
  dispatch(userSaveReset());
};

export const resetPasswordThunk = (token, passsword) => async (dispatch) => {
  dispatch(userSaveStart());

  const { status, error } = await api
    .resetPassword(token, passsword)
    .catch(errorHandler);

  if (status !== 200) {
    dispatch(userSaveError(error));
    return;
  }

  dispatch(userSaveSuccess());
  dispatch(userSaveReset());
};
