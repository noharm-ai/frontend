export default class RegulationStage {
  static INITIAL = 0;
  static WAITING_SCHEDULE = 1;
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
        id: RegulationStage.WAITING_SCHEDULE,
        label: t(`regulation.stage.${RegulationStage.WAITING_SCHEDULE}`),
        color: "blue",
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
    ];
  }
}
