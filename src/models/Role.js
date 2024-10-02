export default class Role {
  static SUPPORT = "suporte";
  static TRAINING = "training";
  static USER_ADMIN = "userAdmin";
  static CPOE = "cpoe";
  static DOCTOR = "doctor";
  static SUMMARY = "summary";
  static READONLY = "readonly";
  static MULTI_SCHEMA = "multi-schema";
  static GETNAME_DISABLED = "getname-disabled";
  static UNLOCK_CHECKED_PRESCRIPTION = "unlock-checked-prescription";

  static PRESCRIPTION_ANALIST = "PRESCRIPTION_ANALYST";
  static USER_MANAGER = "USER_MANAGER";
  static CONFIG_MANAGER = "CONFIG_MANAGER";
  static DISCHARGE_MANAGER = "DISCHARGE_MANAGER";
  static DISPENSING_MANAGER = "DISPENSING_MANAGER";
  static VIEWER = "VIEWER";

  static getNewRoles(t) {
    return [
      {
        id: Role.PRESCRIPTION_ANALIST,
        label: t(`roles.${Role.PRESCRIPTION_ANALIST}`),
        description: t(`rolesDescription.${Role.PRESCRIPTION_ANALIST}`),
      },
      {
        id: Role.USER_MANAGER,
        label: t(`roles.${Role.USER_MANAGER}`),
        description: t(`rolesDescription.${Role.USER_MANAGER}`),
      },
      {
        id: Role.CONFIG_MANAGER,
        label: t(`roles.${Role.CONFIG_MANAGER}`),
        description: t(`rolesDescription.${Role.CONFIG_MANAGER}`),
      },
      {
        id: Role.DISCHARGE_MANAGER,
        label: t(`roles.${Role.DISCHARGE_MANAGER}`),
        description: t(`rolesDescription.${Role.DISCHARGE_MANAGER}`),
      },
      {
        id: Role.VIEWER,
        label: t(`roles.${Role.VIEWER}`),
        description: t(`rolesDescription.${Role.VIEWER}`),
      },
      {
        id: Role.DISPENSING_MANAGER,
        label: t(`roles.${Role.DISPENSING_MANAGER}`),
        description: t(`rolesDescription.${Role.DISPENSING_MANAGER}`),
      },
    ];
  }

  static getRoles(t) {
    return [
      { id: Role.USER_ADMIN, label: t(`roles.${Role.USER_ADMIN}`) },
      { id: Role.CPOE, label: t(`roles.${Role.CPOE}`) },
      {
        id: Role.DOCTOR,
        label: t(`roles.${Role.DOCTOR}`),
      },

      {
        id: Role.SUMMARY,
        label: t(`roles.${Role.SUMMARY}`),
      },
      {
        id: Role.READONLY,
        label: t(`roles.${Role.READONLY}`),
      },
      {
        id: Role.UNLOCK_CHECKED_PRESCRIPTION,
        label: t(`roles.${Role.UNLOCK_CHECKED_PRESCRIPTION}`),
      },
    ];
  }

  static getLoginRoles(t) {
    return [
      { id: Role.CPOE, label: t(`roles.${Role.CPOE}`) },
      {
        id: Role.DOCTOR,
        label: t(`roles.${Role.DOCTOR}`),
      },
    ];
  }
}
