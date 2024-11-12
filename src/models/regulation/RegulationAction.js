export default class RegulationAction {
  static SCHEDULE = "SCHEDULE";
  static UPDATE_STAGE = "UPDATE_STAGE";
  static SCHEDULE_TRANSPORT = "SCHEDULE_TRANSPORT";

  static getActions(t) {
    return [
      {
        id: RegulationAction.SCHEDULE,
        label: t(`regulation.action.${RegulationAction.SCHEDULE}`),
        form: [
          {
            id: "scheduleDate",
            label: "Data de agendamento",
            type: "date",
            required: false,
          },
          {
            id: "observation",
            label: "Observação",
            type: "text",
            required: false,
          },
        ],
      },
      {
        id: RegulationAction.UPDATE_STAGE,
        label: t(`regulation.action.${RegulationAction.UPDATE_STAGE}`),
        form: [
          {
            id: "observation",
            label: "Observação",
            type: "text",
            required: false,
          },
        ],
      },
      {
        id: RegulationAction.SCHEDULE_TRANSPORT,
        label: t(`regulation.action.${RegulationAction.SCHEDULE_TRANSPORT}`),
        form: [
          {
            id: "observation",
            label: "Observação",
            type: "text",
            required: false,
          },
        ],
      },
    ];
  }

  static getForm(action, t) {
    return this.getActions(t).find((i) => i.id === action).form;
  }
}
