export default class Role {
  static ADMIN = "admin";
  static SUPPORT = "suporte";
  static TRAINING = "training";
  static TRANSCRIPTION = "transcription";
  static USER_ADMIN = "userAdmin";
  static ALERT_BT = "alert-bt";
  static CPOE = "cpoe";
  static PRESCRIPTION_EDIT = "prescriptionEdit";
  static PRESMED_FORM = "presmed-form";
  static DOCTOR = "doctor";
  static SUMMARY = "summary";
  static READONLY = "readonly";
  static MULTI_SCHEMA = "multi-schema";
  static GETNAME_DISABLED = "getname-disabled";
  static UNLOCK_CHECKED_PRESCRIPTION = "unlock-checked-prescription";

  static getRoles(t) {
    return [
      { id: Role.TRANSCRIPTION, label: t(`roles.${Role.TRANSCRIPTION}`) },
      { id: Role.USER_ADMIN, label: t(`roles.${Role.USER_ADMIN}`) },
      { id: Role.ALERT_BT, label: t(`roles.${Role.ALERT_BT}`) },
      { id: Role.CPOE, label: t(`roles.${Role.CPOE}`) },
      {
        id: Role.PRESCRIPTION_EDIT,
        label: t(`roles.${Role.PRESCRIPTION_EDIT}`),
      },
      {
        id: Role.PRESMED_FORM,
        label: t(`roles.${Role.PRESMED_FORM}`),
      },
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
      { id: Role.TRANSCRIPTION, label: t(`roles.${Role.TRANSCRIPTION}`) },
      { id: Role.ALERT_BT, label: t(`roles.${Role.ALERT_BT}`) },
      { id: Role.CPOE, label: t(`roles.${Role.CPOE}`) },
      {
        id: Role.PRESCRIPTION_EDIT,
        label: t(`roles.${Role.PRESCRIPTION_EDIT}`),
      },
      {
        id: Role.PRESMED_FORM,
        label: t(`roles.${Role.PRESMED_FORM}`),
      },
      {
        id: Role.DOCTOR,
        label: t(`roles.${Role.DOCTOR}`),
      },
    ];
  }
}
