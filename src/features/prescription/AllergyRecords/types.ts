export interface IAllergyRecordDrug {
  name: string;
  sctid: string | null;
  substance: string | null;
}

export interface IAllergyRecord {
  /** fkmedicamento: does not always reference a medicamento record */
  idDrug: string | null;
  /** the medicamento of fkmedicamento, null when there is none */
  drug: IAllergyRecordDrug | null;
  /** the record's own name (nome_medicamento) */
  drugName: string | null;
  /** the record's own substance (alergia.sctid) */
  sctid: string | null;
  substance: string | null;
  active: boolean;
  createdAt: string | null;
}
