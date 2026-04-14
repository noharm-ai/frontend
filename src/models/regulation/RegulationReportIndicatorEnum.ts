export class RegulationReportIndicatorEnum {
  static HPV_VACCINE = "HPV_VACCINE";
  static HPV_EXAM = "HPV_EXAM";
  static SEXUAL_ATTENTION_APPOINTMENT = "SEXUAL_ATTENTION_APPOINTMENT";
  static MAMMOGRAM_EXAM = "MAMMOGRAM_EXAM";
  static GESTATIONAL_APPOINTMENT = "GESTATIONAL_APPOINTMENT";
  static SEVEN_GESTATIONAL_APPOINTMENTS = "SEVEN_GESTATIONAL_APPOINTMENTS";
  static GESTATIONAL_PRESSURE_MEASUREMENTS =
    "GESTATIONAL_PRESSURE_MEASUREMENTS";
  static GESTATIONAL_WEIGHT_HEIGHT_MEASUREMENTS =
    "GESTATIONAL_WEIGHT_HEIGHT_MEASUREMENTS";

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
        label:
          "Gestante: Primeira consulta de pré-natal até 12 semanas de gestação",
      },
      {
        value: RegulationReportIndicatorEnum.SEVEN_GESTATIONAL_APPOINTMENTS,
        label: "Gestante: Mínimo de 7 consultas",
      },
      {
        value: RegulationReportIndicatorEnum.GESTATIONAL_PRESSURE_MEASUREMENTS,
        label: "Gestante: Mínimo de 7 registros de pressão na gestação",
      },
      {
        value:
          RegulationReportIndicatorEnum.GESTATIONAL_WEIGHT_HEIGHT_MEASUREMENTS,
        label: "Gestante: Mínimo de 7 registros de peso e altura ",
      },
    ].sort((a, b) => a.label.localeCompare(b.label));
}
