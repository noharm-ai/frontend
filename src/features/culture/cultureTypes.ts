/**
 * The cultures of the patient as the backend returns them
 * (GET /prescriptions/:id/cultures, services/culture_service).
 */

// resultType / predictionType: R (resistant), S (susceptible), or the
// CultureResultTypeEnum.UNKNOWN of a text the backend could not classify
export type CultureResultType = string;

// one collection of a drug: a released antibiogram, or a pending collection
// read through its prediction
export interface ICultureItem {
  key?: string | null;
  idExamItem?: number | null;
  microorganism?: string | null;
  material?: string | null;
  result?: string | null;
  resultType?: CultureResultType | null;
  resultDetail?: string | null;
  // MIC (minimum inhibitory concentration) as the lab reports it, qualifier
  // included ("<=0.5"): only a released antibiogram carries one
  mic?: string | null;
  prediction?: string | null;
  predictionType?: CultureResultType | null;
  probability?: number | null;
  collectionDate?: string | null;
  releaseDate?: string | null;
}

// a drug of the antibiogram and its collections, the worst released result
// first (culture_service._order_items)
export interface ICultureDrug {
  drug: string;
  sctid?: number | string | null;
  idSubstanceClass?: string | null;
  // whether the prescription being screened carries the drug
  prescribed?: boolean;
  // AWaRe level (awareLevel)
  atbLevel?: number | null;
  items: ICultureItem[];
}
