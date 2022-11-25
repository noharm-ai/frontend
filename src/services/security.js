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

  const hasAlertIntegration = () => {
    return hasRole(Role.ALERT_BT);
  };

  const hasCpoe = () => {
    return hasRole(Role.CPOE);
  };

  const hasTranscription = () => {
    return hasRole(Role.TRANSCRIPTION);
  };

  const hasPrescriptionEdit = () => {
    return hasRole(Role.PRESCRIPTION_EDIT);
  };

  const isAdmin = () => {
    return hasRole(Role.ADMIN);
  };

  const isSupport = () => {
    return hasRole(Role.SUPPORT);
  };

  return {
    hasRole,
    hasAnyRole,
    hasAlertIntegration,
    hasCpoe,
    hasTranscription,
    hasPrescriptionEdit,
    isAdmin,
    isSupport,
  };
};

export default security;
