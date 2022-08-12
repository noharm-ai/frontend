import isEmpty from "lodash.isempty";

import Role from "models/Role";

const security = (roles) => {
  const hasRole = (role) => {
    if (isEmpty(roles)) return false;

    return roles.indexOf(role) !== -1;
  };

  const hasNoHarmCare = () => {
    return hasRole(Role.CARE);
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
    hasNoHarmCare,
    hasAlertIntegration,
    hasCpoe,
    hasTranscription,
    hasPrescriptionEdit,
    isAdmin,
    isSupport,
  };
};

export default security;
