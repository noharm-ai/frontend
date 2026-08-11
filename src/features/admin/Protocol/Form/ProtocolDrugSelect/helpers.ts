export interface DrugOption {
  id: string;
  name: string;
}

export const formatDrugLabel = (option: DrugOption) =>
  `${option.id} - ${option.name}`;

// The drug endpoints expose the id as `idDrug`; normalize to `id` here so the
// components can key off a single field.
export const normalizeDrug = (item: any): DrugOption => ({
  id: String(item.idDrug),
  name: item.name,
});
