import isEmpty from 'lodash.isempty';

const security = roles => {
  const hasRole = role => {
    if (isEmpty(roles)) return false;

    return roles.indexOf(role) !== -1;
  };

  const hasNoHarmCare = () => {
    return hasRole('care');
  };

  const isAdmin = () => {
    return hasRole('admin');
  };

  return {
    hasRole,
    hasNoHarmCare,
    isAdmin
  };
};

export default security;
