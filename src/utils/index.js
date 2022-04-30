import isEmpty from 'lodash.isempty';

import { store } from '@store';
import { Creators as AuthCreators } from '../store/ducks/auth';
import { Creators as UserCreators } from '../store/ducks/user';

const { authDelIdentify } = AuthCreators;
const { userLogout } = UserCreators;

export const passwordValidation = {
  regex: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{8,}$/,
  message: 'A senha deve possuir, no mínimo, 8 caracteres, letras maíusculas, minúsculas e números'
};

export const errorHandler = e => {
  const status = e.response ? e.response.status : e.code;

  if (status === 401) {
    store.dispatch(userLogout());
    store.dispatch(authDelIdentify());
  }

  return {
    error: e.response ? e.response.data : 'error',
    status,
    data: {}
  };
};

export const tokenDecode = token => JSON.parse(window.atob(token.split('.')[1]));

// convert array to object
export const toObject = (array, key) =>
  array.reduce(
    (object, item) => ({
      ...object,
      [item[key]]: item
    }),
    {}
  );

// transform a list to dataSource table
export const toDataSource = (list, uniqKey, toAdd = {}) =>
  !isEmpty(list)
    ? list.map((item, i) => {
        if (uniqKey) {
          return {
            ...item,
            ...toAdd,
            key: item[uniqKey],
            [uniqKey]: item[uniqKey]
          };
        }

        return {
          ...item,
          ...toAdd,
          key: i
        };
      })
    : [];

export const getFirstAndLastName = name => {
  if (!name) return '';

  const nameArray = name.split(' ');

  if (nameArray.length > 1) {
    return `${nameArray[0]} ${nameArray.slice(-1)}`;
  }

  return name;
};

export const getCorporalSurface = (weight, height) => Math.sqrt((weight * height) / 3600);

export const getIMC = (weight, height) => weight / (height / 100) ** 2;
