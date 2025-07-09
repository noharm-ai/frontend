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
    ].sort((a, b) => a.label.localeCompare(b.label));

  static getOperators = (type: string) => {
    if (!type) return [];

    const fixedValueOperators = [
      ProtocolVariableFieldEnum.AGE,
      ProtocolVariableFieldEnum.WEIGHT,
      ProtocolVariableFieldEnum.EXAM,
      ProtocolVariableFieldEnum.ADMISSION_TIME,
      ProtocolVariableFieldEnum.ST_CONCILIA,
    ];

    if (fixedValueOperators.indexOf(type) !== -1) {
      return [">", ">=", "<", "<=", "=", "!="];
    }

    return ["IN", "NOTIN"];
  };
}
