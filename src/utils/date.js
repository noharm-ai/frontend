import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extend dayjs with timezone support
dayjs.extend(utc);
dayjs.extend(timezone);

export const formatDate = (isoDate, format = "DD/MM/YYYY") => {
  if (!isoDate) {
    return null;
  }

  return dayjs(isoDate).format(format);
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

/**
 * Calculates the difference in minutes between a server date (UTC-3) and current local time
 * @param {string} serverDate - Date string from server (always in UTC-3)
 * @returns {number} - Difference in minutes
 */
export const getMinutesDiffFromServerDate = (serverDate) => {
  if (!serverDate) {
    return Infinity;
  }

  // Parse server date and convert to local timezone
  const serverDateTime = serverDateToLocal(serverDate);

  // Get current time in user's local timezone
  const currentTime = dayjs();

  // Calculate difference in minutes
  return currentTime.diff(serverDateTime, "minutes");
};

/**
 * Converts a server date (UTC-3) to local timezone for display
 * @param {string} serverDate - Date string from server (always in UTC-3)
 * @returns {dayjs.Dayjs} - dayjs object in local timezone
 */
export const serverDateToLocal = (serverDate) => {
  if (!serverDate) {
    return null;
  }

  // Parse server date as UTC-3 and convert to local timezone
  return dayjs.tz(serverDate, "America/Sao_Paulo").local();
};
