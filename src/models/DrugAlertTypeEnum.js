export default class DrugAlertTypeEnum {
  static ALLERGY = "allergy";
  static MAX_DOSE = "maxDose";
  static DM = "dm";
  static DT = "dt";
  static LIVER = "liver";
  static IY = "iy";
  static IT = "it";
  static IRA = "ira";
  static SL = "sl";
  static ELDERLY = "elderly";
  static KIDNEY = "kidney";
  static PLATELETS = "platelets";
  static RX = "rx";
  static TUBE = "tube";
  static MAX_TIME = "maxTime";
  static FASTING = "fasting";

  static getAlertTypes = (t) => {
    const types = [
      {
        id: DrugAlertTypeEnum.ALLERGY,
        label: t(`drugAlertType.${DrugAlertTypeEnum.ALLERGY}`),
      },
      {
        id: DrugAlertTypeEnum.MAX_DOSE,
        label: t(`drugAlertType.${DrugAlertTypeEnum.MAX_DOSE}`),
      },
      {
        id: DrugAlertTypeEnum.DM,
        label: t(`drugAlertType.${DrugAlertTypeEnum.DM}`),
      },
      {
        id: DrugAlertTypeEnum.DT,
        label: t(`drugAlertType.${DrugAlertTypeEnum.DT}`),
      },
      {
        id: DrugAlertTypeEnum.LIVER,
        label: t(`drugAlertType.${DrugAlertTypeEnum.LIVER}`),
      },
      {
        id: DrugAlertTypeEnum.IY,
        label: t(`drugAlertType.${DrugAlertTypeEnum.IY}`),
      },
      {
        id: DrugAlertTypeEnum.IT,
        label: t(`drugAlertType.${DrugAlertTypeEnum.IT}`),
      },

      {
        id: DrugAlertTypeEnum.IRA,
        label: t(`drugAlertType.${DrugAlertTypeEnum.IRA}`),
      },
      {
        id: DrugAlertTypeEnum.SL,
        label: t(`drugAlertType.${DrugAlertTypeEnum.SL}`),
      },
      {
        id: DrugAlertTypeEnum.ELDERLY,
        label: t(`drugAlertType.${DrugAlertTypeEnum.ELDERLY}`),
      },
      {
        id: DrugAlertTypeEnum.KIDNEY,
        label: t(`drugAlertType.${DrugAlertTypeEnum.KIDNEY}`),
      },
      {
        id: DrugAlertTypeEnum.PLATELETS,
        label: t(`drugAlertType.${DrugAlertTypeEnum.PLATELETS}`),
      },
      {
        id: DrugAlertTypeEnum.RX,
        label: t(`drugAlertType.${DrugAlertTypeEnum.RX}`),
      },
      {
        id: DrugAlertTypeEnum.TUBE,
        label: t(`drugAlertType.${DrugAlertTypeEnum.TUBE}`),
      },
      {
        id: DrugAlertTypeEnum.MAX_TIME,
        label: t(`drugAlertType.${DrugAlertTypeEnum.MAX_TIME}`),
      },
      {
        id: DrugAlertTypeEnum.FASTING,
        label: t(`drugAlertType.${DrugAlertTypeEnum.FASTING}`),
      },
    ];

    return types.sort((a, b) => `${a?.label}`.localeCompare(`${b?.label}`));
  };
}
