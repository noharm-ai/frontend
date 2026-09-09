/**
 * How a culture result is read, shared by the culture card and by the exams
 * card that hosts it. The rules mirror the backend: services/culture_service
 * classifies the antibiogram and services/alert_service compares it to the
 * prescription.
 */

// the backend classifies the free text of the antibiogram (culture_service
// RESULT_TYPES) and predictions share the same alphabet
export const RESULT_RESISTANT = "R";

// a pending culture is shown through the prediction, which must never be
// presented as if it were the lab result
export const isPrediction = (item) => !item.result;

export const resultTypeOf = (item) =>
  isPrediction(item) ? item.predictionType : item.resultType;

// the item that represents the drug: the backend puts the released results
// first (culture_service._group_by_drug), so a drug that has an antibiogram is
// never read through a prediction of a pending collection
export const currentItemOf = (drug) => (drug.items || [])[0];

/**
 * A released resistant antibiogram for a drug the prescription carries.
 *
 * This is the same comparison that raises the cultureResistant alert on the
 * item (services/alert_service), and the finding the card has to make
 * impossible to miss. A predicted resistance never qualifies: the collection
 * is still pending and the prediction must not be read as the lab result.
 */
export const isResistantInUse = (drug) => {
  const current = currentItemOf(drug);

  if (!current) {
    return false;
  }

  return Boolean(
    drug.prescribed &&
    !isPrediction(current) &&
    current.resultType === RESULT_RESISTANT,
  );
};

export const countResistantInUse = (cultures) =>
  (cultures || []).filter(isResistantInUse).length;
