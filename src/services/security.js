import isEmpty from "lodash.isempty";
import intersection from "lodash.intersection";

import Role from "models/Role";

const security = (roles) => {
  const hasRole = (role) => {
    if (isEmpty(roles)) return false;

    return roles.indexOf(role) !== -1;
  };

  const hasAnyRole = (roleArray) => {
    if (isEmpty(roles)) return false;

    return intersection(roles, roleArray).length > 0;
  };

  const hasCpoe = () => {
    return hasRole(Role.CPOE);
  };

  const hasSummary = () => {
    return hasRole(Role.SUMMARY);
  };

  const isAdmin = () => {
    return hasRole(Role.ADMIN);
  };

  const isSupport = () => {
    return hasRole(Role.SUPPORT);
  };

  const isTraining = () => {
    return hasRole(Role.TRAINING);
  };

  const isDoctor = () => {
    return hasRole(Role.DOCTOR);
  };

  const isMultiSchema = () => {
    return hasRole(Role.MULTI_SCHEMA);
  };

  const hasUnlockCheckedPrescription = () => {
    return hasRole(Role.UNLOCK_CHECKED_PRESCRIPTION);
  };

  const isMaintainer = () => {
    return hasAnyRole([Role.ADMIN, Role.TRAINING]);
  };

  return {
    hasRole,
    hasAnyRole,
    hasCpoe,
    hasSummary,
    isAdmin,
    isSupport,
    isTraining,
    isDoctor,
    isMultiSchema,
    isMaintainer,
    hasUnlockCheckedPrescription,
  };
};

export default security;
