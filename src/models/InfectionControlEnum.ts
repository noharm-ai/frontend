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
}

// status of an antimicrobial evaluation (ci_avaliacao_atm.tp_status)
export class AntimicrobialEvaluationStatusEnum {
  static ACTIVE = 1;
  static SUPERSEDED = 2;
  static CLOSED = 3;
}
