import isEmpty from 'lodash.isempty';

const security = roles => {
  const hasRole = role => {
    if (isEmpty(roles)) return false;

    return roles.indexOf(role) !== -1;
  };

  const hasNoHarmCare = () => {
    return hasRole('care');
  };

  const hasAlertIntegration = () => {
    return hasRole('alert-bt');
  };

  const isAdmin = () => {
    return hasRole('admin');
  };

  const isSupport = () => {
    return hasRole('suporte');
  };

  return {
    hasRole,
    hasNoHarmCare,
    hasAlertIntegration,
    isAdmin,
    isSupport
  };
};

export default security;
