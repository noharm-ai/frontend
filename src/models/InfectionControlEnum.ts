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

// why an antimicrobial is given, as judged in an evaluation
// (ci_avaliacao_atm.tp_tratamento)
export class AntimicrobialTreatmentTypeEnum {
  static EMPIRICAL = 1;
  static CULTURE_GUIDED = 2;
  static SURGICAL_PROPHYLAXIS = 3;
  static MEDICAL_PROPHYLAXIS = 4;

  // in the order they are offered
  static list = [
    AntimicrobialTreatmentTypeEnum.EMPIRICAL,
    AntimicrobialTreatmentTypeEnum.CULTURE_GUIDED,
    AntimicrobialTreatmentTypeEnum.SURGICAL_PROPHYLAXIS,
    AntimicrobialTreatmentTypeEnum.MEDICAL_PROPHYLAXIS,
  ];

  // given to prevent an infection: no focus is required
  static isProphylaxis = (type: number | null | undefined) =>
    type === AntimicrobialTreatmentTypeEnum.SURGICAL_PROPHYLAXIS ||
    type === AntimicrobialTreatmentTypeEnum.MEDICAL_PROPHYLAXIS;
}

// the infection focus an antimicrobial is given for, as judged in an
// evaluation (ci_avaliacao_atm.tp_foco_infeccao)
export class InfectionFocusEnum {
  static RESPIRATORY = 1;
  static UPPER_RESPIRATORY = 2;
  static URINARY = 3;
  static ABDOMINAL = 4;
  static GASTROINTESTINAL = 5;
  static SKIN_SOFT_TISSUE = 6;
  static BONE_JOINT = 7;
  static BLOODSTREAM = 8;
  static CENTRAL_NERVOUS_SYSTEM = 9;
  static CARDIOVASCULAR = 10;
  static SURGICAL_SITE = 11;
  static GYNECOLOGIC_OBSTETRIC = 12;
  static FEBRILE_NEUTROPENIA = 13;
  static UNKNOWN = 14;
  static OTHER = 15;

  // in the order they are offered
  static list = [
    InfectionFocusEnum.RESPIRATORY,
    InfectionFocusEnum.UPPER_RESPIRATORY,
    InfectionFocusEnum.URINARY,
    InfectionFocusEnum.ABDOMINAL,
    InfectionFocusEnum.GASTROINTESTINAL,
    InfectionFocusEnum.SKIN_SOFT_TISSUE,
    InfectionFocusEnum.BONE_JOINT,
    InfectionFocusEnum.BLOODSTREAM,
    InfectionFocusEnum.CENTRAL_NERVOUS_SYSTEM,
    InfectionFocusEnum.CARDIOVASCULAR,
    InfectionFocusEnum.SURGICAL_SITE,
    InfectionFocusEnum.GYNECOLOGIC_OBSTETRIC,
    InfectionFocusEnum.FEBRILE_NEUTROPENIA,
    InfectionFocusEnum.UNKNOWN,
    InfectionFocusEnum.OTHER,
  ];
}
