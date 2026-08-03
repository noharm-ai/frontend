// Option lists shared between the variable editor (where the user picks them)
// and the trigger description (where they are rendered back as prose). Keeping
// a single source avoids the labels drifting apart between the two views.

export interface IProtocolOption {
  value: string | number;
  label: string;
}

export const DRUG_ATTRIBUTE_OPTIONS: IProtocolOption[] = [
  { value: "mav", label: "Alta Vigilância" },
  { value: "antimicro", label: "Antimicrobiano" },
  { value: "controlled", label: "Controlado" },
  { value: "dialyzable", label: "Dializavel" },
  { value: "elderly", label: "Inapropriado para idosos" },
  { value: "notdefault", label: "Não Padronizado" },
  { value: "chemo", label: "Quimioterápico" },
];

export const SEGMENT_TYPE_OPTIONS: IProtocolOption[] = [
  { value: 1, label: "ADULTO" },
  { value: 2, label: "PEDIÁTRICO" },
];

export const ST_CONCILIA_OPTIONS: IProtocolOption[] = [
  { value: 0, label: "não possui conciliação" },
  { value: 1, label: "possui conciliação" },
];

export function findOptionLabel(
  options: IProtocolOption[],
  value: any
): string | undefined {
  const option = options.find((o) => String(o.value) === String(value));

  return option?.label;
}
