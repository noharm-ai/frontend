import isEmpty from "lodash.isempty";
import intersection from "lodash.intersection";

import { store } from "store/index";

const PermissionService = () => {
  const has = (f) => {
    const permissions = store.getState().user.account.permissions;

    if (isEmpty(permissions)) return false;

    return permissions.indexOf(f) !== -1;
  };

  const hasAny = (pArray) => {
    const permissions = store.getState().user.account.permissions;

    if (isEmpty(permissions)) return false;

    return intersection(permissions, pArray).length > 0;
  };

  return {
    has,
    hasAny,
  };
};

export default PermissionService;
