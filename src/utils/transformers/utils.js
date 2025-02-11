import slugify from "slugify";
import { isEmpty } from "lodash";
import moment from "moment";

const noValues = [0, "None", null, undefined];

export const stringify = (data = [], noValueSymbol = "#", separator = " | ") =>
  !isEmpty(data)
    ? data
        .map((item) => (noValues.includes(item) ? noValueSymbol : item))
        .join(separator)
    : "";

export const createSlug = function (/* arguments */) {
  const args = arguments;
  return slugify(Array.from(args).join("-")).toLowerCase();
};

export const formatAge = (birthdate) => {
  const now = moment();
  const mBirthdate = moment(birthdate);

  const years = now.diff(mBirthdate, "year");
  if (years > 2) {
    return `${years}a`;
  }

  mBirthdate.add(years, "years");

  const months = now.diff(mBirthdate, "months");
  mBirthdate.add(months, "months");

  const days = now.diff(mBirthdate, "days");

  if (years === 0) {
    return `${months}m ${days}d`;
  }

  return `${years}a ${months}m ${days}d`;
};

export const textToHtml = (obs) => {
  if (obs && obs !== "None") {
    return obs.replace(/(?:\r\n|\r|\n)/g, "<br>");
  }

  return "--";
};
