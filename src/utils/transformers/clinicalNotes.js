import { uniq } from "utils/lodash";

export const flatClinicalNotes = (groups) => {
  const flatList = [];
  Object.keys(groups).forEach((key) => {
    groups[key].forEach((i) => flatList.push(i));
  });

  return flatList;
};

export const getPositionList = (clinicalNotes) => {
  const positions = [];

  clinicalNotes.forEach((c) => {
    if (c.position && c.position !== "") {
      positions.push(c.position);
    }
  });

  return uniq(positions).sort();
};
