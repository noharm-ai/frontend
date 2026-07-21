export interface SubstanceOption {
  id: string;
  name: string;
}

export const formatSubstanceLabel = (option: SubstanceOption) =>
  `${option.id} - ${option.name}`;

// The substance endpoints expose the id as `sctid`; normalize to `id` here so
// the components can key off a single field.
export const normalizeSubstance = (item: any): SubstanceOption => ({
  id: String(item.sctid),
  name: item.name,
});
