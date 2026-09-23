/**
 * The AWaRe classification of an antimicrobial (substancia.tp_nivel_atb,
 * backend AntimicrobialLevelEnum): how aggressive it is, from the WHO groups
 * Access (1), Watch (2) and Reserve (3), plus Not recommended (4), the WHO
 * group of the antimicrobials whose use it advises against.
 */

export const AWARE_ACCESS = 1;
export const AWARE_WATCH = 2;
export const AWARE_RESERVE = 3;
export const AWARE_NOT_RECOMMENDED = 4;

// least aggressive first; Not recommended is not a step further on that
// scale but a group apart, so it closes the list
export const AWARE_LEVELS = [
  AWARE_ACCESS,
  AWARE_WATCH,
  AWARE_RESERVE,
  AWARE_NOT_RECOMMENDED,
];

// a drug the scale does not place: said so, never guessed onto it
export const AWARE_UNKNOWN = "unknown";

export const AWARE_COLORS = {
  [AWARE_ACCESS]: "#7ebe9a",
  [AWARE_WATCH]: "#f0a04b",
  [AWARE_RESERVE]: "#f44336",
  [AWARE_NOT_RECOMMENDED]: "#7b1fa2",
  [AWARE_UNKNOWN]: "#bdbdbd",
};

// the translation / class key of a level
export const awareKey = (level) =>
  AWARE_LEVELS.includes(level) ? level : AWARE_UNKNOWN;

// whether the substance was placed on the scale at all: the column is curated
// apart from the card, so an antimicrobial with no level yet is a normal state
export const hasAwareLevel = (level) => AWARE_LEVELS.includes(level);
