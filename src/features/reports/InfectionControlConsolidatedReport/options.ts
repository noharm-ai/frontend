import {
  AWARE_ACCESS,
  AWARE_COLORS,
  AWARE_NOT_RECOMMENDED,
  AWARE_RESERVE,
  AWARE_UNKNOWN,
  AWARE_WATCH,
} from "features/culture/awareLevel";

// the record in force on an antimicrobial day (dia_atb.situacao_registro)
export const REGISTRY_STATUSES = [
  "conforming",
  "non_conforming",
  "not_evaluated",
  "expired",
] as const;

export const REGISTRY_COLORS: Record<string, string> = {
  conforming: "#74b077",
  non_conforming: "#e6744e",
  not_evaluated: "#bdbdbd",
  expired: "#f2b530",
};

// the AWaRe groups as the service names them (consumption.awareMix)
export const AWARE_GROUPS: { key: string; color: string }[] = [
  { key: "access", color: AWARE_COLORS[AWARE_ACCESS] },
  { key: "watch", color: AWARE_COLORS[AWARE_WATCH] },
  { key: "reserve", color: AWARE_COLORS[AWARE_RESERVE] },
  { key: "not_recommended", color: AWARE_COLORS[AWARE_NOT_RECOMMENDED] },
  { key: "unclassified", color: AWARE_COLORS[AWARE_UNKNOWN] },
];

export const ROUTES = ["iv", "oral", "other", "unknown"];

export const ROUTE_COLORS: Record<string, string> = {
  iv: "#1e88e5",
  oral: "#74b077",
  other: "#f2b530",
  unknown: "#bdbdbd",
};

export const ADJUSTMENTS = [
  "suspension",
  "de_escalation",
  "same_level",
  "escalation",
  "substitution",
];
