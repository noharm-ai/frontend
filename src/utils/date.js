import dayjs from "dayjs";

export const formatDate = (isoDate) => {
  if (!isoDate) {
    return null;
  }

  return dayjs(isoDate).format("DD/MM/YYYY");
};

export const formatDateTime = (isoDate) => {
  if (!isoDate) {
    return null;
  }

  return dayjs(isoDate).format("DD/MM/YYYY HH:mm");
};

export const isDate = (value) => {
  return (
    dayjs(value, "YYYY-MM-DD", true).isValid() ||
    dayjs(value, "YYYY-MM-DDTHH:mm:ss").isValid()
  );
};
