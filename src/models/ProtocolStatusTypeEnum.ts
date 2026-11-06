export class ProtocolStatusTypeEnum {
  static INACTIVE = 0;
  static ACTIVE = 1;
  static STAGING = 2;

  static getList = () => [
    {
      value: ProtocolStatusTypeEnum.INACTIVE,
      label: "Inativo",
    },
    {
      value: ProtocolStatusTypeEnum.ACTIVE,
      label: "Ativo",
    },
    {
      value: ProtocolStatusTypeEnum.STAGING,
      label: "Homologação",
    },
  ];
}
