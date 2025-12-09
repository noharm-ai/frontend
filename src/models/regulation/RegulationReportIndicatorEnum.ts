export class RegulationReportIndicatorEnum {
  static HPV_VACCINE = "HPV_VACCINE";
  static HPV_EXAM = "HPV_EXAM";
  static SEXUAL_ATTENTION_APPOINTMENT = "SEXUAL_ATTENTION_APPOINTMENT";
  static MAMMOGRAM_EXAM = "MAMMOGRAM_EXAM";
  static GESTATIONAL_APPOINTMENT = "GESTATIONAL_APPOINTMENT";

  static getList = () =>
    [
      {
        value: RegulationReportIndicatorEnum.HPV_VACCINE,
        label: "Prevenção do Câncer: Vacina HPV",
      },
      {
        value: RegulationReportIndicatorEnum.HPV_EXAM,
        label: "Prevenção do Câncer: Exame de rastreio do colo de útero",
      },
      {
        value: RegulationReportIndicatorEnum.SEXUAL_ATTENTION_APPOINTMENT,
        label: "Prevenção do Câncer: Atenção à saúde sexual e reprodutiva",
      },
      {
        value: RegulationReportIndicatorEnum.MAMMOGRAM_EXAM,
        label: "Prevenção do Câncer: Mamografia",
      },
      {
        value: RegulationReportIndicatorEnum.GESTATIONAL_APPOINTMENT,
        label: "Gestante: Consulta gestacional",
      },
    ].sort((a, b) => a.label.localeCompare(b.label));
}
