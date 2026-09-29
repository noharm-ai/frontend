// the prediction accents: each says what was predicted, and neither is the
// red or the green of a released antibiogram, which a pending collection
// must never be read as. A prediction the backend could not classify keeps
// the plain prediction purple
export const PREDICTED_RESISTANT = "#f0a04b";
export const PREDICTED_SUSCEPTIBLE = "#5fb2d8";
export const PREDICTED_UNKNOWN = "#a991d6";

// the left bar carries the whole reading of the row. A prediction is checked
// before resistance on purpose: a predicted resistant drug is still a pending
// collection, and it must not be read in the same red as a released
// antibiogram
export const accentColor = (props) => {
  if (props.$prediction) {
    if (props.$resistant) return PREDICTED_RESISTANT;
    if (props.$susceptible) return PREDICTED_SUSCEPTIBLE;

    return PREDICTED_UNKNOWN;
  }
  if (props.$resistant) return "#f44336";
  if (props.$susceptible) return "#7ebe9a";

  // a result the backend could not classify (CultureResultTypeEnum.UNKNOWN):
  // it is not a sensitivity, so it does not get the green bar
  return "#e0e0e0";
};
