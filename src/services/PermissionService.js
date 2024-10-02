import isEmpty from "lodash.isempty";

const PermissionService = (permissions) => {
  const has = (f) => {
    if (isEmpty(permissions)) return false;

    return permissions.indexOf(f) !== -1;
  };

  return {
    has,
  };
};

export default PermissionService;
