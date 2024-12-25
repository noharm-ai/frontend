export default class RegulationStage {
  static INITIAL = 0;
  static AWAITING_SCHEDULE = 1;
  static AWAITING_RESCHEDULE = 2;
  static AWAITING_PATIENT_NOTICE = 3;
  static AWAITING_TRANSPORTATION_SCHEDULE = 4;
  static AWAITING_DOCUMENTATION = 5;
  static AWAITING_COMPLETION = 6;
  static AWAITING_EXTERNAL = 7;
  static AWAITING_INFO = 8;
  static CANCELED = 98;
  static FINISHED = 99;

  static getStages(t) {
    return [
      {
        id: RegulationStage.INITIAL,
        label: t(`regulation.stage.${RegulationStage.INITIAL}`),
        color: "default",
      },
      {
        id: RegulationStage.AWAITING_SCHEDULE,
        label: t(`regulation.stage.${RegulationStage.AWAITING_SCHEDULE}`),
        color: "orange",
      },
      {
        id: RegulationStage.AWAITING_RESCHEDULE,
        label: t(`regulation.stage.${RegulationStage.AWAITING_RESCHEDULE}`),
        color: "orange",
      },
      {
        id: RegulationStage.AWAITING_PATIENT_NOTICE,
        label: t(`regulation.stage.${RegulationStage.AWAITING_PATIENT_NOTICE}`),
        color: "orange",
      },
      {
        id: RegulationStage.AWAITING_TRANSPORTATION_SCHEDULE,
        label: t(
          `regulation.stage.${RegulationStage.AWAITING_TRANSPORTATION_SCHEDULE}`
        ),
        color: "orange",
      },
      {
        id: RegulationStage.AWAITING_DOCUMENTATION,
        label: t(`regulation.stage.${RegulationStage.AWAITING_DOCUMENTATION}`),
        color: "orange",
      },
      {
        id: RegulationStage.AWAITING_COMPLETION,
        label: t(`regulation.stage.${RegulationStage.AWAITING_COMPLETION}`),
        color: "orange",
      },
      {
        id: RegulationStage.AWAITING_EXTERNAL,
        label: t(`regulation.stage.${RegulationStage.AWAITING_EXTERNAL}`),
        color: "orange",
      },
      {
        id: RegulationStage.AWAITING_INFO,
        label: t(`regulation.stage.${RegulationStage.AWAITING_INFO}`),
        color: "orange",
      },
      {
        id: RegulationStage.CANCELED,
        label: t(`regulation.stage.${RegulationStage.CANCELED}`),
        color: "red",
      },
      {
        id: RegulationStage.FINISHED,
        label: t(`regulation.stage.${RegulationStage.FINISHED}`),
        color: "green",
      },
    ].sort((a, b) => a.label.localeCompare(b.label));
  }
}
