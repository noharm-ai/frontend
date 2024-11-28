export default class RegulationAction {
  static UPDATE_STAGE = 1;
  static SCHEDULE = 2;
  static SCHEDULE_TRANSPORT = 3;
  static SCHEDULE_EXTERNAL = 4;

  static getActions(t) {
    return [
      {
        id: RegulationAction.SCHEDULE,
        label: t(`regulation.action.${RegulationAction.SCHEDULE}`),
        form: [
          {
            id: "scheduleDate",
            label: "Data de agendamento",
            type: "datetime",
            required: true,
          },
          {
            id: "observation",
            label: "Observação",
            type: "text",
            required: true,
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
            required: true,
          },
        ],
      },
      {
        id: RegulationAction.SCHEDULE_TRANSPORT,
        label: t(`regulation.action.${RegulationAction.SCHEDULE_TRANSPORT}`),
        form: [
          {
            id: "transportationDate",
            label: "Data de transporte",
            type: "datetime",
            required: true,
          },
          {
            id: "observation",
            label: "Observação",
            type: "text",
            required: true,
          },
        ],
      },
      {
        id: RegulationAction.SCHEDULE_EXTERNAL,
        label: t(`regulation.action.${RegulationAction.SCHEDULE_EXTERNAL}`),
        form: [
          {
            id: "externalRegulationSystem",
            label: "Sistema externo",
            type: "options",
            options: ["SISREG", "OUTRO"],
            required: true,
          },
          {
            id: "externalRegulationProtocol",
            label: "Protocolo",
            type: "plaintext",
            required: true,
          },
          {
            id: "observation",
            label: "Observação",
            type: "text",
            required: true,
          },
        ],
      },
    ];
  }

  static getForm(action, t) {
    return this.getActions(t).find((i) => i.id === action).form;
  }
}
