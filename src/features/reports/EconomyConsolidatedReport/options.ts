export const ECONOMY_TYPE_COLORS = {
  suspension: "#9789D9",
  substitution: "#F78B52",
  custom: "#4FB3BF",
};

export const ECONOMY_TYPE_OPTIONS = [
  { label: "Suspensão", value: 1 },
  { label: "Substituição", value: 2 },
  { label: "Customizada", value: 3 },
  { label: "Todos", value: "" },
];

export const ECONOMY_VALUE_TYPE_OPTIONS = [
  { label: "Negativo", value: "n" },
  { label: "Positivo", value: "p" },
  { label: "Todos", value: "" },
];

export const STATUS_OPTIONS = [
  { label: "Aceita", value: "a" },
  { label: "Justificada", value: "j" },
  { label: "Não Aceita", value: "n" },
  { label: "Não se Aplica", value: "x" },
];

const labelOf = (options: { label: string; value: any }[], value: any) =>
  options.find((o) => o.value === value)?.label ?? value;

/** Translate raw filter codes into the labels shown in the printed filter list. */
export const describeFilters = (apiParams: any) => ({
  ...apiParams,
  economy_type: apiParams.economy_type?.length
    ? apiParams.economy_type.map((v: number) =>
        labelOf(ECONOMY_TYPE_OPTIONS, v),
      )
    : [],
  economy_value_type: apiParams.economy_value_type
    ? labelOf(ECONOMY_VALUE_TYPE_OPTIONS, apiParams.economy_value_type)
    : null,
  status: apiParams.status?.length
    ? apiParams.status.map((v: string) => labelOf(STATUS_OPTIONS, v))
    : [],
});
