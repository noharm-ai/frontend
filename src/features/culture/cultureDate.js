import moment from "moment";

// the details modal is where the dates are actually read, and the hour of a
// release is part of the reading: two collections of the same day are told
// apart by it
export const formatDate = (date) =>
  date ? moment(date).format("DD/MM/YYYY HH:mm") : "-";
