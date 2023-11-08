import { uniq } from "utils/lodash";

export const flatClinicalNotes = (groups) => {
  const flatList = [];

  Object.keys(groups).forEach((key) => {
    if (groups[key]?.roles) {
      flatList.push(...groups[key].roles);
    }
  });

  return flatList;
};

export const getPositionList = (list) => {
  return uniq(list).sort();
};
