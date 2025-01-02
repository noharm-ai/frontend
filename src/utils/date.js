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
    dayjs(`${value}`.split(".")[0], "YYYY-MM-DDTHH:mm:ss", true).isValid()
  );
};

export const datepickerRangeLimit =
  (maxDays) =>
  (current, { from }) => {
    if (from) {
      return Math.abs(current.diff(from, "days")) >= maxDays;
    }
    return false;
  };
