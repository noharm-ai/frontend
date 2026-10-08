/**
 * Infection control follow-up enums, mirroring the backend (models/enums.py)
 */

// status of a followed admission (ci_atendimento.tp_status)
export class InfectionControlStatusEnum {
  static PENDING = 1;
  static REVISED = 2;
  static CLOSED = 3;

  static getColor = (status: number | null | undefined) => {
    switch (status) {
      case InfectionControlStatusEnum.PENDING:
        return "orange";
      case InfectionControlStatusEnum.REVISED:
        return "green";
      default:
        return "default";
    }
  };
}

// why an admission is pending (ci_pendencia.tp_pendencia)
export class InfectionControlPendingTypeEnum {
  static NEVER_REVIEWED = 1;
  static NO_EVALUATION = 2;
  static EXPIRED = 3;
  static SCHEDULED_DATE = 4;
  static ALERT_FIRED = 5;
  // the posology changed from the evaluated one (a trigger the evaluation
  // opts into)
  static POSOLOGY_CHANGED = 6;
}

// status of an antimicrobial evaluation (ci_avaliacao_atm.tp_status)
export class AntimicrobialEvaluationStatusEnum {
  static ACTIVE = 1;
  static SUPERSEDED = 2;
  static CLOSED = 3;
}

// why an antimicrobial evaluation stopped being active
// (ci_avaliacao_atm.tp_encerramento)
export class AntimicrobialEvaluationClosingEnum {
  static SUPERSEDED = 1;
  static COURSE_ENDED = 2;
  static DISCHARGE = 3;
  // recorded for a period over before the evaluation in force started: it
  // went straight to the history
  static RETROACTIVE = 4;
}
