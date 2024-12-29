export default class RegulationAction {
  static UPDATE_STAGE = 1;
  static SCHEDULE = 2;
  static SCHEDULE_TRANSPORT = 3;
  static SCHEDULE_EXTERNAL = 4;
  static UPDATE_TYPE = 5;
  static UPDATE_RISK = 6;
  static UNDO_SCHEDULE = 7;
  static UNDO_TRANSPORTATION_SCHEDULE = 8;

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
            label: "Código da solicitação",
            type: "plaintext",
            help: "Código da solicitação no sistema externo",
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
        id: RegulationAction.UPDATE_TYPE,
        label: t(`regulation.action.${RegulationAction.UPDATE_TYPE}`),
        form: [
          {
            id: "reg_type",
            label: "Tipo de solicitação",
            type: "reg_type",
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
        id: RegulationAction.UPDATE_RISK,
        label: t(`regulation.action.${RegulationAction.UPDATE_RISK}`),
        form: [
          {
            id: "reg_risk",
            label: "Risco",
            type: "reg_risk",
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
        id: RegulationAction.UNDO_SCHEDULE,
        label: t(`regulation.action.${RegulationAction.UNDO_SCHEDULE}`),
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
        id: RegulationAction.UNDO_TRANSPORTATION_SCHEDULE,
        label: t(
          `regulation.action.${RegulationAction.UNDO_TRANSPORTATION_SCHEDULE}`
        ),
        form: [
          {
            id: "observation",
            label: "Observação",
            type: "text",
            required: true,
          },
        ],
      },
    ].sort((a, b) => a.label.localeCompare(b.label));
  }

  static getForm(action, t) {
    return this.getActions(t).find((i) => i.id === action).form;
  }
}
