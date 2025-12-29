export class ProtocolTypeEnum {
  static PRESCRIPTION_AGG = 1;
  static PRESCRIPTION_INDIVIDUAL = 2;
  static PRESCRIPTION_ALL = 3;
  static PRESCRIPTION_ITEM = 4;

  static getList = () => [
    {
      value: ProtocolTypeEnum.PRESCRIPTION_AGG,
      label: "Paciente-Dia",
    },
    {
      value: ProtocolTypeEnum.PRESCRIPTION_INDIVIDUAL,
      label: "Prescrição Individual",
    },
    {
      value: ProtocolTypeEnum.PRESCRIPTION_ITEM,
      label: "Item prescrito",
    },
    {
      value: ProtocolTypeEnum.PRESCRIPTION_ALL,
      label: "Paciente-Dia e Prescrição Individual",
    },
  ];
}
