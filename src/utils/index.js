import { isEmpty } from "lodash";

import { store } from "store";
import { Creators as AuthCreators } from "../store/ducks/auth";
import { Creators as UserCreators } from "../store/ducks/user";
import { getStorageItem } from "./storage";

const { authDelIdentify } = AuthCreators;
const { userLogout } = UserCreators;

export const passwordValidation = {
  regex: /^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{8,}$/,
  message:
    "A senha deve possuir, no mínimo, 8 caracteres, letras maíusculas, minúsculas e números",
};

export const errorHandler = (e) => {
  const status = e.response ? e.response.status : e.code;

  const isLogged = getStorageItem("ac1") != null;

  if (status === 401 && !isLogged) {
    store.dispatch(userLogout());
    store.dispatch(authDelIdentify());
  }

  return {
    error: e?.response?.data || "error",
    status,
    data: {},
  };
};

export const tokenDecode = (token) => {
  const payload = token.split(".")[1];
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return JSON.parse(window.atob(padded));
};

// convert array to object
export const toObject = (array, key) =>
  array.reduce(
    (object, item) => ({
      ...object,
      [item[key]]: item,
    }),
    {},
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
            [uniqKey]: item[uniqKey],
          };
        }

        return {
          ...item,
          ...toAdd,
          key: i,
        };
      })
    : [];

export const getFirstAndLastName = (name) => {
  if (!name) return "";

  const nameArray = name.split(" ");

  if (nameArray.length > 1) {
    return `${nameArray[0]} ${nameArray.slice(-1)}`;
  }

  return name;
};

export const getCorporalSurface = (weight, height) =>
  Math.sqrt((weight * height) / 3600);

export const getIMC = (weight, height) => weight / (height / 100) ** 2;

export const translateFrequencyDay = (frequencyDay) => {
  const fixed = [33, 44, 55, 66, 99];

  if (fixed.includes(frequencyDay)) {
    return `Fixa (${frequencyDay})`;
  }

  return frequencyDay;
};
