import api from "services/api";
import { errorHandler } from "utils";
import { Creators as UserCreators } from "./index";

const { userSaveStart, userSaveSuccess, userSaveError, userSaveReset } =
  UserCreators;

export const updatePasswordThunk =
  ({ ...params }) =>
  (dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
      dispatch(userSaveStart());

      const { access_token } = getState().auth.identify;
      const { status, error } = await api
        .updatePassword(access_token, params)
        .catch(errorHandler);

      if (status !== 200) {
        dispatch(userSaveError(error));
        reject();
        return;
      }

      dispatch(userSaveSuccess());
      dispatch(userSaveReset());
      resolve();
    });
  };

export const forgotPasswordThunk = (email) => (dispatch) => {
  return new Promise(async (resolve, reject) => {
    dispatch(userSaveStart());

    const { status, error } = await api
      .forgotPassword(email)
      .catch(errorHandler);

    if (status !== 200) {
      dispatch(userSaveError(error));
      reject(error);
      return;
    }

    dispatch(userSaveSuccess());
    dispatch(userSaveReset());
    resolve(email);
  });
};

export const resetPasswordThunk = (token, passsword) => (dispatch) => {
  return new Promise(async (resolve, reject) => {
    dispatch(userSaveStart());

    const { status, error } = await api
      .resetPassword(token, passsword)
      .catch(errorHandler);

    if (status !== 200) {
      dispatch(userSaveError(error));
      reject(error);
      return;
    }

    dispatch(userSaveSuccess());
    dispatch(userSaveReset());
    resolve();
  });
};
