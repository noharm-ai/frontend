import isEmpty from 'lodash.isempty';

export const passwordValidation = {
  regex: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{8,}$/,
  message: 'A senha deve possuir, no mínimo, 8 caracteres, letras maíusculas, minúsculas e números'
};

export const errorHandler = e => ({
  error: e.response ? e.response.data : 'error',
  status: e.response ? e.response.status : e.code,
  data: {}
});

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
