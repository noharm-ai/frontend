import { uniq } from "utils/lodash";

export const flatClinicalNotes = (
  groups: Record<string, { roles?: string[] } | undefined>
) => {
  const flatList: string[] = [];

  Object.keys(groups).forEach((key) => {
    if (groups[key]?.roles) {
      flatList.push(...groups[key].roles);
    }
  });

  return flatList;
};

export const getPositionList = (list: string[]) => {
  return uniq(list).sort();
};
