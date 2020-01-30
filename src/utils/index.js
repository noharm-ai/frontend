import isEmpty from 'lodash.isempty';

export const errorHandler = e => ({ error: e.response.data, status: e.response.status });

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
    ? list.map(item => ({
        ...item,
        ...toAdd,
        key: item[uniqKey],
        [uniqKey]: item[uniqKey]
      }))
    : [];
