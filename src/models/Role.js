import Feature from "./Feature";

export default class Role {
  static PRESCRIPTION_ANALIST = "PRESCRIPTION_ANALYST";
  static USER_MANAGER = "USER_MANAGER";
  static CONFIG_MANAGER = "CONFIG_MANAGER";
  static DISCHARGE_MANAGER = "DISCHARGE_MANAGER";
  static DISPENSING_MANAGER = "DISPENSING_MANAGER";
  static VIEWER = "VIEWER";
  static REGULATOR = "REGULATOR";

  static CPOE = "cpoe"; //keep for compatibility (remove after transition)

  static getNewRoles(t, features) {
    const roles = [
      {
        id: Role.PRESCRIPTION_ANALIST,
        label: t(`roles.${Role.PRESCRIPTION_ANALIST}`),
        description: t(`rolesDescription.${Role.PRESCRIPTION_ANALIST}`),
      },
      {
        id: Role.CONFIG_MANAGER,
        label: t(`roles.${Role.CONFIG_MANAGER}`),
        description: t(`rolesDescription.${Role.CONFIG_MANAGER}`),
      },
      {
        id: Role.USER_MANAGER,
        label: t(`roles.${Role.USER_MANAGER}`),
        description: t(`rolesDescription.${Role.USER_MANAGER}`),
      },
    ];

    if (!features || features.indexOf(Feature.DISCHARGE_SUMMARY) !== -1) {
      roles.push({
        id: Role.DISCHARGE_MANAGER,
        label: t(`roles.${Role.DISCHARGE_MANAGER}`),
        description: t(`rolesDescription.${Role.DISCHARGE_MANAGER}`),
      });
    }

    if (!features || features.indexOf(Feature.PRESMED_FORM) !== -1) {
      roles.push({
        id: Role.DISPENSING_MANAGER,
        label: t(`roles.${Role.DISPENSING_MANAGER}`),
        description: t(`rolesDescription.${Role.DISPENSING_MANAGER}`),
      });
    }

    if (!features || features.indexOf(Feature.REGULATION) !== -1) {
      roles.push({
        id: Role.REGULATOR,
        label: t(`roles.${Role.REGULATOR}`),
        description: t(`rolesDescription.${Role.REGULATOR}`),
      });
    }

    roles.push({
      id: Role.VIEWER,
      label: t(`roles.${Role.VIEWER}`),
      description: t(`rolesDescription.${Role.VIEWER}`),
    });

    return roles;
  }
}
