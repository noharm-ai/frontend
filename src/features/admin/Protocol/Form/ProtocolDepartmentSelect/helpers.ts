export interface DepartmentOption {
  id: string;
  name: string;
}

export const formatDepartmentLabel = (option: DepartmentOption) =>
  `${option.name} (${option.id})`;

// The department endpoint exposes the id as `idDepartment` (fksetor);
// normalize to `id` here so the components can key off a single field.
export const normalizeDepartment = (item: any): DepartmentOption => ({
  id: String(item.idDepartment),
  name: item.name,
});
