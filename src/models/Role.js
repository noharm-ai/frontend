export default class Role {
  static ADMIN = "admin";
  static CONCILIATION = "concilia";
  static SUPPORT = "suporte";
  static TRANSCRIPTION = "transcription";
  static USER_ADMIN = "userAdmin";
  static NOLIMIT = "nolimit";
  static ALERT_BT = "alert-bt";
  static CPOE = "cpoe";
  static PRESCRIPTION_EDIT = "prescriptionEdit";
  static BETA_CARDS = "beta-cards";

  static getRoles(t) {
    return [
      { id: Role.ADMIN, label: t(`roles.${Role.ADMIN}`) },
      { id: Role.CONCILIATION, label: t(`roles.${Role.CONCILIATION}`) },
      { id: Role.SUPPORT, label: t(`roles.${Role.SUPPORT}`) },
      { id: Role.TRANSCRIPTION, label: t(`roles.${Role.TRANSCRIPTION}`) },
      { id: Role.USER_ADMIN, label: t(`roles.${Role.USER_ADMIN}`) },
      { id: Role.NOLIMIT, label: t(`roles.${Role.NOLIMIT}`) },
      { id: Role.ALERT_BT, label: t(`roles.${Role.ALERT_BT}`) },
      { id: Role.CPOE, label: t(`roles.${Role.CPOE}`) },
      {
        id: Role.PRESCRIPTION_EDIT,
        label: t(`roles.${Role.PRESCRIPTION_EDIT}`),
      },
      { id: Role.BETA_CARDS, label: t(`roles.${Role.BETA_CARDS}`) },
    ];
  }
}
