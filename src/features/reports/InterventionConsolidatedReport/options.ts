export const STATUS_OPTIONS = [
  { label: "Aceita", value: "a", field: "total_accepted", color: "#90BF71" },
  {
    label: "Justificada",
    value: "j",
    field: "total_justified",
    color: "#69C1CD",
  },
  {
    label: "Não Aceita",
    value: "n",
    field: "total_not_accepted",
    color: "#E6744E",
  },
  {
    label: "Não se Aplica",
    value: "x",
    field: "total_not_applicable",
    color: "#ccc",
  },
  { label: "Pendente", value: "s", field: "total_pending", color: "#FACA5A" },
];

const labelOf = (value: string) =>
  STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;

/** Translate raw filter codes into the labels shown in the printed filter list. */
export const describeFilters = (apiParams: any) => ({
  ...apiParams,
  status: apiParams.status?.length
    ? apiParams.status.map((v: string) => labelOf(v))
    : [],
});

/** Interventions that already have an outcome (accepted, justified or not accepted). */
export const getAccountable = (totals: any) =>
  (totals?.total_accepted || 0) +
  (totals?.total_justified || 0) +
  (totals?.total_not_accepted || 0);

export const getAcceptedPercentage = (totals: any) => {
  const accountable = getAccountable(totals);

  return accountable
    ? Math.round(((totals?.total_accepted || 0) * 100) / accountable)
    : 0;
};
