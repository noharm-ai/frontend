import isEmpty from "lodash.isempty";

import api from "services/admin/api";
import { errorHandler } from "utils";
import { Creators as UsersCreators } from "./index";

const {
  frequencyFetchListStart,
  frequencyFetchListError,
  frequencyFetchListSuccess,

  // frequencyFetchSingleStart,
  // usersFetchSingleError,
  // usersFetchSingleSuccess,
  // usersFetchSingleReset,

  // usersSaveSingleStart,
  // usersSaveSingleReset,
  // usersSaveSingleError,

  // usersUserSelect,
  // usersUserSuccess,
} = UsersCreators;

export const fetchFrequencyListThunk =
  (params = {}) =>
  async (dispatch, getState) => {
    dispatch(frequencyFetchListStart());

    const { access_token } = getState().auth.identify;

    const { data, error } = await api
      .getFrequencyList(access_token, params)
      .catch(errorHandler);

    if (!isEmpty(error)) {
      dispatch(frequencyFetchListError(error));
      return;
    }

    const list = data.data;

    dispatch(frequencyFetchListSuccess(list));
  };

// export const fetchUserByIdThunk = (id) => async (dispatch, getState) => {
//   dispatch(usersFetchSingleStart());

//   const { access_token } = getState().auth.identify;
//   const { data, error } = await api
//     .getSegmentById(access_token, id)
//     .catch(errorHandler);

//   if (!isEmpty(error)) {
//     dispatch(usersFetchSingleError(error));
//     return;
//   }

//   const single = transformSegment(data.data);

//   dispatch(usersFetchSingleSuccess(single, { idSegment: parseInt(id, 10) }));
// };

// export const resetSingleUserThunk = () => async (dispatch, getState) => {
//   dispatch(usersFetchSingleReset());
// };

// export const selectUserThunk = (item) => (dispatch) => {
//   dispatch(usersUserSelect(item));
// };

// export const saveUserThunk =
//   (params = {}) =>
//   (dispatch, getState) => {
//     return new Promise(async (resolve, reject) => {
//       dispatch(usersSaveSingleStart());

//       const { id } = params;
//       const { access_token } = getState().auth.identify;
//       const method = id ? "updateUser" : "createUser";
//       const { status, error, data } = await api[method](
//         access_token,
//         params
//       ).catch(errorHandler);

//       if (status !== 200) {
//         dispatch(usersSaveSingleError(error));
//         reject(error);
//         return;
//       }

//       if (method === "createUser") {
//         params.id = data.data;
//       }

//       dispatch(usersUserSuccess(params));
//       dispatch(usersSaveSingleReset());
//       resolve(params);
//     });
//   };
