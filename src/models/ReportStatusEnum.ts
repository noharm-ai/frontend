export class ReportStatusEnum {
  static NOT_PROCESSED = 0;
  static PROCESSED = 1;
  static PROCESSING = 2;
  static ERROR = 3;

  static getConfig = (status: number) => {
    const configs = {
      [ReportStatusEnum.NOT_PROCESSED]: {
        name: "Não processado",
        color: "red",
      },
      [ReportStatusEnum.PROCESSED]: {
        name: "Processado",
        color: "green",
      },
      [ReportStatusEnum.PROCESSING]: {
        name: "Processando",
        color: "orange",
      },
      [ReportStatusEnum.ERROR]: {
        name: "Erro",
        color: "red",
      },
    };

    return configs[status] || { name: status, color: "default" };
  };
}
