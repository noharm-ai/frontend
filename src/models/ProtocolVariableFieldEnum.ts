export class ProtocolVariableFieldEnum {
  static SUBSTANCE = "substance";
  static ID_DRUG = "idDrug";
  static DRUG_CLASS = "class";
  static ROUTE = "route";
  static EXAM = "exam";
  static AGE = "age";
  static WEIGHT = "weight";
  static ID_DEPARTMENT = "idDepartment";
  static ID_SEGMENT = "idSegment";
  static COMBINATION = "combination";
  static ADMISSION_TIME = "admissionTime";
  static ST_CONCILIA = "stConcilia";
  static CN_STATS = "cn_stats";
  static ID_ICD = "idIcd";
  static DISCHARGE_REASON = "dischargeReason";

  static getList = () =>
    [
      {
        value: ProtocolVariableFieldEnum.SUBSTANCE,
        label: "Substância (sctid)",
      },
      {
        value: ProtocolVariableFieldEnum.ID_DRUG,
        label: "Medicamento (fkmedicamento)",
      },
      {
        value: ProtocolVariableFieldEnum.DRUG_CLASS,
        label: "Classe do medicamento",
      },
      {
        value: ProtocolVariableFieldEnum.ROUTE,
        label: "Via",
      },
      {
        value: ProtocolVariableFieldEnum.EXAM,
        label: "Exame",
      },
      {
        value: ProtocolVariableFieldEnum.AGE,
        label: "Idade",
      },
      {
        value: ProtocolVariableFieldEnum.WEIGHT,
        label: "Peso (kg)",
      },
      {
        value: ProtocolVariableFieldEnum.ID_DEPARTMENT,
        label: "Setor (fksetor)",
      },
      {
        value: ProtocolVariableFieldEnum.ID_SEGMENT,
        label: "Segmento (idsegmento)",
      },
      {
        value: ProtocolVariableFieldEnum.COMBINATION,
        label: "Combo",
      },
      {
        value: ProtocolVariableFieldEnum.ADMISSION_TIME,
        label: "Tempo de internação (horas)",
      },
      {
        value: ProtocolVariableFieldEnum.ST_CONCILIA,
        label: "Possui conciliação (0 ou 1)",
      },
      {
        value: ProtocolVariableFieldEnum.CN_STATS,
        label: "Indicador NoHarm Care",
      },
      {
        value: ProtocolVariableFieldEnum.ID_ICD,
        label: "CID (id_cid)",
      },
      {
        value: ProtocolVariableFieldEnum.DISCHARGE_REASON,
        label: "Motivo alta",
      },
    ].sort((a, b) => a.label.localeCompare(b.label));

  static getOperators = (type: string) => {
    if (!type) return [];

    const fixedValueOperators = [
      ProtocolVariableFieldEnum.AGE,
      ProtocolVariableFieldEnum.WEIGHT,
      ProtocolVariableFieldEnum.EXAM,
      ProtocolVariableFieldEnum.ADMISSION_TIME,
      ProtocolVariableFieldEnum.ST_CONCILIA,
      ProtocolVariableFieldEnum.CN_STATS,
    ];

    const containOperators = [ProtocolVariableFieldEnum.DISCHARGE_REASON];

    if (containOperators.indexOf(type) !== -1) {
      return ["CONTAINS"];
    }

    if (fixedValueOperators.indexOf(type) !== -1) {
      return [">", ">=", "<", "<=", "=", "!="];
    }

    return ["IN", "NOTIN"];
  };
}
