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
