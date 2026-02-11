export class CrmStageEnum {
  static SIGNED = 1;
  static CLIENT_INFRA = 150;
  static INTEGRATION = 13;
  static INTERNAL_CONFIG = 151;
  static VALIDATION = 3;
  static TRAINING = 4;
  static PRODUCTION = 5;
  static CANCELED = 22;

  static getName = (value: number) => {
    return CrmStageEnum.getConfig(value).name;
  };

  static getConfig = (value: number) => {
    const configs: { [key: number]: { name: string } } = {
      [CrmStageEnum.SIGNED]: { name: "Assinado" },
      [CrmStageEnum.CLIENT_INFRA]: { name: "Infra Cliente" },
      [CrmStageEnum.INTEGRATION]: { name: "Integração" },
      [CrmStageEnum.INTERNAL_CONFIG]: { name: "Curadoria" },
      [CrmStageEnum.VALIDATION]: { name: "Validação" },
      [CrmStageEnum.TRAINING]: { name: "Treinamento" },
      [CrmStageEnum.PRODUCTION]: { name: "Produção" },
      [CrmStageEnum.CANCELED]: { name: "Cancelado" },
    };

    return configs[value] || { name: "" };
  };

  static getList = () => {
    const list = [];
    for (const key in CrmStageEnum) {
      const value = CrmStageEnum[key as keyof typeof CrmStageEnum];
      if (typeof value === "number") {
        list.push({
          label: CrmStageEnum.getName(value),
          value: value,
        });
      }
    }

    return list;
  };
}
