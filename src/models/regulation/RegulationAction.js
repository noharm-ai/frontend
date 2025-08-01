import RegulationStage from "./RegulationStage";

export default class RegulationAction {
  static UPDATE_STAGE = 1;
  static SCHEDULE = 2;
  static SCHEDULE_TRANSPORT = 3;
  static SCHEDULE_EXTERNAL = 4;
  static UPDATE_TYPE = 5;
  static UPDATE_RISK = 6;
  static UNDO_SCHEDULE = 7;
  static UNDO_TRANSPORTATION_SCHEDULE = 8;
  static CLOSE = 9;
  static CANCEL = 10;

  static getActions(t) {
    return [
      {
        id: RegulationAction.SCHEDULE,
        label: t(`regulation.action.${RegulationAction.SCHEDULE}`),
        validNextStages: [],
        invalidNextStages: [RegulationStage.CANCELED, RegulationStage.FINISHED],
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
        validNextStages: [],
        invalidNextStages: [RegulationStage.CANCELED, RegulationStage.FINISHED],
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
        validNextStages: [],
        invalidNextStages: [RegulationStage.CANCELED, RegulationStage.FINISHED],
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
        validNextStages: [],
        invalidNextStages: [RegulationStage.CANCELED, RegulationStage.FINISHED],
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
        validNextStages: [],
        invalidNextStages: [RegulationStage.CANCELED, RegulationStage.FINISHED],
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
        validNextStages: [],
        invalidNextStages: [RegulationStage.CANCELED, RegulationStage.FINISHED],
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
        validNextStages: [],
        invalidNextStages: [RegulationStage.CANCELED, RegulationStage.FINISHED],
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
        validNextStages: [],
        invalidNextStages: [RegulationStage.CANCELED, RegulationStage.FINISHED],
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
        id: RegulationAction.CLOSE,
        label: t(`regulation.action.${RegulationAction.CLOSE}`),
        validNextStages: [RegulationStage.FINISHED],
        invalidNextStages: [],
        form: [
          {
            id: "desfecho_finalizado",
            label: "Desfecho",
            type: "options",
            options: [
              "Consulta realizada",
              "Paciente faltante",
              "Sem registro do comparecimento",
              "Regulado por outro setor",
            ],
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
        id: RegulationAction.CANCEL,
        label: t(`regulation.action.${RegulationAction.CANCEL}`),
        validNextStages: [RegulationStage.CANCELED],
        invalidNextStages: [],
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

  static getNextStages(action, t) {
    if (!action) {
      return [];
    }

    let validStages = this.getActions(t).find(
      (i) => i.id === action
    ).validNextStages;
    const invalidStages = this.getActions(t).find(
      (i) => i.id === action
    ).invalidNextStages;

    if (validStages.length === 0) {
      validStages = RegulationStage.getStages(t).map((s) => s.id);
    }

    return RegulationStage.getStages(t)
      .filter((s) => validStages.indexOf(s.id) !== -1)
      .filter((s) => invalidStages.indexOf(s.id) === -1);
  }
}
