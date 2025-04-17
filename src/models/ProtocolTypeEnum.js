export class ProtocolTypeEnum {
  static PRESCRIPTION_AGG = 1;
  static PRESCRIPTION_INDIVIDUAL = 2;
  static PRESCRIPTION_ALL = 3;

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
      value: ProtocolTypeEnum.PRESCRIPTION_ALL,
      label: "Todos",
    },
  ];
}
