export default class RegulationStage {
  static INITIAL = "INITIAL";
  static WAITING_SCHEDULE = "WAITING_SCHEDULE";
  static FINISHED = "FINISHED";

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
        id: RegulationStage.FINISHED,
        label: t(`regulation.stage.${RegulationStage.FINISHED}`),
        color: "green",
      },
    ];
  }
}
