export default class DrugAlertInteractionTypeEnum {
  static DM = "dm";
  static DT = "dt";
  static IT = "it";
  static IY = "iy";
  static RX = "rx";
  static SL = "sl";

  static getAlertInteractionTypes = (t) => {
    const types = [
      {
        id: DrugAlertInteractionTypeEnum.DM,
        label: t(`drugAlertType.${DrugAlertInteractionTypeEnum.DM}`),
      },
      {
        id: DrugAlertInteractionTypeEnum.DT,
        label: t(`drugAlertType.${DrugAlertInteractionTypeEnum.DT}`),
      },
      {
        id: DrugAlertInteractionTypeEnum.IT,
        label: t(`drugAlertType.${DrugAlertInteractionTypeEnum.IT}`),
      },
      {
        id: DrugAlertInteractionTypeEnum.IY,
        label: t(`drugAlertType.${DrugAlertInteractionTypeEnum.IY}`),
      },
      {
        id: DrugAlertInteractionTypeEnum.RX,
        label: t(`drugAlertType.${DrugAlertInteractionTypeEnum.RX}`),
      },
      {
        id: DrugAlertInteractionTypeEnum.SL,
        label: t(`drugAlertType.${DrugAlertInteractionTypeEnum.SL}`),
      },
    ];

    return types.sort((a, b) => `${a?.label}`.localeCompare(`${b?.label}`));
  };
}
